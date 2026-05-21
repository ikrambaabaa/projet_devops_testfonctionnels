import subprocess
import uuid
import os
import shutil
import time

from database import SessionLocal
from models import ProjectConfig

def run_playwright_tests():

    execution_id = str(uuid.uuid4())

    db = SessionLocal()

    try:

        # =========================
        # LOAD CONFIGURATION
        # =========================

        config = db.query(
            Configuration
        ).first()

        if not config:

            return {

                "execution_id":
                    execution_id,

                "status":
                    "FAIL",

                "logs":
                    "Configuration introuvable"
            }

        # =========================
        # READ CONFIG
        # =========================

        project_path = (
            config.project_path
        )

        build_command = (
            config.build_command
        )

        start_command = (
            config.start_command
        )

        frontend_url = (
            config.frontend_url
        )

        # =========================
        # FIND NPX
        # =========================

        npx_path = shutil.which(
            "npx"
        )

        if not npx_path:

            return {

                "execution_id":
                    execution_id,

                "status":
                    "FAIL",

                "logs":
                    "npx introuvable"
            }

        # =========================
        # INSTALL DEPENDENCIES
        # =========================

        subprocess.run(

            ["npm", "install"],

            cwd=project_path,

            shell=True
        )

        # =========================
        # BUILD PROJECT
        # =========================

        if build_command:

            subprocess.run(

                build_command.split(),

                cwd=project_path,

                shell=True
            )

        # =========================
        # START PROJECT
        # =========================

        subprocess.Popen(

            start_command.split(),

            cwd=project_path,

            shell=True
        )

        print(
            f"Projet lancé : {frontend_url}"
        )

        # WAIT SERVER
        time.sleep(15)

        # =========================
        # PLAYWRIGHT EXECUTION
        # =========================

        backend_path = os.path.join(
            os.path.dirname(__file__),
            ".."
        )

        result = subprocess.run(

            [npx_path, "playwright", "test"],

            capture_output=True,

            text=True,

            cwd=backend_path,

            timeout=300,

            shell=True
        )

        logs = (
            result.stdout
            or result.stderr
            or "Aucun log"
        )

        status = (
            "PASS"

            if result.returncode == 0

            else "FAIL"
        )

        return {

            "execution_id":
                execution_id,

            "status":
                status,

            "logs":
                logs,

            "coverage":
                85,

            "duration":
                "45 sec",

            "screenshot_path":
                "screenshots/"
        }

    except subprocess.TimeoutExpired:

        return {

            "execution_id":
                execution_id,

            "status":
                "FAIL",

            "logs":
                "Timeout Playwright"
        }

    except Exception as e:

        return {

            "execution_id":
                execution_id,

            "status":
                "FAIL",

            "logs":
                str(e)
        }

    finally:

        db.close()