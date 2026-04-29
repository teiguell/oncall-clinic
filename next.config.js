const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Round 6 (2026-04-25) — production sourcemaps so #418 stack traces
  // resolve to original .tsx files in DevTools. Adds ~2× JS payload to
  // the static build but is the only way to diagnose minified React
  // errors without a custom webpack hook.
  productionBrowserSourceMaps: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'storage.googleapis.com',
    ],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ]
  },
  // Round 23-1 (Q5-1) — programmatic-SEO city seed pivoted from 10
  // generic Spanish metros to 8 high-tourism destinations (islands +
  // costas). The old slugs used to render under
  // `/[locale]/medico-domicilio/[city]` and were indexed by Google.
  // 301-redirect them so we don't lose the SEO equity:
  //   - madrid / barcelona / valencia / sevilla / bilbao → /medicos
  //     (no longer covered as a programmatic city; doctors listing is
  //     the most relevant landing for these queries)
  //   - marbella / malaga → /medico-domicilio/costa-del-sol
  //     (Costa del Sol now covers the entire coastal strip including
  //     these municipalities)
  //   - alicante → /medico-domicilio/costa-blanca (same logic)
  // Permanent (308) redirects so search engines transfer rank.
  async redirects() {
    const droppedToListing = ['madrid', 'barcelona', 'valencia', 'sevilla', 'bilbao']
    const droppedRedirects = droppedToListing.flatMap((slug) => [
      {
        source: `/es/medico-domicilio/${slug}`,
        destination: '/es/medicos',
        permanent: true,
      },
      {
        source: `/en/medico-domicilio/${slug}`,
        destination: '/en/medicos',
        permanent: true,
      },
    ])
    const renamedRedirects = [
      // Marbella + Málaga → Costa del Sol
      { source: '/es/medico-domicilio/marbella', destination: '/es/medico-domicilio/costa-del-sol', permanent: true },
      { source: '/en/medico-domicilio/marbella', destination: '/en/medico-domicilio/costa-del-sol', permanent: true },
      { source: '/es/medico-domicilio/malaga', destination: '/es/medico-domicilio/costa-del-sol', permanent: true },
      { source: '/en/medico-domicilio/malaga', destination: '/en/medico-domicilio/costa-del-sol', permanent: true },
      // Alicante → Costa Blanca
      { source: '/es/medico-domicilio/alicante', destination: '/es/medico-domicilio/costa-blanca', permanent: true },
      { source: '/en/medico-domicilio/alicante', destination: '/en/medico-domicilio/costa-blanca', permanent: true },
    ]
    return [...droppedRedirects, ...renamedRedirects]
  },
}

module.exports = withNextIntl(nextConfig)
