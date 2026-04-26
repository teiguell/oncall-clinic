import type { MetadataRoute } from 'next'

const BASE_URL = 'https://oncall.clinic'

/**
 * Dynamic sitemap at /sitemap.xml (Next.js App Router).
 * Only lists PUBLIC routes that actually exist. Authenticated routes
 * (dashboard, tracking, profile, doctor/*) are intentionally excluded
 * and blocked via robots.ts.
 *
 * Audit P1-3 (2026-04-23): cleaned out the /servicios/* URLs that
 * never shipped (404-generating sitemap entries hurt SEO), added /about,
 * and wired hreflang alternates.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  type Entry = {
    path: string
    priority: number
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  }

  const paths: Entry[] = [
    { path: '',                    priority: 1.0, changeFrequency: 'weekly' },
    // Round 10 — /pro is the doctor-acquisition landing. High priority
    // because doctor recruitment is the current bottleneck, and Spanish
    // is the primary target market (x-default → /es/pro).
    { path: '/pro',                priority: 0.9, changeFrequency: 'weekly' },
    { path: '/login',              priority: 0.5, changeFrequency: 'monthly' },
    { path: '/register',           priority: 0.6, changeFrequency: 'monthly' },
    { path: '/patient/request',    priority: 0.9, changeFrequency: 'weekly' },
    { path: '/contact',            priority: 0.7, changeFrequency: 'monthly' },
    { path: '/about',              priority: 0.6, changeFrequency: 'monthly' },
    { path: '/legal/privacy',      priority: 0.4, changeFrequency: 'yearly' },
    { path: '/legal/terms',        priority: 0.4, changeFrequency: 'yearly' },
    { path: '/legal/cookies',      priority: 0.4, changeFrequency: 'yearly' },
    { path: '/legal/aviso-legal',  priority: 0.4, changeFrequency: 'yearly' },
  ]

  const entries: MetadataRoute.Sitemap = []
  for (const { path, priority, changeFrequency } of paths) {
    for (const locale of ['es', 'en'] as const) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency,
        priority,
        alternates: {
          languages: {
            es: `${BASE_URL}/es${path}`,
            en: `${BASE_URL}/en${path}`,
          },
        },
      })
    }
  }

  return entries
}
