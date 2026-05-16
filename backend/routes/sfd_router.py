from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from database import SessionLocal

from models import (
    SFDDocument,
    Project,
    TestCase
)

import requests
import os
import json
import re

router = APIRouter()

API_KEY = os.getenv("OPENROUTER_API_KEY")

PROMPT = """
Tu es un expert QA senior spécialisé exclusivement en tests fonctionnels métier.

MISSION :
Analyser le SFD puis générer un très grand nombre de cas de tests métier réalistes.

OBJECTIF PRINCIPAL :
Maximiser la couverture fonctionnelle métier.

INTERDICTIONS STRICTES :
Ne jamais générer :
- tests techniques
- tests unitaires
- tests API
- tests backend
- tests SQL
- tests performance
- tests sécurité technique
- tests code source

INTERDICTION DE VOCABULAIRE TECHNIQUE :
Ne jamais utiliser :
endpoint, request, response, API, SQL,
database, backend, frontend, JSON,
code, méthode, fonction, pytest,
assertion, payload.

FOCUS OBLIGATOIRE :
- règles métier
- comportement utilisateur
- workflow métier
- validations métier
- scénarios réels
- erreurs métier
- cas limites métier
- dépendances métier
- variantes fonctionnelles

OBLIGATION :
Générer un maximum de scénarios métier possibles.

FORMAT JSON STRICT :

[
  {
    "id": "TM001",

    "parent_test_id": null,

    "version": 1,

    "status": "draft",

    "titre": "Description métier",

    "regle_metier":
      "Description complète de la règle métier",

    "preconditions": [],

    "etapes": [],

    "donnees_entree": {},

    "resultats_attendus": [],

    "priorite": "Haute",

    "severite": "Critique",

    "type": "Nominal"
  }
]

CONTRAINTES :
- JSON uniquement
- Aucun texte hors JSON
- Tous les champs obligatoires
- Résultats attendus = LISTE
- Étapes = LISTE minimum 2
- Générer minimum 20 cas de tests
- Retourner uniquement le tableau JSON

SFD :
"""


# =========================
# REQUEST MODELS
# =========================

class SFDCreateRequest(BaseModel):

    title: str

    content: str

    parent_id: Optional[int] = None


class SFDGenerateRequest(BaseModel):

    sfd_title: str

    sfd_content: str


# =========================
# GET PROJECT SFD
# =========================

@router.get(
    "/projects/{project_id}/sfd"
)
def get_sfd_list(
    project_id: int
):

    db = SessionLocal()

    try:

        # CHECK PROJECT
        project = db.query(Project).filter(
            Project.id == project_id
        ).first()

        if not project:

            raise HTTPException(
                status_code=404,
                detail="Projet non trouvé"
            )

        # STATS
        total_sfd = db.query(
            SFDDocument
        ).filter(
            SFDDocument.project_id == project_id
        ).count()

        sfds = db.query(
            SFDDocument
        ).filter(
            SFDDocument.project_id == project_id
        ).order_by(
            SFDDocument.created_at.desc()
        ).all()

        sfd_ids = [s.id for s in sfds]

        total_tests = db.query(
            TestCase
        ).filter(
            TestCase.sfd_id.in_(sfd_ids)
        ).count() if sfd_ids else 0

        total_validated = db.query(
            TestCase
        ).filter(
            TestCase.sfd_id.in_(sfd_ids),
            TestCase.status == "approved"
        ).count() if sfd_ids else 0

        total_draft = db.query(
            TestCase
        ).filter(
            TestCase.sfd_id.in_(sfd_ids),
            TestCase.status == "draft"
        ).count() if sfd_ids else 0

        total_critical = db.query(
            TestCase
        ).filter(
            TestCase.sfd_id.in_(sfd_ids),
            TestCase.priorite == "Haute"
        ).count() if sfd_ids else 0

        # SFD LIST
        sfd_list = []

        for sfd in sfds:

            test_count = db.query(
                TestCase
            ).filter(
                TestCase.sfd_id == sfd.id
            ).count()

            sfd_list.append({

                "id":
                    sfd.id,

                "title":
                    sfd.title,

                "content_preview":

                    sfd.content[:100] + "..."

                    if sfd.content
                    and len(sfd.content) > 100

                    else sfd.content,

                "project_id":
                    sfd.project_id,

                "parent_id":
                    sfd.parent_id,

                "test_count":
                    test_count,

                "date":

                    str(sfd.created_at)[:10]

                    if sfd.created_at

                    else "N/A"
            })

        return {

            "project": {

                "id":
                    project.id,

                "name":
                    project.name
            },

            "statistics": {

                "total_sfd":
                    total_sfd,

                "total_tests":
                    total_tests,

                "total_validated":
                    total_validated,

                "total_draft":
                    total_draft,

                "total_critical":
                    total_critical
            },

            "sfd_list":
                sfd_list
        }

    finally:
        db.close()


