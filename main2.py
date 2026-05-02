from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests, json, os, time, re
from openpyxl import Workbook

app = FastAPI()

# 🔐 API KEY
API_KEY = os.getenv("OPENROUTER_API_KEY")
if not API_KEY:
    raise ValueError("❌ OPENROUTER_API_KEY manquante")


# 📥 Request model
class SFDRequest(BaseModel):
    sfd: str


# 🎯 Scoring
def score_test(test):
    score = 0

    if test.get("priority") == "High":
        score += 2
    elif test.get("priority") == "Medium":
        score += 1

    if test.get("severity") == "Critical":
        score += 2
    elif test.get("severity") == "High":
        score += 1

    if test.get("type") in ["Security", "API"]:
        score += 2
    elif test.get("type") == "Negative":
        score += 1

    if len(test.get("steps", "")) > 50:
        score += 1

    return score


# 🔥 JSON extraction (ULTRA ROBUSTE)
def extract_json(text):
    # remove markdown
    text = re.sub(r"```json", "", text)
    text = re.sub(r"```", "", text).strip()

    # extract JSON array
    match = re.search(r"\[\s*{.*}\s*\]", text, re.DOTALL)

    if not match:
        raise ValueError("JSON non trouvé")

    json_text = match.group()

    # FIX erreurs IA fréquentes
    json_text = json_text.replace("\n", " ")

    # remove patterns like "a" * 255 (invalid JSON)
    json_text = re.sub(r'"\s*\*\s*\d+', '', json_text)

    try:
        return json.loads(json_text)
    except Exception as e:
        raise ValueError(f"JSON invalide après nettoyage: {e}")


#  API CALL (robuste)
def call_ai(payload, headers, retries=3):
    for _ in range(retries):
        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                return response.json()

            else:
                print("Erreur API:", response.text)

        except requests.exceptions.RequestException:
            pass

        time.sleep(2)

    raise HTTPException(status_code=500, detail="Erreur API OpenRouter")


#  Export Excel
def export_excel(tests):
    wb = Workbook()
    ws = wb.active
    ws.title = "QA Tests"

    headers = ["ID", "Title", "Category", "Type", "Priority", "Severity", "Score"]
    ws.append(headers)

    for t in tests:
        ws.append([
            t.get("id"),
            t.get("title"),
            t.get("category"),
            t.get("type"),
            t.get("priority"),
            t.get("severity"),
            t.get("score")
        ])

    wb.save("tests.xlsx")


#  HOME
@app.get("/")
def home():
    return {"message": "QA Generator API Ready 🚀"}


#  MAIN ENDPOINT
@app.post("/generate-tests")
def generate_tests(request: SFDRequest):

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "openrouter/auto",
        "temperature": 0.2,
        "messages": [
            {
                "role": "user",
                "content": f"""
Return ONLY valid JSON array.

NO markdown.
NO explanations.

Generate 15 QA test cases.

Format strictly:
[
  {{
    "id": "TC_001",
    "title": "...",
    "category": "...",
    "type": "Functional/Negative/Edge/Security/API/Performance",
    "steps": "...",
    "test_data": "...",
    "expected_result": "...",
    "priority": "High/Medium/Low",
    "severity": "Critical/High/Medium/Low",
    "confidence": 0.0
  }}
]

System:
{request.sfd}
"""
            }
        ]
    }

    #  call AI
    data = call_ai(payload, headers)

    try:
        content = data["choices"][0]["message"]["content"]
    except:
        raise HTTPException(status_code=500, detail="Réponse IA invalide")

    try:
        tests = extract_json(content)
    except Exception as e:
        return {
            "error": "Parsing failed",
            "details": str(e),
            "raw": content
        }

    #  scoring
    for t in tests:
        t["score"] = score_test(t)

    # export
    export_excel(tests)

    return {
        "count": len(tests),
        "tests": tests
    }