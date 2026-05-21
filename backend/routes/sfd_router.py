from pydantic import BaseModel
from typing import Optional
from PyPDF2 import PdfReader
import io
from database import SessionLocal
from models import TestStep

from models import (
    SFDDocument,
    Project,
    TestCase,
    TestStep
)
from fastapi import (
    APIRouter,
    HTTPException,
    UploadFile,
    File
)
import requests
import os
import json
import re
from PyPDF2 import PdfReader

router = APIRouter()

API_KEY = os.getenv("OPENROUTER_API_KEY")

PROMPT = """
Tu es un expert QA senior spécialisé exclusivement en tests fonctionnels métier.
IMPORTANT ABSOLU :

Le système doit générer les tests
UNIQUEMENT à partir du SFD fourni.

Interdiction totale d’inventer :
- ecommerce
- commandes
- clients
- factures
- paiements
- devis
- CRM
- modules non présents dans le SFD

Le domaine métier doit être déduit
strictement du document SFD.

Si le SFD concerne TodoMVC,
les tests doivent porter uniquement sur :
- ajout tâche
- suppression tâche
- filtres
- tâches complétées
- compteur tâches
- workflow todo

Ne jamais réutiliser des anciens scénarios
d’autres projets.
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


# =====================================================
# REQUEST MODELS
# =====================================================

class SFDCreateRequest(BaseModel):

    requirement_id: str

    module: str

    priority: str

    version: str

    title: str

    description: str

    validation_conditions: str

    status: str

    parent_id: Optional[int] = None


class SFDGenerateRequest(BaseModel):

    sfd_title: str

    sfd_content: str


# =====================================================
# GET SFD LIST
# =====================================================

@router.get(
    "/projects/{project_id}/sfd"
)
def get_sfd_list(project_id: int):

    db = SessionLocal()

    try:

        project = db.query(Project).filter(
            Project.id == project_id
        ).first()

        if not project:

            raise HTTPException(
                status_code=404,
                detail="Projet non trouvé"
            )

        sfds = db.query(
            SFDDocument
        ).filter(
            SFDDocument.project_id == project_id
        ).all()

        requirements = []

        for sfd in sfds:

            test_count = db.query(
                TestCase
            ).filter(
                TestCase.sfd_id == sfd.id
            ).count()

            requirements.append({

                "id":
                    sfd.id,

                "requirement_id":
                    sfd.requirement_id,

                "module":
                    sfd.module,

                "priority":
                    sfd.priority,

                "version":
                    sfd.version,

                "title":
                    sfd.title,

                "description":
                    sfd.description,

                "validation_conditions":
                    sfd.validation_conditions,

                "status":
                    sfd.status,

                "tests":
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

            "requirements":
                requirements,

            "total":
                len(requirements)
        }

    finally:

        db.close()


# =====================================================
# CREATE SFD
# =====================================================

@router.post(
    "/projects/{project_id}/sfd"
)
def create_sfd(

    project_id: int,

    request: SFDCreateRequest
):

    db = SessionLocal()

    try:

        project = db.query(Project).filter(
            Project.id == project_id
        ).first()

        if not project:

            raise HTTPException(
                status_code=404,
                detail="Projet non trouvé"
            )

        sfd_doc = SFDDocument(

            project_id=project.id,

            parent_id=request.parent_id,

            requirement_id=
                request.requirement_id,

            module=
                request.module,

            priority=
                request.priority,

            version=
                request.version,

            title=
                request.title,

            description=
                request.description,

            validation_conditions=
                request.validation_conditions,

            status=
                request.status
        )

        db.add(sfd_doc)

        db.commit()

        db.refresh(sfd_doc)

        return {

            "message":
                "SFD créé avec succès",

            "sfd": {

                "id":
                    sfd_doc.id,

                "title":
                    sfd_doc.title
            }
        }

    finally:

        db.close()


# =====================================================
# GENERATE TESTS FROM SFD
# =====================================================

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

        project = db.query(Project).filter(
            Project.id == project_id
        ).first()

        if not project:

            raise HTTPException(
                status_code=404,
                detail="Projet non trouvé"
            )

        headers = {

            "Authorization":
                f"Bearer {API_KEY}",

            "Content-Type":
                "application/json"
        }

        payload = {

            "model":
                "openrouter/auto",

            "temperature":
                0.1,

            "messages": [

                {
                    "role": "user",

                    "content":
                        PROMPT +
                        request.sfd_content
                }
            ]
        }

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
                    "JSON invalide"
                )

            tests = json.loads(
                text[start:end + 1]
            )

        except Exception as e:

            raise HTTPException(
                status_code=500,
                detail=f"Erreur parsing: {e}"
            )

        # CREATE AUTO SFD

        sfd_doc = SFDDocument(

            project_id=project.id,

            requirement_id="AUTO",

            module="AUTO",

            priority="Haute",

            version="v1.0",

            title=request.sfd_title,

            description=request.sfd_content,

            validation_conditions="IA",

            status="Draft"
        )

        db.add(sfd_doc)

        db.commit()

        db.refresh(sfd_doc)
        # SAVE TESTS
        # SAVE TESTS

        saved = 0

        for index, t in enumerate(tests):

            test_case = TestCase(

                project_id=project.id,

                sfd_id=sfd_doc.id,

                version=t.get(
                    "version",
                    1
                ),

                title=(

                    t.get("titre")

                    or t.get("title")

                    or f"Scénario métier {index + 1}"
                ),

                regle_metier=(

                    t.get("regle_metier")

                    or t.get("scenario")

                    or t.get("description")

                    or "Règle métier automatique"
                ),

                priorite=(

                    t.get("priorite")

                    or t.get("priority")

                    or "Moyenne"
                ),

                severite=(

                    t.get("severite")

                    or t.get("severity")

                    or "Moyenne"
                ),

                type=(

                    t.get("type")

                    or "Nominal"
                ),

                score=95,

                status=(

                    t.get("status")

                    or "draft"
                ),

                ai_confidence=95
            )

            db.add(test_case)

            db.flush()

            # SAVE STEPS

            for idx, step_text in enumerate(

                t.get("steps")

                or t.get("etapes")

                or []
            ):

                step = TestStep(

                    test_case_id=test_case.id,

                    step_order=idx + 1,

                    description=step_text
                )

                db.add(step)

            saved += 1

        db.commit()

        return {

            "message":
                "Tests IA générés",

            "generated":
                len(tests),

            "saved":
                saved
        }

    finally:

        db.close()

# =====================================================
# UPLOAD SFD FILE
# =====================================================

# =====================================================
# UPLOAD SFD FILE
# =====================================================

@router.post(
    "/projects/{project_id}/sfd/upload"
)
async def upload_sfd_file(

    project_id: int,

    file: UploadFile = File(...)
):

    db = SessionLocal()

    try:

        project = db.query(Project).filter(
            Project.id == project_id
        ).first()

        if not project:

            raise HTTPException(

                status_code=404,

                detail="Projet introuvable"
            )

        # =========================
        # CREATE UPLOADS FOLDER
        # =========================

        os.makedirs(
            "uploads",
            exist_ok=True
        )

        filepath = (
            f"uploads/{file.filename}"
        )

        # =========================
        # READ FILE
        # =========================

        content = await file.read()

        # SAVE FILE

        with open(
            filepath,
            "wb"
        ) as f:

            f.write(content)

        # =========================
        # EXTRACT PDF TEXT
        # =========================

        extracted_text = ""

        if file.filename.endswith(".pdf"):

            pdf_reader = PdfReader(
                io.BytesIO(content)
            )

            for page in pdf_reader.pages:

                text = page.extract_text()

                if text:

                    extracted_text += (
                        text + "\n"
                    )

        else:

            extracted_text = (
                content.decode(
                    "utf-8",
                    errors="ignore"
                )
            )

        # =========================
        # SAVE SFD
        # =========================
        # =========================
        # SAVE SFD
        # =========================

        sfd = SFDDocument(

            project_id=project.id,

            requirement_id="AUTO",

            module="UPLOAD",

            priority="Haute",

            version="v1.0",

            title=file.filename,

            description=extracted_text,

            validation_conditions=
                "Upload automatique",

            status="Draft"
        )

        db.add(sfd)

        db.commit()

        db.refresh(sfd)

        # =========================
        # GENERATE IA TESTS
        # =========================

        headers = {

            "Authorization":
                f"Bearer {API_KEY}",

            "Content-Type":
                "application/json"
        }

        payload = {

            "model":
                "openrouter/auto",

            "temperature":
                0.1,

            "messages": [

                {
                    "role": "user",

                    "content":
                        PROMPT + extracted_text
                }
            ]
        }

        res = requests.post(

            "https://openrouter.ai/api/v1/chat/completions",

            headers=headers,

            json=payload,

            timeout=60
        )

        data = res.json()

        content_ai = data[
            "choices"
        ][0]["message"]["content"]

        # =========================
        # CLEAN JSON
        # =========================

        text = re.sub(
            r"```json",
            "",
            content_ai
        )

        text = re.sub(
            r"```",
            "",
            text
        ).strip()

        start = text.find("[")

        end = text.rfind("]")

        tests = json.loads(
            text[start:end + 1]
        )

        # =========================
        # SAVE TESTS
        # =========================

        saved = 0

        for index, t in enumerate(tests):

            test_case = TestCase(

                project_id=project.id,

                sfd_id=sfd.id,

                version=t.get(
                    "version",
                    1
                ),

                title=t.get(
                    "titre",
                    f"Test {index + 1}"
                ),

                regle_metier=t.get(
                    "regle_metier",
                    "Règle métier"
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

                score=95,

                status=t.get(
                    "status",
                    "draft"
                ),

                ai_confidence=95
            )

            db.add(test_case)

            db.flush()

            for idx, step_text in enumerate(

                t.get("etapes", [])
            ):

                step = TestStep(

                    test_case_id=test_case.id,

                    step_order=idx + 1,

                    description=step_text
                )

                db.add(step)

            saved += 1

        db.commit()

        return {

            "message":
                "SFD uploadé + tests générés",

            "sfd_id":
                sfd.id,

            "generated_tests":
                saved,

            "filename":
                file.filename,

            "preview":
                extracted_text[:500]
        }
    finally:

        db.close()