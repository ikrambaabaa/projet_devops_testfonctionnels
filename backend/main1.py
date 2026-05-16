from fastapi import FastAPI
from database import Base, engine
from database import Base, engine

from fastapi.middleware.cors import CORSMiddleware

# ROUTES
from routes.overview_router import router as overview_router
from routes.pipeline_router import router as pipeline_router
from routes.reports_router import router as reports_router
from routes.sfd_router import router as sfd_router
from routes.tests_router import router as tests_router
from routes.projects_router import router as projects_router
from routes.executions import router as executions_router
from routes.config import router as config_router
from routes.validation_router import router as validation_router
from routes.workflow_router import router as workflow_router
from routes.versioning_router import router as versioning_router

Base.metadata.create_all(
    bind=engine
)
app = FastAPI()


# =========================
# CORS
# =========================

app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================
# ROUTES
# =========================

app.include_router(
    overview_router,
    prefix="/api"
)

app.include_router(
    tests_router,
    prefix="/api"
)

app.include_router(
    executions_router,
    prefix="/api"
)

app.include_router(
    config_router,
    prefix="/api"
)

app.include_router(
    pipeline_router,
    prefix="/api"
)

app.include_router(
    reports_router,
    prefix="/api"
)

app.include_router(
    sfd_router,
    prefix="/api"
)

app.include_router(
    projects_router,
    prefix="/api"
)

app.include_router(
    validation_router,
    prefix="/api"
)
app.include_router(
    workflow_router,
    prefix="/api"
)
app.include_router(
    versioning_router,
    prefix="/api"
)
# =========================
# HOME
# =========================

@app.get("/")
def home():

    return {
        "message":
            "QA AI Backend Running 🚀"
    }