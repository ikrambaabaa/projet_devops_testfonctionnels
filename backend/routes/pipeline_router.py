from fastapi import (
    APIRouter,
    HTTPException
)

from database import SessionLocal

from models import (
    Project,
    TestExecution,
    TestCase,
    SFDDocument
)

router = APIRouter()


# =========================
# GET PROJECT PIPELINES
# =========================

@router.get(
    "/projects/{project_id}/pipelines"
)
def get_project_pipelines(
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

        # EXECUTIONS
        executions_query = db.query(
            TestExecution
        ).join(
            TestCase,
            TestExecution.test_case_id == TestCase.id
        ).filter(
            TestCase.sfd_id.in_(sfd_ids)
        )

        total_executions = executions_query.count()

        total_pass = executions_query.filter(
            TestExecution.status == "PASS"
        ).count()

        total_fail = executions_query.filter(
            TestExecution.status == "FAIL"
        ).count()

        # COVERAGE
        coverage = (

            round(
                (total_pass / total_tests) * 100
            )

            if total_tests > 0

            else 0
        )

        # PIPELINE HISTORY
        recent = executions_query.order_by(
            TestExecution.execution_date.desc()
        ).limit(10).all()

        history = []

        for ex in recent:

            history.append({

                "id":
                    f"EXEC-{ex.id:03d}",

                "pipeline":
                    ex.pipeline_name,

                "branch":
                    "main",

                "status":
                    ex.status,

                "environment":
                    ex.environment,

                "browser":
                    ex.browser,

                "executed_by":
                    ex.executed_by,

                "duration":
                    ex.duration,

                "coverage":
                    ex.coverage,

                "comments":
                    ex.comments,

                "date":
                    str(ex.execution_date)[:10]
            })

        return {

            "project": {

                "id":
                    project.id,

                "name":
                    project.name
            },

            "statistics": {

                "total_pipelines":
                    total_executions,

                "total_pass":
                    total_pass,

                "total_fail":
                    total_fail,

                "coverage":
                    coverage
            },

            "history":
                history
        }

    finally:
        db.close()


# =========================
# RUN PROJECT PIPELINE
# =========================

@router.post(
    "/projects/{project_id}/pipelines/run"
)
def run_project_pipeline(
    project_id: int
):

    from services.playwright_service import (
        run_playwright_tests
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

        # PLAYWRIGHT RUNTIME
        result = run_playwright_tests()

        # SAVE EXECUTION
        execution = TestExecution(

            test_case_id=None,

            executed_by="GitLab CI",

            environment="TEST",

            browser="Chromium",

            pipeline_name=f"{project.name}-pipeline",

            duration=result["duration"],

            coverage=result["coverage"],

            status=result["status"],

            logs=result["logs"],

            screenshot_path=result[
                "screenshot_path"
            ],

            comments="Pipeline CI/CD runtime"
        )

        db.add(execution)

        db.commit()

        db.refresh(execution)

        return {

            "message":
                "Pipeline exécuté",

            "project": {

                "id":
                    project.id,

                "name":
                    project.name
            },

            "pipeline": {

                "id":
                    f"EXEC-{execution.id:03d}",

                "status":
                    execution.status,

                "coverage":
                    execution.coverage,

                "duration":
                    execution.duration,

                "environment":
                    execution.environment,

                "browser":
                    execution.browser
            }
        }

    finally:
        db.close()