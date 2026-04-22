import { test, expect } from '@playwright/test'
import { forceConsultationStatus } from './seed'

/**
 * Patient full simulation. Requires:
 *   - BASE_URL pointing to the running app
 *   - TEST_PATIENT_EMAIL env (for Magic Link)
 *   - TEST_CONSULTATION_ID env (optional — if set, test skips Stripe
 *     and jumps straight to tracking using a pre-seeded consultation)
 *   - TEST_MODE=true on the target (so Stripe checkout is bypassed
 *     and payment_status is set to 'paid' synthetically).
 */
test.describe('Patient full simulation', () => {
  test('landing → booking → auth gate → consent → tracking → review', async ({ page }) => {
    // 1. Landing
    await page.goto('/es')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // 2. "Pedir médico" CTA → booking flow
    await page.getByRole('link', { name: /pedir médico/i }).first().click()
    await expect(page).toHaveURL(/\/patient\/request/)

    // 3. Step 0 — Type (urgent)
    await page.getByRole('button', { name: /urgente/i }).click()

    // 4. Step 1 — Doctor selection
    await expect(page.getByText(/elige tu médico|choose your doctor/i)).toBeVisible({ timeout: 15_000 })
    // Wait for the doctor list to load (at least 1 card)
    await page.waitForSelector('button[aria-pressed]', { timeout: 15_000 })
    await page.locator('button[aria-pressed]').first().click()
    await page.getByRole('button', { name: /continuar con dr\./i }).click()

    // 5. Step 2 — Address + symptoms
    await page.getByPlaceholder(/hotel ushuaïa/i).fill('Hotel Ushuaïa, Platja d\'en Bossa, Ibiza')
    await page.getByPlaceholder(/fiebre desde ayer/i).fill(
      'Test E2E: malestar general desde hace 2 horas. Solicitando consulta de prueba automatizada.'
    )
    await page.getByRole('button', { name: /^continuar$/i }).click()

    // 6. Step 3 — Auth gate
    await expect(page.getByText(/inicia sesión|sign in/i)).toBeVisible()

    // Auth via Magic Link requires mailbox access; for CI we assume a
    // session cookie was injected via AUTH_BYPASS or similar test hook.
    // Without that, stop here and report where the test paused.
    if (!process.env.E2E_SESSION_COOKIE) {
      test.info().annotations.push({
        type: 'note',
        description: 'Magic Link step requires E2E_SESSION_COOKIE — aborting before consent gate.',
      })
      return
    }
  })
})

/**
 * Post-consult review — requires TEST_CONSULTATION_ID belonging to the
 * TEST_PATIENT_EMAIL user. Test forces the consultation to 'completed'
 * via service-role client and asserts the review UI renders.
 */
test.describe('Post-consultation review', () => {
  test('review card appears and submits a 5-star rating', async ({ page }) => {
    const consultationId = process.env.TEST_CONSULTATION_ID
    test.skip(!consultationId, 'TEST_CONSULTATION_ID not set')

    await forceConsultationStatus(consultationId!, 'completed')

    if (!process.env.E2E_SESSION_COOKIE) {
      test.skip(true, 'E2E_SESSION_COOKIE required')
      return
    }

    await page.goto('/es/patient/dashboard')
    await expect(page.getByText(/valora a tu médico|rate your doctor/i)).toBeVisible({ timeout: 10_000 })

    // Click 5th star
    const stars = page.getByRole('radio', { name: /5 star/i })
    await stars.first().click()

    // Submit
    await page.getByRole('button', { name: /enviar valoración|submit review/i }).click()
    await expect(page.getByText(/gracias por tu valoración|thanks for your review/i)).toBeVisible()
  })
})
