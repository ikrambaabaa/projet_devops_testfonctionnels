from fastapi import APIRouter
from pydantic import BaseModel

from database import SessionLocal

from models import WorkflowStep

router = APIRouter()


# =========================
# REQUEST
# =========================

class WorkflowRequest(BaseModel):

    workflow_id: str

    title: str

    module: str

    status: str

    step_order: int


# =========================
# GET WORKFLOW
# =========================

@router.get(
    "/projects/{project_id}/workflow"
)
def get_workflow(project_id: int):

    db = SessionLocal()

    try:

        workflows = (

            db.query(WorkflowStep)

            .filter(
                WorkflowStep.project_id == project_id
            )

            .order_by(
                WorkflowStep.step_order.asc()
            )

            .all()
        )

        data = []

        flow = []

        active = 0

        for wf in workflows:

            if wf.status == "Actif":

                active += 1

            data.append({

                "workflow_id":
                    wf.workflow_id,

                "title":
                    wf.title,

                "module":
                    wf.module,

                "status":
                    wf.status,

                "step_order":
                    wf.step_order,
            })

            flow.append(
                wf.title
            )

        total = len(workflows)

        coverage = (

            round(
                (active / total) * 100
            )

            if total > 0 else 0
        )

        return {

            "total_workflows":
                total,

            "total_steps":
                total,

            "coverage":
                coverage,

            "flow":
                flow,

            "steps":
                data,
        }

    finally:

        db.close()


# =========================
# CREATE WORKFLOW
# =========================

@router.post(
    "/projects/{project_id}/workflow"
)
def create_workflow(

    project_id: int,

    request: WorkflowRequest
):

    db = SessionLocal()

    try:

        workflow = WorkflowStep(

            project_id=project_id,

            workflow_id=
                request.workflow_id,

            title=request.title,

            module=request.module,

            status=request.status,

            step_order=
                request.step_order
        )

        db.add(workflow)

        db.commit()

        db.refresh(workflow)

        return {

            "message":
                "Workflow ajouté",

            "id":
                workflow.id
        }

    finally:

        db.close()