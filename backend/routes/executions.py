from fastapi import (
    APIRouter,
    HTTPException
)

from pydantic import BaseModel

from database import SessionLocal

from models import (
    Project,
    TestExecution
)

from services.playwright_service import (
    run_playwright_tests
)

router = APIRouter()


# =========================
# REQUEST MODEL
# =========================

class ExecutionRequest(BaseModel):

    environment: str

    browser: str

    executed_by: str


# =========================
# RUN EXECUTION
# =========================

@router.post(
    "/projects/{project_id}/executions/run"
)
def run_execution(
    project_id: int,
    request: ExecutionRequest
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

        # PLAYWRIGHT RUNTIME
        result = run_playwright_tests()

        # SAVE EXECUTION
        execution = TestExecution(

            test_case_id=None,

            environment=request.environment,

            browser=request.browser,

            executed_by=request.executed_by,

            pipeline_name=f"{project.name}-pipeline",

            duration=result["duration"],

            coverage=result["coverage"],

            status=result["status"],

            logs=result["logs"],

            screenshot_path=result[
                "screenshot_path"
            ],

            comments="Execution QA runtime"
        )

        db.add(execution)

        db.commit()

        db.refresh(execution)

        return {

            "message":
                "Execution terminée",

            "project": {
                "id": project.id,
                "name": project.name
            },

            "execution": {

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
                    execution.browser,

                "logs":
                    execution.logs,

                "screenshot":
                    execution.screenshot_path
            }
        }

    finally:
        db.close()


# =========================
# GET PROJECT EXECUTIONS
# =========================

@router.get(
    "/projects/{project_id}/executions"
)
def get_project_executions(
    project_id: int
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

        executions = db.query(
            TestExecution
        ).order_by(
            TestExecution.execution_date.desc()
        ).all()

        return {

            "project": {
                "id": project.id,
                "name": project.name
            },

            "total_executions":
                len(executions),

            "executions": [

                {
                    "id":
                        f"EXEC-{e.id:03d}",

                    "status":
                        e.status,

                    "coverage":
                        e.coverage,

                    "duration":
                        e.duration,

                    "environment":
                        e.environment,

                    "browser":
                        e.browser,

                    "executed_by":
                        e.executed_by,

                    "pipeline":
                        e.pipeline_name,

                    "logs":
                        e.logs,

                    "screenshot":
                        e.screenshot_path,

                    "date":
                        str(e.execution_date)[:10]
                }

                for e in executions
            ]
        }

    finally:
        db.close()