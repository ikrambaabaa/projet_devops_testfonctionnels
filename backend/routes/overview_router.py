from fastapi import (
    APIRouter,
    HTTPException
)

from database import SessionLocal

from models import (
    TestCase,
    TestExecution,
    Project,
    SFDDocument
)

router = APIRouter()


# =========================
# PROJECT OVERVIEW
# =========================

@router.get(
    "/projects/{project_id}/overview"
)
def get_project_overview(
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

        # TOTAL TESTS
        total_tests = db.query(
            TestCase
        ).filter(
            TestCase.sfd_id.in_(sfd_ids)
        ).count() if sfd_ids else 0

        # PASS
        total_pass = db.query(
            TestExecution
        ).join(
            TestCase,
            TestExecution.test_case_id == TestCase.id
        ).filter(
            TestCase.sfd_id.in_(sfd_ids),
            TestExecution.status == "PASS"
        ).count() if sfd_ids else 0

        # FAIL
        total_fail = db.query(
            TestExecution
        ).join(
            TestCase,
            TestExecution.test_case_id == TestCase.id
        ).filter(
            TestCase.sfd_id.in_(sfd_ids),
            TestExecution.status == "FAIL"
        ).count() if sfd_ids else 0

        # COVERAGE
        coverage = (

            round(
                (total_pass / total_tests) * 100
            )

            if total_tests > 0

            else 0
        )

        # RECENT EXECUTIONS
        recent_executions = (

            db.query(TestExecution)

            .join(
                TestCase,
                TestExecution.test_case_id == TestCase.id
            )

            .filter(
                TestCase.sfd_id.in_(sfd_ids)
            )

            .order_by(
                TestExecution.execution_date.desc()
            )

            .limit(5)

            .all()
        )

        activity = []

        for ex in recent_executions:

            icon = (
                "✅"
                if ex.status == "PASS"
                else "⚠"
            )

            activity.append({

                "status":
                    ex.status,

                "message":

                    f"{icon} "
                    f"Execution "
                    f"{ex.status} — "
                    f"{ex.environment} "
                    f"({ex.executed_by})",

                "date":
                    str(ex.execution_date)[:10]
            })

        return {

            "project": {

                "id":
                    project.id,

                "name":
                    project.name,

                "description":
                    project.description
            },

            "statistics": {

                "total_tests":
                    total_tests,

                "total_pass":
                    total_pass,

                "total_fail":
                    total_fail,

                "coverage":
                    coverage,

                "total_sfd":
                    len(sfd_ids)
            },

            "recent_activity":
                activity
        }

    finally:
        db.close()