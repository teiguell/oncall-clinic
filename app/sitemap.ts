import type { MetadataRoute } from 'next'
import { CITIES } from '@/lib/cities'

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

  // Round 20A-1: dropped /login + /register (auth surfaces, no SEO value
  // and they redirect for authed users). Added /clinica (Round 15A B2B
  // landing — high priority for clinic recruitment).
  const paths: Entry[] = [
    { path: '',                    priority: 1.0, changeFrequency: 'weekly' },
    // /pro is the doctor-acquisition landing (Round 13 v3). High
    // priority because doctor recruitment is the current bottleneck.
    { path: '/pro',                priority: 0.9, changeFrequency: 'weekly' },
    // Round 15A: /clinica is the B2B clinic-acquisition landing.
    // x-default → /es/clinica (clinics are Spanish businesses).
    { path: '/clinica',            priority: 0.9, changeFrequency: 'weekly' },
    // Round 20 Q3-1: public doctor listing (long-tail SEO + booking CTA).
    { path: '/medicos',            priority: 0.85, changeFrequency: 'daily' },
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

  // Round 20-B / Q3-4: programmatic per-city URLs.
  // 10 cities × 2 locales = 20 entries. Live cities get priority 0.85;
  // recruiting/coming-soon cities 0.7.
  for (const city of CITIES) {
    for (const locale of ['es', 'en'] as const) {
      const path = `/medico-domicilio/${city.slug}`
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: city.isLive ? 0.85 : 0.7,
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
