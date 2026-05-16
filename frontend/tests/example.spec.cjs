const { test, expect } = require('@playwright/test');
test('page login accessible', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page).toBeTruthy();
});
