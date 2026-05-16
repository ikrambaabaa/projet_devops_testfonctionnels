from fastapi import (
    APIRouter,
    HTTPException
)

from pydantic import BaseModel

from database import SessionLocal

from models import (
    TestCase,
    SFDDocument,
    Project
)

import requests
import os
import json
import re

router = APIRouter()

API_KEY = os.getenv("OPENROUTER_API_KEY")


# =========================
# REQUEST MODELS
# =========================

class GenerateScriptRequest(BaseModel):

    sfd_content: str

    sfd_title: str


class StatusUpdateRequest(BaseModel):

    status: str


# =========================
# GET PROJECT TESTS
# =========================

@router.get(
    "/projects/{project_id}/tests"
)
def get_tests(
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

        # GET SFD IDS
        sfd_ids = [

            s.id

            for s in db.query(
                SFDDocument
            ).filter(
                SFDDocument.project_id == project_id
            ).all()
        ]

        # QUERY
        query = db.query(TestCase).filter(
            TestCase.sfd_id.in_(sfd_ids)
        ) if sfd_ids else []

        # STATS
        total_tests = (
            query.count()
            if sfd_ids
            else 0
        )

        total_draft = (

            query.filter(
                TestCase.status == "draft"
            ).count()

            if sfd_ids

            else 0
        )

        total_approved = (

            query.filter(
                TestCase.status == "approved"
            ).count()

            if sfd_ids

            else 0
        )

        total_critical = (

            query.filter(
                TestCase.priorite == "Haute"
            ).count()

            if sfd_ids

            else 0
        )

        coverage = (

            round(
                (
                    total_approved
                    / total_tests
                ) * 100
            )

            if total_tests > 0

            else 0
        )

        # TESTS
        tests = (

            query.order_by(
                TestCase.created_at.desc()
            ).limit(50).all()

            if sfd_ids

            else []
        )

        test_list = []

        for t in tests:

            test_list.append({

                "id":
                    f"TM-{t.id:03d}",

                "titre":
                    t.title,

                "regle_metier":
                    t.regle_metier,

                "priorite":
                    t.priorite,

                "severite":
                    t.severite,

                "type":
                    t.type,

                "score":
                    t.score,

                "status":
                    t.status,

                "version":
                    t.version,

                "ai_confidence":
                    t.ai_confidence,

                "sfd_id":
                    t.sfd_id,

                "date":

                    str(t.created_at)[:10]

                    if t.created_at

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

                "total_tests":
                    total_tests,

                "total_draft":
                    total_draft,

                "total_approved":
                    total_approved,

                "total_critical":
                    total_critical,

                "coverage":
                    coverage
            },

            "tests":
                test_list
        }

    finally:
        db.close()


# =========================
# GENERATE PLAYWRIGHT SCRIPT
# =========================

@router.post(
    "/projects/{project_id}/tests/generate-script"
)
def generate_playwright_script(
    project_id: int,
    request: GenerateScriptRequest
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

        prompt = f'''
Tu es un expert QA Playwright.

À partir de ce SFD métier,
génère un script Playwright complet.

RÈGLES :
- Utiliser @playwright/test
- Tests fonctionnels uniquement
- Assertions métier
- Sélecteurs réalistes
- Format CommonJS

SFD :
{request.sfd_content}

Retourner uniquement le code JavaScript.
'''

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
                    "content": prompt
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

            script = data[
                "choices"
            ][0]["message"]["content"]

            # CLEAN
            script = re.sub(
                r"```javascript",
                "",
                script
            )

            script = re.sub(
                r"```js",
                "",
                script
            )

            script = re.sub(
                r"```",
                "",
                script
            ).strip()

        except Exception as e:

            raise HTTPException(
                status_code=500,
                detail=f"Erreur IA: {e}"
            )

        # SAVE FILE
        try:

            os.makedirs(
                "generated_tests",
                exist_ok=True
            )

            file_path = os.path.join(

                "generated_tests",

                f"project_{project.id}.spec.cjs"
            )

            with open(

                file_path,

                "w",

                encoding="utf-8"

            ) as f:

                f.write(script)

            saved = True

        except Exception:

            saved = False

        return {

            "message":
                "Script généré",

            "project": {

                "id":
                    project.id,

                "name":
                    project.name
            },

            "saved_to_file":
                saved,

            "script_path":
                file_path,

            "script":
                script
        }

    finally:
        db.close()


# =========================
# GET TEST DETAIL
# =========================

@router.get(
    "/projects/{project_id}/tests/{test_id}"
)
def get_test_detail(
    project_id: int,
    test_id: int
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

        test = db.query(TestCase).filter(
            TestCase.id == test_id
        ).first()

        if not test:

            raise HTTPException(
                status_code=404,
                detail="Test non trouvé"
            )

        return {

            "id":
                test.id,

            "titre":
                test.title,

            "regle_metier":
                test.regle_metier,

            "priorite":
                test.priorite,

            "severite":
                test.severite,

            "type":
                test.type,

            "score":
                test.score,

            "status":
                test.status,

            "version":
                test.version,

            "generated_script":
                test.generated_script,

            "steps": [

                {
                    "order":
                        s.step_order,

                    "description":
                        s.description
                }

                for s in test.steps
            ],

            "expected_results": [

                {
                    "description":
                        e.description
                }

                for s in test.steps

                for e in s.expected_results
            ]
        }

    finally:
        db.close()


# =========================
# UPDATE TEST STATUS
# =========================

@router.patch(
    "/projects/{project_id}/tests/{test_id}/status"
)
def update_test_status(
    project_id: int,
    test_id: int,
    request: StatusUpdateRequest
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

        test = db.query(TestCase).filter(
            TestCase.id == test_id
        ).first()

        if not test:

            raise HTTPException(
                status_code=404,
                detail="Test non trouvé"
            )

        test.status = request.status

        db.commit()

        return {

            "message":
                f"Status mis à jour : {request.status}",

            "test_id":
                test_id
        }

    finally:
        db.close()