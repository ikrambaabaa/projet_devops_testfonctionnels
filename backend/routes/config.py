from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import SessionLocal
from models import Project, ProjectConfig

router = APIRouter()


# =========================
# REQUEST MODEL
# =========================

class ConfigRequest(BaseModel):

    # GitLab
    gitlab_repository: str
    branch_pipeline: str
    gitlab_token: str
    pipeline_yaml: str

    # URLs
    frontend_url: str
    backend_url: str

    # Database
    database_host: str
    database_name: str

    # Stack
    frontend_framework: str
    backend_framework: str
    automation_framework: str
    ai_model: str

    # Workflow
    workflow_runtime: str

    # Runtime
    base_url: str
    browser: str
    environment: str
    timeout: str

    # QA
    tests_folder: str
    screenshots_folder: str
    reports_folder: str
    execution_mode: str


# =========================
# GET CONFIG BY PROJECT
# =========================

@router.get("/projects/{project_id}/config")
def get_project_config(project_id: int):

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

        config = db.query(ProjectConfig).filter(
            ProjectConfig.project_id == project_id
        ).first()

        if not config:
            return {
                "message": "Aucune configuration"
            }

        return {
            "project_id": project.id,

            "gitlab_repository":
                config.gitlab_repository,

            "branch_pipeline":
                config.branch_pipeline,

            "gitlab_token":
                config.gitlab_token,

            "pipeline_yaml":
                config.pipeline_yaml,

            "frontend_url":
                config.frontend_url,

            "backend_url":
                config.backend_url,

            "database_host":
                config.database_host,

            "database_name":
                config.database_name,

            "frontend_framework":
                config.frontend_framework,

            "backend_framework":
                config.backend_framework,

            "automation_framework":
                config.automation_framework,

            "ai_model":
                config.ai_model,

            "workflow_runtime":
                config.workflow_runtime,

            "base_url":
                config.base_url,

            "browser":
                config.browser,

            "environment":
                config.environment,

            "timeout":
                config.timeout,

            "tests_folder":
                config.tests_folder,

            "screenshots_folder":
                config.screenshots_folder,

            "reports_folder":
                config.reports_folder,

            "execution_mode":
                config.execution_mode
        }

    finally:
        db.close()


# =========================
# SAVE CONFIG
# =========================

@router.post("/projects/{project_id}/config")
def save_project_config(
    project_id: int,
    request: ConfigRequest
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

        existing = db.query(ProjectConfig).filter(
            ProjectConfig.project_id == project_id
        ).first()

        # UPDATE EXISTING CONFIG
        if existing:

            existing.gitlab_repository = request.gitlab_repository
            existing.branch_pipeline = request.branch_pipeline
            existing.gitlab_token = request.gitlab_token
            existing.pipeline_yaml = request.pipeline_yaml

            existing.frontend_url = request.frontend_url
            existing.backend_url = request.backend_url

            existing.database_host = request.database_host
            existing.database_name = request.database_name

            existing.frontend_framework = request.frontend_framework
            existing.backend_framework = request.backend_framework
            existing.automation_framework = request.automation_framework
            existing.ai_model = request.ai_model

            existing.workflow_runtime = request.workflow_runtime

            existing.base_url = request.base_url
            existing.browser = request.browser
            existing.environment = request.environment
            existing.timeout = request.timeout

            existing.tests_folder = request.tests_folder
            existing.screenshots_folder = request.screenshots_folder
            existing.reports_folder = request.reports_folder
            existing.execution_mode = request.execution_mode

            db.commit()

            return {
                "message": "Configuration mise à jour",
                "project_id": project_id
            }

        # CREATE CONFIG
        config = ProjectConfig(

            project_id=project_id,

            gitlab_repository=request.gitlab_repository,
            branch_pipeline=request.branch_pipeline,
            gitlab_token=request.gitlab_token,
            pipeline_yaml=request.pipeline_yaml,

            frontend_url=request.frontend_url,
            backend_url=request.backend_url,

            database_host=request.database_host,
            database_name=request.database_name,

            frontend_framework=request.frontend_framework,
            backend_framework=request.backend_framework,
            automation_framework=request.automation_framework,
            ai_model=request.ai_model,

            workflow_runtime=request.workflow_runtime,

            base_url=request.base_url,
            browser=request.browser,
            environment=request.environment,
            timeout=request.timeout,

            tests_folder=request.tests_folder,
            screenshots_folder=request.screenshots_folder,
            reports_folder=request.reports_folder,
            execution_mode=request.execution_mode
        )

        db.add(config)

        db.commit()

        db.refresh(config)

        return {
            "message": "Configuration sauvegardée",
            "project_id": project_id,
            "config_id": config.id
        }

    finally:
        db.close()