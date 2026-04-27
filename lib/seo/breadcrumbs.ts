/**
 * Breadcrumbs helper for JSON-LD BreadcrumbList — Round 20A-6.
 *
 * Generates a schema.org BreadcrumbList object from an ordered list of
 * { name, url } pairs. The page renders it as a <script type="application/ld+json">
 * tag (server-side) so search engines can show breadcrumb-rich snippets
 * in the SERP.
 *
 * Usage:
 *   const crumbs = breadcrumbsSchema([
 *     { name: 'Home', url: 'https://oncall.clinic/es' },
 *     { name: 'Pro', url: 'https://oncall.clinic/es/pro' },
 *   ])
 *   <script type="application/ld+json"
 *           dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
 */
export interface Crumb {
  name: string
  url: string
}

export function breadcrumbsSchema(items: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
