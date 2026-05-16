from fastapi import (
    APIRouter,
    HTTPException
)

from fastapi.responses import FileResponse

from database import SessionLocal

from models import (
    TestExecution,
    TestCase,
    Project,
    SFDDocument
)

from openpyxl import Workbook

router = APIRouter()


# =========================
# GET PROJECT REPORTS
# =========================

@router.get(
    "/projects/{project_id}/reports"
)
def get_project_reports(
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

        # EXECUTIONS QUERY
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

        # SUCCESS RATE
        taux_reussite = (

            round(
                (total_pass / total_executions) * 100
            )

            if total_executions > 0

            else 0
        )

        # COVERAGE
        coverage = (

            round(
                (total_pass / total_tests) * 100
            )

            if total_tests > 0

            else 0
        )

        # DEFECTS
        defects_query = executions_query.filter(
            TestExecution.status == "FAIL"
        ).order_by(
            TestExecution.execution_date.desc()
        ).limit(10).all()

        defects = []

        for d in defects_query:

            defects.append({

                "id":
                    f"DEF-{d.id:03d}",

                "description":

                    d.comments[:100]

                    if d.comments

                    else "Erreur inconnue",

                "environment":
                    d.environment,

                "browser":
                    d.browser,

                "date":
                    str(d.execution_date)[:10]
            })

        # REPORT HISTORY
        recent = executions_query.order_by(
            TestExecution.execution_date.desc()
        ).limit(10).all()

        history = []

        for ex in recent:

            history.append({

                "id":
                    f"REPORT-{ex.id:03d}",

                "title":
                    f"QA Report — {project.name}",

                "project":
                    project.name,

                "date":
                    str(ex.execution_date)[:10],

                "status":

                    "Generated"

                    if ex.status != "Not Executed"

                    else "Pending"
            })

        return {

            "project": {

                "id":
                    project.id,

                "name":
                    project.name
            },

            "statistics": {

                "taux_reussite":
                    taux_reussite,

                "total_executions":
                    total_executions,

                "coverage":
                    coverage,

                "total_pass":
                    total_pass,

                "total_fail":
                    total_fail,

                "total_tests":
                    total_tests
            },

            "defects":
                defects,

            "history":
                history
        }

    finally:
        db.close()


# =========================
# EXPORT EXCEL
# =========================

@router.get(
    "/projects/{project_id}/reports/export/excel"
)
def export_excel(
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

        sfd_ids = [

            s.id

            for s in db.query(
                SFDDocument
            ).filter(
                SFDDocument.project_id == project_id
            ).all()
        ]

        tests = db.query(TestCase).filter(
            TestCase.sfd_id.in_(sfd_ids)
        ).all()

        wb = Workbook()

        ws = wb.active

        ws.title = "Rapport QA"

        ws.append([

            "ID",
            "Titre",
            "Règle Métier",
            "Type",
            "Priorité",
            "Sévérité",
            "Score",
            "Status"
        ])

        for t in tests:

            ws.append([

                t.id,
                t.title,
                t.regle_metier,
                t.type,
                t.priorite,
                t.severite,
                t.score,
                t.status
            ])

        path = f"rapport_{project.id}.xlsx"

        wb.save(path)

    finally:
        db.close()

    return FileResponse(

        path=path,

        filename=f"{project.name}_report.xlsx",

        media_type=
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


# =========================
# EXPORT HTML REPORT
# =========================

@router.get(
    "/projects/{project_id}/reports/export/html"
)
def export_html_report(
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

        sfd_ids = [

            s.id

            for s in db.query(
                SFDDocument
            ).filter(
                SFDDocument.project_id == project_id
            ).all()
        ]

        total_tests = db.query(
            TestCase
        ).filter(
            TestCase.sfd_id.in_(sfd_ids)
        ).count()

        executions_query = db.query(
            TestExecution
        ).join(
            TestCase,
            TestExecution.test_case_id == TestCase.id
        ).filter(
            TestCase.sfd_id.in_(sfd_ids)
        )

        total_pass = executions_query.filter(
            TestExecution.status == "PASS"
        ).count()

        total_fail = executions_query.filter(
            TestExecution.status == "FAIL"
        ).count()

    finally:
        db.close()

    html = f"""
    <html>
    <body>

        <h1>
            Rapport QA — {project.name}
        </h1>

        <p>
            Total Tests : {total_tests}
        </p>

        <p>
            PASS : {total_pass}
        </p>

        <p>
            FAIL : {total_fail}
        </p>

    </body>
    </html>
    """

    path = f"rapport_{project.id}.html"

    with open(
        path,
        "w",
        encoding="utf-8"
    ) as f:

        f.write(html)

    return FileResponse(

        path=path,

        filename=f"{project.name}_report.html",

        media_type="text/html"
    )