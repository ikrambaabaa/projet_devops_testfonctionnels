from fastapi import APIRouter
from pydantic import BaseModel

from database import SessionLocal

from models import TestCase

router = APIRouter()


# =========================
# REQUEST
# =========================

class ValidationRequest(BaseModel):

    status: str


class CommentRequest(BaseModel):

    comment: str


# =========================
# GET VALIDATION
# =========================

@router.get("/projects/{project_id}/validation")
def get_validation(project_id: int):

    db = SessionLocal()

    try:

        tests = (

            db.query(TestCase)

            .filter(
                TestCase.project_id == project_id
            )

            .all()
        )

        validated = 0
        pending = 0
        rejected = 0

        data = []

        for test in tests:

            if test.status == "Validated":

                validated += 1

            elif test.status == "Rejected":

                rejected += 1

            else:

                pending += 1


            data.append({

                "id": test.id,

                "title": test.title,

                "priority": test.priorite,

                "status": test.status,
            })

        total = len(tests)

        validation_rate = (

            round(
                (validated / total) * 100
            )

            if total > 0 else 0
        )

        return {

            "validated": validated,

            "pending": pending,

            "rejected": rejected,

            "validation_rate":
                validation_rate,

            "tests": data,
        }

    finally:

        db.close()


# =========================
# UPDATE STATUS
# =========================

@router.put(
    "/projects/{project_id}/validation/{test_id}"
)
def update_validation(

    project_id: int,

    test_id: int,

    request: ValidationRequest
):

    db = SessionLocal()

    try:

        test = (

            db.query(TestCase)

            .filter(
                TestCase.id == test_id
            )

            .first()
        )

        if not test:

            return {

                "message":
                    "Test introuvable"
            }

        test.status = request.status

        db.commit()

        return {

            "message":
                "Validation mise à jour"
        }

    finally:

        db.close()


# =========================
# VALIDATE ALL
# =========================

@router.post(
    "/projects/{project_id}/validation/validate-all"
)
def validate_all(project_id: int):

    db = SessionLocal()

    try:

        tests = (

            db.query(TestCase)

            .filter(
                TestCase.project_id == project_id
            )

            .all()
        )

        for test in tests:

            test.status = "Validated"

        db.commit()

        return {

            "message":
                "Tous les tests validés"
        }

    finally:

        db.close()


# =========================
# COMMENTS
# =========================

@router.post(
    "/projects/{project_id}/validation/comments"
)
def save_comment(

    project_id: int,

    request: CommentRequest
):

    return {

        "message":
            "Commentaire sauvegardé",

        "comment":
            request.comment
    }