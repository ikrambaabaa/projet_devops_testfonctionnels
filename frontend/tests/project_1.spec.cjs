const { test, expect } = require('@playwright/test');

test('Création, validation, remise et paiement d\'une facture client - scénario complet', async ({ page }) => {
  // -------------------------------------------------
  // 1️⃣ Connexion à l'application (pré‑requis)
  // -------------------------------------------------
  await page.goto('http://localhost:3000');
await expect(page).toHaveTitle(/Bank/i);

  // Vérifier que la connexion a réussi
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('text=Bienvenue, test_user')).toBeVisible();

  // -------------------------------------------------
  // 2️⃣ Création d'une facture client
  // -------------------------------------------------
  await page.goto('https://example.com/invoices');
  await page.click('button:has-text("Nouvelle facture")');

  // Remplir le formulaire de création
  await page.fill('#client-select', 'Acme Corp');               // sélection du client
  await page.fill('#invoice-number', 'INV-2024-001');           // numéro de facture
  await page.fill('#invoice-date', '2024-06-01');               // date
  await page.fill('#invoice-amount', '1500');                   // montant HT
  await page.selectOption('#tax-rate', '20');                  // TVA 20%
  await page.click('button:has-text("Enregistrer")');

  // Assertion : la facture apparaît dans la liste avec le bon statut "Brouillon"
  const invoiceRow = page.locator('tr', { hasText: 'INV-2024-001' });
  await expect(invoiceRow).toBeVisible();
  await expect(invoiceRow.locator('td.status')).toHaveText('Brouillon');

  // -------------------------------------------------
  // 3️⃣ Validation de la commande (passage du statut à "Validée")
  // -------------------------------------------------
  await invoiceRow.locator('button:has-text("Valider")').click();

  // Confirmation modal
  await page.click('button:has-text("Confirmer")');

  // Assertion : le statut passe à "Validée"
  await expect(invoiceRow.locator('td.status')).toHaveText('Validée');

  // -------------------------------------------------
  // 4️⃣ Gestion d'une remise client
  // -------------------------------------------------
  await invoiceRow.locator('button:has-text("Appliquer remise")').click();

  // Formulaire de remise
  await page.fill('#discount-percentage', '10'); // 10 % de remise
  await page.click('button:has-text("Appliquer")');

  // Assertion : le montant TTC est recalculé (1500 * 1.20 = 1800 → -10 % = 1620)
  const amountCell = invoiceRow.locator('td.amount');
  await expect(amountCell).toHaveText('1 620,00 €');

  // -------------------------------------------------
  // 5️⃣ Paiement de la facture
  // -------------------------------------------------
  await invoiceRow.locator('button:has-text("Payer")').click();

  // Formulaire de paiement
  await page.fill('#payment-method', 'Carte bancaire');
  await page.fill('#payment-reference', 'PAY-2024-001');
  await page.click('button:has-text("Confirmer le paiement")');

  // Assertion : le statut passe à "Payée"
  await expect(invoiceRow.locator('td.status')).toHaveText('Payée');

  // -------------------------------------------------
  // 6️⃣ Cas d'erreur : paiement avec montant incorrect
  // -------------------------------------------------
  // Créer une deuxième facture pour tester l'erreur
  await page.goto('https://example.com/invoices');
  await page.click('button:has-text("Nouvelle facture")');
  await page.fill('#client-select', 'Acme Corp');
  await page.fill('#invoice-number', 'INV-2024-002');
  await page.fill('#invoice-date', '2024-06-02');
  await page.fill('#invoice-amount', '500');
  await page.selectOption('#tax-rate', '20');
  await page.click('button:has-text("Enregistrer")');

  const secondInvoiceRow = page.locator('tr', { hasText: 'INV-2024-002' });
  await secondInvoiceRow.locator('button:has-text("Valider")').click();
  await page.click('button:has-text("Confirmer")');

  // Tentative de paiement avec un montant supérieur au total
  await secondInvoiceRow.locator('button:has-text("Payer")').click();
  await page.fill('#payment-method', 'Carte bancaire');
  await page.fill('#payment-amount', '1000'); // montant erroné
  await page.click('button:has-text("Confirmer le paiement")');

  // Assertion : affichage d'un message d'erreur et le statut reste "Validée"
  await expect(page.locator('.notification.error')).toHaveText(/Le montant du paiement ne correspond pas au total de la facture/);
  await expect(secondInvoiceRow.locator('td.status')).toHaveText('Validée');

  // -------------------------------------------------
  // 7️⃣ Nettoyage (déconnexion)
  // -------------------------------------------------
  await page.click('button:has-text("Déconnexion")');
  await expect(page).toHaveURL(/login/);
});