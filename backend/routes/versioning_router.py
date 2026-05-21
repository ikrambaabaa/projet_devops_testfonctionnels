from fastapi import APIRouter

from database import SessionLocal

from models import ProjectVersion
from models import Module
router = APIRouter()


# =========================
# GET VERSIONING
# =========================

@router.get(
    "/projects/{project_id}/versioning"
)
def get_versioning(project_id: int):

    db = SessionLocal()

    try:

        versions = (

            db.query(ProjectVersion)

            .filter(
                ProjectVersion.project_id == project_id
            )

            .order_by(
                ProjectVersion.id.desc()
            )

            .all()
        )

        data = []

        stable_count = 0

        releases = 0

        logs = []

        for version in versions:

            if version.status == "Stable":

                stable_count += 1

            if version.type == "Release":

                releases += 1

            data.append({
                "id": version.id,

                "version":
                    version.version,

                "type":
                    version.type,

                "date":
                    str(version.created_at)[:10],

                "status":
                    version.status,
            })

            logs.append({

                "message":

                    f"{version.version} - {version.description}"
            })

        total_versions = len(versions)

        stability = (

            round(
                (stable_count / total_versions) * 100
            )

            if total_versions > 0 else 0
        )

        return {

            "total_versions":
                total_versions,

            "total_releases":
                releases,

            "stability":
                stability,

            "versions":
                data,

            "logs":
                logs,
        }

    finally:

        db.close()
        modules = (

    db.query(Module)

    .filter(
        Module.project_id == project_id
    )

    .all()
)


# =========================
# CREATE VERSION
# =========================

@router.post(
    "/projects/{project_id}/versioning/create"
)
def create_version(project_id: int):

    db = SessionLocal()

    try:

        count = (

            db.query(ProjectVersion)

            .filter(
                ProjectVersion.project_id == project_id
            )

            .count()
        )

        new_version = (

            f"v1.{count + 1}"
        )

        version = ProjectVersion(

            project_id=project_id,

            version=new_version,

            type="Tests IA",

            status="Draft",

            description=
                "Nouvelle génération IA"
        )

        db.add(version)

        db.commit()

        return {

            "message":
                "Version créée",

            "version":
                new_version
        }

    finally:

        db.close()
        
        # =========================
# DELETE VERSION
# =========================

@router.delete(
    "/version/{version_id}"
)
def delete_version(
    version_id: int
):

    db = SessionLocal()

    try:

        version = (

            db.query(ProjectVersion)

            .filter(
                ProjectVersion.id == version_id
            )

            .first()
        )

        if not version:

            return {

                "error":
                    "Version introuvable"
            }

        db.delete(version)

        db.commit()

        return {

            "message":
                "Version supprimée"
        }

    finally:

        db.close()
        # =========================
# RUN QA PIPELINE
# =========================

@router.post(
    "/projects/{project_id}/version/{version_id}/run"
)
def run_version_pipeline(

    project_id: int,

    version_id: int
):

    db = SessionLocal()

    try:

        version = (

            db.query(ProjectVersion)

            .filter(
                ProjectVersion.id == version_id
            )

            .first()
        )

        if not version:

            return {

                "error":
                    "Version introuvable"
            }

        # =========================
        # SIMULATION QA PIPELINE
        # =========================

        print(
            f"Running QA Pipeline for {version.version}"
        )

        return {

            "message":

                f"Pipeline QA lancé pour {version.version}"
        }

    finally:

        db.close()