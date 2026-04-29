import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

/**
 * Visual breadcrumbs — Round 23-3 (Q5-5).
 *
 * Server component that renders an `<nav>` with `aria-label="Breadcrumb"`
 * containing an ordered list of links. The current page is the last
 * item with no `href` and `aria-current="page"`. Pairs with the
 * `breadcrumbsSchema()` JSON-LD helper in `lib/seo/breadcrumbs.ts` —
 * the same crumb list usually feeds both, so search engines see the
 * structured data **and** users see the visible navigation path.
 *
 * Use on city pages, /medicos, /clinica, /pro, /contact (any page
 * that's >1 hop from the locale root). Don't render on the locale
 * root itself or on funnel pages where the breadcrumb would just
 * duplicate the back button.
 *
 * The chevron is purely decorative — sequencing is conveyed via the
 * `<ol>` semantics, not the icon.
 */

export interface Crumb {
  /** Visible label, usually the page H1 or a shorter alias. */
  label: string
  /** Optional absolute or root-relative URL. Omit on the current page. */
  href?: string
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[]
  className?: string
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={className ?? 'text-sm text-slate-600 mb-4'}
    >
      <ol className="flex items-center gap-1.5 flex-wrap list-none p-0 m-0">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={`${i}-${item.label}`} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-slate-400 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-slate-600 hover:text-slate-900 hover:underline transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'text-slate-900 font-medium' : 'text-slate-600'}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
