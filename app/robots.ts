import type { MetadataRoute } from 'next'

/**
 * robots.txt at /robots.txt (Next.js App Router).
 *
 * Audit P1-3 (2026-04-23): extended the Disallow list to cover every
 * authenticated area (patient + doctor + admin + API). The sitemap only
 * references the public subset; search engines should not try to crawl
 * deeper and hit the /login redirects from authenticated routes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/doctor/onboarding',
        '/doctor/dashboard',
        '/doctor/consultations',
        '/doctor/profile',
        '/doctor/earnings',
        '/patient/request',
        '/patient/dashboard',
        '/patient/tracking/',
        '/patient/profile',
        '/patient/history',
        '/patient/privacy',
        '/patient/booking-success',
        // Round 20A-4: clinic dashboard surfaces under /clinic/*
        '/clinic/dashboard',
        '/clinic/doctors',
        '/clinic/consultations',
        '/clinic/settings',
        // Auth flows have no SEO value; the public landings link in
        '/login',
        '/register',
      ],
    },
    sitemap: 'https://oncall.clinic/sitemap.xml',
  }
}
