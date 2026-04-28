import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LogoMark } from './LogoMark'

/**
 * Dark navy footer — server component. Mirrors v3 design columns:
 * brand + tagline (1.4fr) | Service | Company | Legal (1fr each).
 *
 * Round 11 R7: NO clinical-data references in any link or copy.
 */
export function FooterV3({ locale }: { locale: string }) {
  const t = useTranslations('landingV3.footer')

  const COLS: { titleKey: string; links: { labelKey: string; href: string }[] }[] = [
    {
      titleKey: 'service',
      links: [
        { labelKey: 'links.howItWorks', href: '#como-funciona' },
        { labelKey: 'links.pricing', href: '#servicio' },
        // Audit B1 (2026-04-28): hoteles link removed (was misleading
        // — pointed to /contact but suggested partnership info that
        // doesn't exist yet). Recreate when hotel partner program ships.
        { labelKey: 'links.insurance', href: `/${locale}/contact` },
      ],
    },
    {
      titleKey: 'company',
      links: [
        { labelKey: 'links.about', href: `/${locale}/about` },
        { labelKey: 'links.contact', href: `/${locale}/contact` },
        { labelKey: 'links.press', href: `/${locale}/contact` },
        { labelKey: 'links.join', href: `/${locale}/pro` },
      ],
    },
    {
      titleKey: 'legal',
      links: [
        { labelKey: 'links.noticeLegal', href: `/${locale}/legal/aviso-legal` },
        { labelKey: 'links.privacy', href: `/${locale}/legal/privacy` },
        { labelKey: 'links.cookies', href: `/${locale}/legal/cookies` },
        { labelKey: 'links.terms', href: `/${locale}/legal/terms` },
      ],
    },
  ]

  return (
    <footer
      className="text-slate-400"
      style={{
        padding: 'clamp(32px, 5vw, 56px) clamp(22px, 6vw, 80px) clamp(28px, 4vw, 40px)',
        background: '#0B1220',
        fontSize: 13,
      }}
    >
      <div
        className="mx-auto flex flex-col md:grid gap-6 md:gap-10"
        style={{ maxWidth: 1180, gridTemplateColumns: '1.4fr 1fr 1fr 1fr' }}
      >
        {/* Brand column */}
        <div>
          <LogoMark size={28} white />
          <p className="mt-3.5 leading-[1.5] max-w-[320px]">{t('tagline')}</p>
        </div>

        {/* Link columns */}
        {COLS.map((col) => (
          <div key={col.titleKey}>
            <div className="text-white font-semibold text-[13.5px] mb-3.5">
              {t(col.titleKey)}
            </div>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className="mx-auto pt-5 mt-8 flex flex-col md:flex-row gap-2.5 justify-between md:items-center"
        style={{
          maxWidth: 1180,
          borderTop: '1px solid rgba(255,255,255,.08)',
          fontSize: 12,
          color: '#64748B',
        }}
      >
        <div>{t('company_line', { year: new Date().getFullYear() })}</div>
        <div className="flex gap-4">
          <span>{t('emergency')}</span>
          <span>·</span>
          <span>{t('languages')}</span>
        </div>
      </div>
    </footer>
  )
}
