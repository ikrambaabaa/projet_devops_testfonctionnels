import subprocess
import uuid
import os
import shutil


def run_playwright_tests():

    execution_id = str(uuid.uuid4())

    # 🔍 Trouver npx automatiquement sur Windows et Linux
    npx_path = shutil.which("npx")

    if not npx_path:
        return {
            "execution_id": execution_id,
            "status": "FAIL",
            "logs": "npx introuvable. Installe Node.js et vérifie ton PATH."
        }

    try:

        result = subprocess.run(
            [npx_path, "playwright", "test"],
            capture_output=True,
            text=True,
            # 🗂️ Dossier frontend où se trouve playwright.config.js
            cwd=os.path.join(os.path.dirname(__file__), "..", "..", "frontend"),
            # ⏱️ Timeout 5 minutes
            timeout=300,
            # 🪟 Windows : évite l'ouverture de fenêtre console
            shell=False
        )

        logs = result.stdout or result.stderr or "Aucun log"

        status = "PASS" if result.returncode == 0 else "FAIL"

        return {
            "execution_id": execution_id,
            "status": status,
            "logs": logs
        }

    except subprocess.TimeoutExpired:
        return {
            "execution_id": execution_id,
            "status": "FAIL",
            "logs": "Timeout : les tests ont dépassé 5 minutes"
        }

    except Exception as e:
        return {
            "execution_id": execution_id,
            "status": "FAIL",
            "logs": str(e)
        }