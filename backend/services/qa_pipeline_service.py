import subprocess
import time

from database import SessionLocal
from models.configuration import Configuration


def execute_qa_pipeline():

    db = SessionLocal()

    try:

        # =====================
        # LOAD CONFIGURATION
        # =====================

        config = db.query(
            Configuration
        ).first()

        if not config:

            print(
                "Configuration introuvable"
            )

            return

        # =====================
        # READ CONFIG
        # =====================

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

        # =====================
        # INSTALL DEPENDENCIES
        # =====================

        print(
            "Installation dépendances..."
        )

        subprocess.run(

            ["npm", "install"],

            cwd=project_path,

            shell=True
        )

        # =====================
        # BUILD PROJECT
        # =====================

        if build_command:

            print(
                "Build projet..."
            )

            subprocess.run(

                build_command.split(),

                cwd=project_path,

                shell=True
            )

        # =====================
        # START PROJECT
        # =====================

        print(
            "Démarrage projet..."
        )

        subprocess.Popen(

            start_command.split(),

            cwd=project_path,

            shell=True
        )

        # =====================
        # WAIT SERVER
        # =====================

        print(
            "Attente serveur..."
        )

        time.sleep(15)

        print(
            f"Projet lancé : {frontend_url}"
        )

        # =====================
        # EXECUTE PLAYWRIGHT
        # =====================

        backend_path = (
            r"C:\Users\DELL\Documents\test_projet\backend"
        )

        print(
            "Exécution Playwright..."
        )

        subprocess.run(

            ["npx", "playwright", "test"],

            cwd=backend_path,

            shell=True
        )

        print(
            "Tests QA terminés"
        )

    except Exception as e:

        print(
            f"Erreur pipeline : {e}"
        )

    finally:

        db.close()


# =====================
# EXECUTE
# =====================

if __name__ == "__main__":

    execute_qa_pipeline()