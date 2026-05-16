from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import SessionLocal
from models import Project, SFDDocument, TestCase, TestExecution

router = APIRouter()


# =========================
# REQUEST MODEL
# =========================

class ProjectCreateRequest(BaseModel):
    name: str
    description: str = ""
    stack: str = ""


# =========================
# GET /api/projects
# =========================

@router.get("/projects")
def get_projects():

    db = SessionLocal()

    try:

        projects = db.query(Project).order_by(Project.created_at.desc()).all()

        result = []

        for p in projects:

            # Tests liés à ce projet
            sfd_ids = [s.id for s in db.query(SFDDocument).filter(
                SFDDocument.project_id == p.id
            ).all()]

            total_tests = db.query(TestCase).filter(
                TestCase.sfd_id.in_(sfd_ids)
            ).count() if sfd_ids else 0

            total_pass = db.query(TestExecution).join(
                TestCase, TestExecution.test_case_id == TestCase.id
            ).filter(
                TestCase.sfd_id.in_(sfd_ids),
                TestExecution.status == "PASS"
            ).count() if sfd_ids else 0

            coverage = (
                round((total_pass / total_tests) * 100)
                if total_tests > 0 else 0
            )

            total_sfd = db.query(SFDDocument).filter(
                SFDDocument.project_id == p.id
            ).count()

            result.append({
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "total_tests": total_tests,
                "total_sfd": total_sfd,
                "coverage": f"{coverage}%",
                "pipelines": total_pass,
                "status": "Actif",
                "date": str(p.created_at)[:10] if p.created_at else "N/A"
            })

        return {
            "total_projects": len(result),
            "projects": result
        }

    finally:
        db.close()


# =========================
# POST /api/projects
# =========================

@router.post("/projects")
def create_project(request: ProjectCreateRequest):

    db = SessionLocal()

    try:

        project = Project(
            name=request.name,
            description=request.description
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        return {
            "message": "Projet créé avec succès",
            "project_id": project.id,
            "name": project.name
        }

    finally:
        db.close()


# =========================
# GET /api/projects/{project_id}
# =========================

@router.get("/projects/{project_id}")
def get_project_detail(project_id: int):

    db = SessionLocal()

    try:

        project = db.query(Project).filter(Project.id == project_id).first()

        if not project:
            raise HTTPException(status_code=404, detail="Projet non trouvé")

        # SFDs du projet
        sfds = db.query(SFDDocument).filter(
            SFDDocument.project_id == project_id
        ).all()

        sfd_ids = [s.id for s in sfds]

        # Tests du projet
        total_tests = db.query(TestCase).filter(
            TestCase.sfd_id.in_(sfd_ids)
        ).count() if sfd_ids else 0

        total_draft = db.query(TestCase).filter(
            TestCase.sfd_id.in_(sfd_ids),
            TestCase.status == "draft"
        ).count() if sfd_ids else 0

        total_approved = db.query(TestCase).filter(
            TestCase.sfd_id.in_(sfd_ids),
            TestCase.status == "approved"
        ).count() if sfd_ids else 0

        total_pass = db.query(TestExecution).join(
            TestCase, TestExecution.test_case_id == TestCase.id
        ).filter(
            TestCase.sfd_id.in_(sfd_ids),
            TestExecution.status == "PASS"
        ).count() if sfd_ids else 0

        total_fail = db.query(TestExecution).join(
            TestCase, TestExecution.test_case_id == TestCase.id
        ).filter(
            TestCase.sfd_id.in_(sfd_ids),
            TestExecution.status == "FAIL"
        ).count() if sfd_ids else 0

        coverage = (
            round((total_pass / total_tests) * 100)
            if total_tests > 0 else 0
        )

        return {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "total_sfd": len(sfds),
            "total_tests": total_tests,
            "total_draft": total_draft,
            "total_approved": total_approved,
            "total_pass": total_pass,
            "total_fail": total_fail,
            "coverage": coverage,
            "sfds": [
                {
                    "id": s.id,
                    "title": s.title,
                    "date": str(s.created_at)[:10] if s.created_at else "N/A"
                }
                for s in sfds
            ]
        }

    finally:
        db.close()


# =========================
# GET /api/projects/{project_id}/tests
# =========================

@router.get("/projects/{project_id}/tests")
def get_project_tests(project_id: int):

    db = SessionLocal()

    try:

        sfd_ids = [s.id for s in db.query(SFDDocument).filter(
            SFDDocument.project_id == project_id
        ).all()]

        if not sfd_ids:
            return {"tests": [], "total": 0}

        tests = db.query(TestCase).filter(
            TestCase.sfd_id.in_(sfd_ids)
        ).order_by(TestCase.created_at.desc()).all()

        return {
            "total": len(tests),
            "tests": [
                {
                    "id": f"TM-{t.id:03d}",
                    "titre": t.title,
                    "priorite": t.priorite,
                    "severite": t.severite,
                    "type": t.type,
                    "status": t.status,
                    "score": t.score,
                    "sfd_id": t.sfd_id
                }
                for t in tests
            ]
        }

    finally:
        db.close()


# =========================
# GET /api/projects/{project_id}/executions
# =========================

@router.get("/projects/{project_id}/executions")
def get_project_executions(project_id: int):

    db = SessionLocal()

    try:

        sfd_ids = [s.id for s in db.query(SFDDocument).filter(
            SFDDocument.project_id == project_id
        ).all()]

        if not sfd_ids:
            return {"executions": [], "total": 0}

        executions = db.query(TestExecution).join(
            TestCase, TestExecution.test_case_id == TestCase.id
        ).filter(
            TestCase.sfd_id.in_(sfd_ids)
        ).order_by(TestExecution.execution_date.desc()).limit(20).all()

        return {
            "total": len(executions),
            "executions": [
                {
                    "id": f"EXEC-{e.id:03d}",
                    "status": e.status,
                    "environment": e.environment,
                    "executed_by": e.executed_by,
                    "date": str(e.execution_date)[:10] if e.execution_date else "N/A",
                    "comments": e.comments[:100] if e.comments else ""
                }
                for e in executions
            ]
        }

    finally:
        db.close()