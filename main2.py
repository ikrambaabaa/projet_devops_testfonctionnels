from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests, json, os, time, re
from openpyxl import Workbook
from database import engine
from database import SessionLocal
from models import Base
from models import (
    Project,
    SFDDocument,
    TestCase,
    TestStep,
    ExpectedResult,
    TestExecution,
    StepResult
)

Base.metadata.create_all(bind=engine)

app = FastAPI()

# 🔐 API KEY
API_KEY = os.getenv("OPENROUTER_API_KEY")
if not API_KEY:
    raise ValueError("OPENROUTER_API_KEY manquante")


# 📥 Request model
class SFDRequest(BaseModel):
    project_name: str = "Projet par défaut"
    sfd_title: str = "SFD sans titre"
    parent_sfd_id: int | None = None
    sfd: str


# 🧠 PROMPT MÉTIER
PROMPT = """
Tu es un expert QA senior spécialisé en tests fonctionnels et tests métier.

OBJECTIF :
Générer UNIQUEMENT des cas de tests métier à partir du SFD fourni.

INTERDICTIONS STRICTES :
- Aucun test technique
- Aucun test API / backend / base de données
- Aucun test performance ou sécurité technique
- Aucun vocabulaire technique (endpoint, request, response, code, etc.)

FOCUS :
- Comportement utilisateur
- Règles métier
- Scénarios réels

EXIGENCES :
1. Identifier les règles métier (RG)
2. Générer des tests couvrant :
   - Nominal
   - Limite
   - Erreur
3. Chaque test doit être réaliste
4. Ajouter priorité et sévérité métier

FORMAT JSON STRICT :
[
  {
    "id": "TM001",
    "titre": "Description du test",
    "regle_metier": "RG1",
    "preconditions": [],
    "etapes": [],
    "donnees_entree": {},
    "resultats_attendus": [],
    "priorite": "Haute | Moyenne | Basse",
    "severite": "Critique | Élevée | Moyenne | Faible",
    "type": "Nominal | Limite | Erreur"
  }
]

CONTRAINTES :
- Résultats attendus = LISTE obligatoire
- Ne pas inventer des règles
- Maximiser couverture métier

SFD :
"""


# 🔥 JSON extraction robuste
def extract_json(text):
    text = re.sub(r"```json", "", text)
    text = re.sub(r"```", "", text).strip()

    match = re.search(r"\[\s*{.*}\s*\]", text, re.DOTALL)
    if not match:
        raise ValueError("JSON non trouvé")

    json_text = match.group()
    json_text = json_text.replace("\n", " ")

    try:
        return json.loads(json_text)
    except Exception as e:
        raise ValueError(f"JSON invalide: {e}")


# 🔁 API CALL
def call_ai(payload, headers, retries=3):
    for _ in range(retries):
        try:
            res = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            if res.status_code == 200:
                return res.json()
        except requests.exceptions.RequestException:
            pass
        time.sleep(2)

    raise HTTPException(status_code=500, detail="Erreur API OpenRouter")


# 🚫 Filtre anti-technique
def is_business_test(test):
    forbidden = [
        "api", "endpoint", "http", "request", "response",
        "sql", "database", "latency", "performance",
        "backend", "frontend", "json", "code"
    ]
    text = json.dumps(test).lower()
    return not any(word in text for word in forbidden)


# ✅ Validation qualité
def is_valid_business_structure(test):
    return (
        isinstance(test.get("etapes"), list) and len(test["etapes"]) >= 2 and
        isinstance(test.get("resultats_attendus"), list) and len(test["resultats_attendus"]) >= 1
    )


# 🧠 SCORE MÉTIER
def compute_score(test):
    score = 0

    if test.get("priorite") == "Haute":
        score += 3
    elif test.get("priorite") == "Moyenne":
        score += 2
    elif test.get("priorite") == "Basse":
        score += 1

    if test.get("severite") == "Critique":
        score += 3
    elif test.get("severite") == "Élevée":
        score += 2
    elif test.get("severite") == "Moyenne":
        score += 1

    if test.get("type") == "Erreur":
        score += 2
    elif test.get("type") == "Limite":
        score += 1

    return score


# 📊 Export Excel
def export_excel(tests):
    wb = Workbook()
    ws = wb.active
    ws.title = "Tests Metier"

    headers = [
        "ID", "Titre", "Regle", "Type",
        "Priorite", "Severite", "Score", "Resultats"
    ]
    ws.append(headers)

    for t in tests:
        ws.append([
            t.get("id"),
            t.get("titre"),
            t.get("regle_metier"),
            t.get("type"),
            t.get("priorite"),
            t.get("severite"),
            t.get("score"),
            " | ".join(t.get("resultats_attendus", []))
        ])

    wb.save("tests_metier.xlsx")


# 🏠 HOME
@app.get("/")
def home():
    return {"message": "QA Business Generator Ready 🚀"}


# 🚀 MAIN ENDPOINT
@app.post("/generate-tests")
def generate_tests(request: SFDRequest):

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "openrouter/auto",
        "temperature": 0.1,
        "messages": [
            {
                "role": "user",
                "content": PROMPT + request.sfd
            }
        ]
    }

    # 🔁 Appel IA
    data = call_ai(payload, headers)

    try:
        content = data["choices"][0]["message"]["content"]
        tests = extract_json(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur parsing: {e}")

    # ✅ Validation + scoring
    validated = []
    for t in tests:
        if (
            "id" in t and
            "titre" in t and
            isinstance(t.get("resultats_attendus"), list) and
            is_business_test(t) and
            is_valid_business_structure(t)
        ):
            t["status"] = "draft"
            t["score"] = compute_score(t)
            validated.append(t)

    # 📊 Export Excel
    export_excel(validated)

    # =========================
    # DATABASE SAVE
    # =========================
    db = SessionLocal()
    try:
        # 📁 Créer le projet
        project = Project(
            name=request.project_name,
            description="Projet QA généré"
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        # 📄 Créer le document SFD
        sfd_doc = SFDDocument(
            project_id=project.id,
            parent_id=request.parent_sfd_id,
            title=request.sfd_title,
            content=request.sfd
        )
        db.add(sfd_doc)
        db.commit()
        db.refresh(sfd_doc)

        # 💾 Sauvegarder les tests
        for t in validated:

            # 🧠 Cas de test
            test_case = TestCase(
                sfd_id=sfd_doc.id,
                version=1,
                title=t.get("titre"),
                regle_metier=t.get("regle_metier"),
                priorite=t.get("priorite", "Moyenne"),
                severite=t.get("severite", "Moyenne"),
                type=t.get("type", "Nominal"),
                score=t.get("score", 0),
                status=t.get("status", "draft")
            )
            db.add(test_case)
            db.commit()
            db.refresh(test_case)

            etapes = t.get("etapes", [])
            resultats = t.get("resultats_attendus", [])

            for index, step in enumerate(etapes, start=1):

                # 🪜 Étape
                test_step = TestStep(
                    test_case_id=test_case.id,
                    step_order=index,
                    description=step
                )
                db.add(test_step)
                db.commit()
                db.refresh(test_step)

                # ✅ Résultat attendu
                if index <= len(resultats):
                    expected = ExpectedResult(
                        test_case_id=test_case.id,
                        step_id=test_step.id,
                        description=resultats[index - 1]
                    )
                    db.add(expected)
                    db.commit()

    finally:
        db.close()

    return {
        "message": "Tests sauvegardés avec succès",
        "count": len(validated),
        "tests": validated
    }