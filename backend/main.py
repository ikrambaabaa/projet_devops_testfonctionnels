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


# 🧠 PROMPT MÉTIER QA FONCTIONNEL
# 🧠 PROMPT QA MÉTIER AVANCÉ
PROMPT = """
Tu es un expert QA senior spécialisé exclusivement en tests fonctionnels métier.

MISSION :
Analyser le SFD puis générer un très grand nombre de cas de tests métier réalistes.

OBJECTIF PRINCIPAL :
Maximiser la couverture fonctionnelle métier.

INTERDICTIONS STRICTES :
Ne jamais générer :
- tests techniques
- tests unitaires
- tests API
- tests backend
- tests SQL
- tests performance
- tests sécurité technique
- tests code source

INTERDICTION DE VOCABULAIRE TECHNIQUE :
Ne jamais utiliser :
endpoint, request, response, API, SQL,
database, backend, frontend, JSON,
code, méthode, fonction, pytest,
assertion, payload.

FOCUS OBLIGATOIRE :
- règles métier
- comportement utilisateur
- workflow métier
- validations métier
- scénarios réels
- erreurs métier
- cas limites métier
- dépendances métier
- variantes fonctionnelles

OBLIGATION :
Générer un maximum de scénarios métier possibles.

Générer :
- scénarios nominaux
- scénarios erreurs
- scénarios limites
- scénarios alternatifs
- scénarios exceptionnels
- validations métier
- refus métier
- droits utilisateur
- contraintes métier
- cas de bord
- dépendances entre scénarios
- variantes métier
- workflows complexes
- scénarios liés hiérarchiquement

EXEMPLES DE TESTS ATTENDUS :
✅ paiement refusé
✅ solde insuffisant
✅ produit hors stock
✅ utilisateur bloqué
✅ montant maximum
✅ dépassement plafond
✅ panier vide
✅ devise invalide
✅ droits insuffisants
✅ compte inexistant

EXEMPLES INTERDITS :
❌ test API
❌ test endpoint
❌ test SQL
❌ test code Python
❌ test backend
❌ validation HTTP

EXIGENCES :
1. Identifier toutes les règles métier
2. Générer le maximum de cas possibles
3. Générer minimum 20 cas de tests
4. Générer :
   - Nominal
   - Limite
   - Erreur
5. Ajouter :
   - priorité métier
   - sévérité métier
6. Générer :
   - préconditions
   - étapes détaillées
   - données d'entrée
   - résultats attendus
7. Maximiser la couverture métier
8. Générer des scénarios utilisateur réalistes
9. Détecter automatiquement les dépendances logiques entre scénarios métier.

RÈGLES :
- Si un test dépend d’un autre scénario métier, utiliser parent_test_id.
- Le scénario principal doit avoir parent_test_id = null.
- Les scénarios enfants doivent référencer l’identifiant numérique du parent.
- Les scénarios liés doivent former une hiérarchie logique.
- Les variantes d’un même scénario doivent être reliées entre elles.

EXEMPLES :
- Ajout bénéficiaire → parent null
- Validation bénéficiaire → parent = test ajout bénéficiaire
- Virement vers bénéficiaire validé → parent = test validation bénéficiaire

- Création compte → parent null
- Activation compte → parent = création compte
- Connexion utilisateur → parent = activation compte

10. Lorsqu’un scénario possède plusieurs variantes métier :
    - le scénario principal doit avoir version = 1
    - les variantes doivent avoir version = 2, 3, etc.
    - les variantes doivent utiliser parent_test_id
    - les variantes doivent réutiliser le même workflow métier

11. Générer un status QA pour chaque test :
    - draft
    - ready
    - approved

12. Générer des scénarios dépendants les uns des autres

FORMAT JSON STRICT :

[
  {
    "id": "TM001",

    "parent_test_id": null,

    "version": 1,

    "status": "draft",

    "titre": "Description métier",

    "regle_metier": "Description complète de la règle métier liée au test",

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
- JSON uniquement
- Aucun texte hors JSON
- Ne jamais expliquer
- Ne jamais commenter
- Ne jamais utiliser markdown
- Tous les champs obligatoires
- Résultats attendus = LISTE
- Étapes = LISTE
- Préconditions = LISTE
- parent_test_id doit être un entier numérique ou null
- version doit être un entier numérique
- regle_metier doit contenir le texte explicite de la règle métier
- Ne jamais utiliser uniquement RG1, RG2, RG3
- Générer des relations logiques entre certains tests
- Générer des variantes métier réalistes
- Ne jamais inventer de logique absente du SFD
- Générer uniquement des tests fonctionnels métier
- Ne jamais générer de tests techniques
- Retourner uniquement le tableau JSON

SFD :
"""


# 🔥 JSON extraction robuste
def extract_json(text):
    text = re.sub(r"```json", "", text)
    text = re.sub(r"```", "", text).strip()

    match = re.search(r"\[.*\]", text, re.DOTALL)
    if not match:
        raise ValueError("JSON non trouvé")

    json_text = match.group()
    json_text = json_text.replace("\n", " ")

    try:
        print("JSON détecté :", json_text[:500])
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
                # 🔗 Relation parent/enfant
                parent_test_id=int(
    str(t.get("parent_test_id", "0"))
    .replace("TM", "")
) if t.get("parent_test_id") else None,
                # 📌 Version dynamique
                version=t.get("version", 1),
                # 📝 Informations métier
                title=t.get("titre"),
                regle_metier=t.get("regle_metier"),
                priorite=t.get("priorite", "Moyenne"),
                severite=t.get("severite", "Moyenne"),
                type=t.get("type", "Nominal"),
                # 📊 Score QA
                score=t.get("score", 0),
                # 🔄 Workflow QA
                status=t.get("status", "draft")
            )
            db.add(test_case)
            db.commit()
            db.refresh(test_case)

            # ▶️ Création execution
            execution = TestExecution(
                test_case_id=test_case.id,
                # 👤 utilisateur execution
                executed_by="QA System",
                # 🌍 environnement
                environment="TEST",
                # 📌 statut execution
                status="Not Executed",
                # 📝 commentaire execution
                comments="Execution automatique générée par IA"
            )
            db.add(execution)
            db.commit()
            db.refresh(execution)

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

                # 📊 Résultat étape
                step_result = StepResult(
                    test_execution_id=execution.id,
                    step_id=test_step.id,
                    result="Not Executed",
                    comment="En attente"
                )
                db.add(step_result)
                db.commit()

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