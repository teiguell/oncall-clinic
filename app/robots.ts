import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/patient/tracking/'],
    },
    sitemap: 'https://oncall.clinic/sitemap.xml',
  }
}
