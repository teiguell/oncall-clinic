/**
 * /feed.xml — Round 23-2 (Q5-2) RSS feed.
 *
 * Empty channel for now (no articles published yet) but the URL
 * exists with a valid 200 response, correct MIME, and self-link, so
 * directory submitters / aggregators don't 404 the feed when crawling
 * `<link rel="alternate" type="application/rss+xml">` (added to the
 * blog page once articles ship).
 *
 * Cache 1h via the Vercel CDN — refreshing daily is enough for a
 * blog. Once we ship articles, the response will read from a
 * `articles` table (or filesystem .mdx) and emit one `<item>` per
 * post.
 */
export async function GET(): Promise<Response> {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>OnCall Clinic Blog</title>
    <link>https://oncall.clinic/es/blog</link>
    <atom:link href="https://oncall.clinic/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Salud para turistas internacionales en España — artículos del equipo OnCall.</description>
    <language>es-ES</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
