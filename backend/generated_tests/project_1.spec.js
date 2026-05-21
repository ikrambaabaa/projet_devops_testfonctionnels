const { test, expect } = require('@playwright/test');

test(
  'Test application bancaire React',

  async ({ page }) => {

    // Ouvrir application React

    await page.goto(
      'http://localhost:3000'
    );

    // Attendre chargement

    await page.waitForTimeout(
      5000
    );

    // Vérifier titre page

    await expect(page).toHaveTitle(
      /Bank/i
    );

    // Vérifier présence body

    await expect(
      page.locator('body')
    ).toBeVisible();

    // Screenshot QA

    await page.screenshot({

      path:
        'banking-homepage.png'
    });
  }
);