# =========================
# CREATE SFD
# =========================

@router.post(
    "/projects/{project_id}/sfd"
)
def create_sfd(
    project_id: int,
    request: SFDCreateRequest
):

    db = SessionLocal()

    try:

        # CHECK PROJECT
        project = db.query(Project).filter(
            Project.id == project_id
        ).first()

        if not project:

            raise HTTPException(
                status_code=404,
                detail="Projet non trouvé"
            )

        # CREATE SFD
        sfd_doc = SFDDocument(

            project_id=project.id,

            parent_id=request.parent_id,

            title=request.title,

            content=request.content
        )

        db.add(sfd_doc)

        db.commit()

        db.refresh(sfd_doc)

        return {

            "message":
                "SFD créé avec succès",

            "project": {

                "id":
                    project.id,

                "name":
                    project.name
            },

            "sfd": {

                "id":
                    sfd_doc.id,

                "title":
                    sfd_doc.title
            }
        }

    finally:
        db.close()


# =========================
# GENERATE TESTS FROM SFD
# =========================

@router.post(
    "/projects/{project_id}/sfd/generate"
)
def generate_tests_from_sfd(
    project_id: int,
    request: SFDGenerateRequest
):

    if not API_KEY:

        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY manquante"
        )

    db = SessionLocal()

    try:

        # CHECK PROJECT
        project = db.query(Project).filter(
            Project.id == project_id
        ).first()

        if not project:

            raise HTTPException(
                status_code=404,
                detail="Projet non trouvé"
            )

        # OPENROUTER HEADERS
        headers = {

            "Authorization":
                f"Bearer {API_KEY}",

            "Content-Type":
                "application/json"
        }

        # PAYLOAD
        payload = {

            "model":
                "openrouter/auto",

            "temperature":
                0.1,

            "messages": [

                {
                    "role": "user",

                    "content":
                        PROMPT + request.sfd_content
                }
            ]
        }

        # API CALL
        try:

            res = requests.post(

                "https://openrouter.ai/api/v1/chat/completions",

                headers=headers,

                json=payload,

                timeout=60
            )

            data = res.json()

            content = data[
                "choices"
            ][0]["message"]["content"]

        except Exception as e:

            raise HTTPException(
                status_code=500,
                detail=f"Erreur API IA: {e}"
            )

        # CLEAN JSON
        try:

            text = re.sub(
                r"```json",
                "",
                content
            )

            text = re.sub(
                r"```",
                "",
                text
            ).strip()

            start = text.find("[")

            end = text.rfind("]")

            if start == -1 or end == -1:

                raise ValueError(
                    "JSON non trouvé"
                )

            tests = json.loads(
                text[start:end + 1]
            )

            if not isinstance(
                tests,
                list
            ):

                raise HTTPException(
                    status_code=500,
                    detail="Format IA invalide"
                )

        except Exception as e:

            raise HTTPException(
                status_code=500,
                detail=f"Erreur parsing: {e}"
            )

        # CREATE SFD
        sfd_doc = SFDDocument(

            project_id=project.id,

            title=request.sfd_title,

            content=request.sfd_content
        )

        db.add(sfd_doc)

        db.commit()

        db.refresh(sfd_doc)

        # SAVE TESTS
        saved = 0

        for t in tests:

            # VALIDATION
            if not isinstance(
                t.get("etapes"),
                list
            ):

                continue

            if len(
                t.get("etapes", [])
            ) < 2:

                continue

            if not isinstance(
                t.get(
                    "resultats_attendus"
                ),
                list
            ):

                continue

            test_case = TestCase(

                sfd_id=sfd_doc.id,

                version=t.get(
                    "version",
                    1
                ),

                title=t.get(
                    "titre"
                ),

                regle_metier=t.get(
                    "regle_metier"
                ),

                priorite=t.get(
                    "priorite",
                    "Moyenne"
                ),

                severite=t.get(
                    "severite",
                    "Moyenne"
                ),

                type=t.get(
                    "type",
                    "Nominal"
                ),

                score=0,

                status=t.get(
                    "status",
                    "draft"
                ),

                ai_confidence=95,

                generated_script=""
            )

            db.add(test_case)

            saved += 1

        db.commit()

        return {

            "message":
                "Tests générés avec succès",

            "project": {

                "id":
                    project.id,

                "name":
                    project.name
            },

            "sfd": {

                "id":
                    sfd_doc.id,

                "title":
                    sfd_doc.title
            },

            "statistics": {

                "generated":
                    len(tests),

                "saved":
                    saved
            }
        }

    finally:
        db.close()