from fastapi import APIRouter

from services.playwright_service import (
    run_playwright_tests
)

router = APIRouter()


# =========================
# EXECUTE PLAYWRIGHT TESTS
# =========================

@router.post(
    "/projects/{project_id}/generate-tests"
)
async def generate_tests(
    project_id: int
):

    result = run_playwright_tests()

    return {

        "message":
            "Exécution Playwright terminée",

        "execution":
            result
    }


# =========================
# GENERATE PLAYWRIGHT SCRIPT
# =========================

@router.post(
    "/projects/{project_id}/tests/generate-script"
)
async def generate_playwright_script(
    project_id: int
):

    script = """

test('Login utilisateur', async ({ page }) => {

  await page.goto(
    'http://localhost:3000'
  )

  await page.fill(
    'input[type=email]',
    'test@test.com'
  )

  await page.fill(
    'input[type=password]',
    '123456'
  )

  await page.click('button')

})
"""

    return {

        "message":
            "Script Playwright généré",

        "script":
            script
    }