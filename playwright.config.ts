import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for OnCall Clinic E2E simulation.
 *
 * 2 projects:
 *   - desktop: Chromium @ 1440×900
 *   - mobile:  iPhone 14 (390×844)
 *
 * Base URL: overrideable via BASE_URL env (default http://localhost:3000).
 * In CI we point at the live Vercel deploy URL post-deploy.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // booking/consultation state is sequential
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['html'], ['github']] : 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 14'],
      },
    },
  ],
})
