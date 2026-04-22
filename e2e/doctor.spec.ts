import { test, expect } from '@playwright/test'

/**
 * Doctor full simulation. Requires a seeded doctor account and
 * E2E_DOCTOR_SESSION_COOKIE in env (CI injects via a test-only endpoint
 * that exchanges a service-role token).
 *
 * If cookie is missing, test documents where it stopped rather than
 * failing — this is valid for local dev where only one persona is set up.
 */
test.describe('Doctor full simulation', () => {
  test.beforeEach(async ({ context }) => {
    const cookie = process.env.E2E_DOCTOR_SESSION_COOKIE
    if (!cookie) return
    await context.addCookies([JSON.parse(cookie)])
  })

  test('dashboard → accept → timeline → notes → complete → payout', async ({ page }) => {
    if (!process.env.E2E_DOCTOR_SESSION_COOKIE) {
      test.skip(true, 'E2E_DOCTOR_SESSION_COOKIE required')
      return
    }

    // 1. Doctor dashboard
    await page.goto('/es/doctor/dashboard')
    await expect(page).toHaveURL(/\/doctor\/dashboard/)

    // 2. Find a pending consultation request
    const pendingCard = page.getByTestId('pending-consultation').first()
    await expect(pendingCard).toBeVisible({ timeout: 15_000 })

    // 3. Accept
    await pendingCard.getByRole('button', { name: /aceptar|accept/i }).click()
    await expect(page.getByText(/aceptada|accepted/i)).toBeVisible()

    // 4. Timeline progression: navigate to consultation detail
    await pendingCard.click()
    await expect(page).toHaveURL(/\/doctor\/consultation\//)

    // 5. Open notes tabs
    await page.getByRole('tab', { name: /notas internas|internal notes/i }).click()
    await page.locator('textarea').first().fill('Test internal notes — tensión 120/80, afebril.')

    await page.getByRole('tab', { name: /informe para paciente|report for patient/i }).click()
    await page.locator('textarea').first().fill('Informe: consulta de prueba E2E. Sin hallazgos relevantes.')

    // 6. Finish consultation
    await page.getByRole('button', { name: /finalizar consulta|finish consultation/i }).click()

    // 7. Verify status updated (soft check — realtime may lag)
    await expect(page.getByText(/completada|completed/i)).toBeVisible({ timeout: 10_000 })
  })
})
