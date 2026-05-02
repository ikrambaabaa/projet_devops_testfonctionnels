from fastapi import FastAPI, HTTPException
import requests
import json
import re

# 🔥 IMPORTANT : créer app AVANT les routes
app = FastAPI(title="API Génération Tests IA PRO 🚀")

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "tinyllama"


# ===============================
# 🔥 APPEL IA
# ===============================
def call_ollama(prompt: str):
    try:
        res = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2,
                    "num_predict": 150
                }
            },
            timeout=120
        )

        res.raise_for_status()
        return res.json().get("response", "")

    except Exception as e:
        print("OLLAMA ERROR:", e)
        return None


# ===============================
# 🔥 EXTRACTION JSON
# ===============================
def extract_tests(text):
    if not text:
        return []

    if "Given" in text or "Scenario" in text:
        return []

    text = text.replace("```json", "").replace("```", "")

    match = re.search(r"\[.*\]", text, re.DOTALL)
    if not match:
        return []

    try:
        data = json.loads(match.group())
        results = []

        for item in data:
            title = item.get("title", "").strip()
            test_type = item.get("type", "Positive").capitalize()

            if title:
                results.append({
                    "title": title,
                    "type": test_type
                })

        return results

    except:
        return []


# ===============================
# 🔥 AMÉLIORATION QUALITÉ
# ===============================
def improve_test(test):
    title = test["title"].lower()

    mapping = {
        "compte": "Création de compte",
        "login": "Connexion utilisateur",
        "connect": "Connexion utilisateur",
        "recherche": "Recherche produit",
        "panier": "Ajout au panier",
        "commande": "Passage de commande"
    }

    for key in mapping:
        if key in title:
            title = mapping[key]

    if test["type"] == "Positive":
        steps = f"Exécuter {title} avec données valides"
        expected = "Opération réussie"

    elif test["type"] == "Negative":
        steps = f"Exécuter {title} avec données invalides"
        expected = "Message d'erreur affiché"

    else:
        steps = f"Exécuter {title} avec données vides"
        expected = "Comportement géré correctement"

    return {
        "title": title,
        "type": test["type"],
        "priority": "High" if test["type"] != "Edge" else "Medium",
        "steps": steps,
        "expected_result": expected
    }


# ===============================
# 🔥 FALLBACK
# ===============================
def fallback_generator(sfd):
    actions = re.split(r",|et|and", sfd.lower())

    tests = []

    for act in actions:
        act = act.strip()
        if len(act) < 4:
            continue

        tests += [
            {"title": act, "type": "Positive"},
            {"title": act, "type": "Negative"},
            {"title": act, "type": "Edge"}
        ]

    return tests


# ===============================
# 🔥 ROUTES
# ===============================
@app.get("/")
def home():
    return {"message": "API IA fonctionne 🚀"}


@app.post("/generate-tests")
def generate_tests(data: dict):
    try:
        sfd = data.get("sfd", "").strip()

        if not sfd:
            raise HTTPException(400, "SFD manquant")

        # 🔥 PROMPT FINAL (clé)
        prompt = f"""
Return ONLY JSON.

Generate MANY test cases (minimum 10).

SFD:
{sfd}

Example:
[
  {{"title": "Create account valid", "type": "Positive"}},
  {{"title": "Create account invalid", "type": "Negative"}},
  {{"title": "Create account edge", "type": "Edge"}},

  {{"title": "Login valid", "type": "Positive"}},
  {{"title": "Login invalid", "type": "Negative"}},
  {{"title": "Login edge", "type": "Edge"}},

  {{"title": "Search product valid", "type": "Positive"}},
  {{"title": "Search product invalid", "type": "Negative"}},
  {{"title": "Search product edge", "type": "Edge"}},

  {{"title": "Add to cart valid", "type": "Positive"}},
  {{"title": "Add to cart invalid", "type": "Negative"}},
  {{"title": "Add to cart edge", "type": "Edge"}}
]
"""

        ai_text = call_ollama(prompt)
        print("RAW:", ai_text)

        extracted = extract_tests(ai_text)

        # 🔥 sécurité IA faible
        if len(extracted) < 6:
            print("⚠️ fallback utilisé")
            extracted = fallback_generator(sfd)
            source = "fallback"
        else:
            source = "ai"

        improved = [improve_test(t) for t in extracted]

        # 🔥 supprimer doublons
        unique = {}
        for t in improved:
            unique[t["title"] + t["type"]] = t

        final_tests = list(unique.values())

        # 🔥 renuméroter
        for i, t in enumerate(final_tests, start=1):
            t["id"] = f"TC_{i:03}"

        return {
            "source": source,
            "model": MODEL,
            "count": len(final_tests),
            "tests": final_tests
        }

    except Exception as e:
        raise HTTPException(500, str(e))