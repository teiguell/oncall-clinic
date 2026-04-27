import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getBypassUser, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'
import { LayoutDashboard, Users, ListChecks, Settings } from 'lucide-react'

/**
 * /[locale]/clinic/* layout — Round 15 Block 2.1.
 *
 * Server layout. Gates:
 *   1. Real session OR bypass-user (role-aware: 'clinic') OR redirect.
 *   2. Bypass-aware role check: realUser is queried for `profiles.role`
 *      and must equal 'clinic'. Bypass user uses AUTH_BYPASS_ROLE
 *      (set at build time) — clinic bypass dashboards render even
 *      without a real `clinics` row (the dashboard handles "no clinic
 *      yet" by showing the verification-pending banner).
 *
 * UI: 2-col on md+ (sidebar 220px + content). Sidebar has nav links
 * for Dashboard, My doctors, Consultations, Settings. Header shows
 * the clinic name + verification status banner.
 *
 * Round 15A scope: layout is functional, but the verification banner
 * shows generic copy when no clinic row exists. Round 15B will fetch
 * the actual clinic row and adapt copy per verification_status.
 */
export default async function ClinicLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const supabase = await createClient()
  const {
    data: { user: realUser },
  } = await supabase.auth.getUser()
  const bypass = getBypassUser()
  const userId = realUser?.id ?? (bypass && AUTH_BYPASS_ROLE === 'clinic' ? bypass.id : null)

  if (!userId) {
    redirect(`/${locale}/clinic/login`)
  }

  // Role check: real users must have profiles.role='clinic'. Bypass
  // skips this — AUTH_BYPASS_ROLE='clinic' already passed the check above.
  if (realUser) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', realUser.id)
      .maybeSingle()
    if (profile?.role !== 'clinic') {
      redirect(`/${locale}/clinic/login`)
    }
  }

  // Fetch clinic row (may be null if owner just registered and not
  // yet verified, or if this is a bypass user without a real row).
  const { data: clinic } = await supabase
    .from('clinics')
    .select('id, name, verification_status, stripe_onboarding_complete')
    .eq('user_id', userId)
    .maybeSingle()

  const tNav = await getTranslations({ locale, namespace: 'clinicDashboard.nav' })
  const tHeader = await getTranslations({ locale, namespace: 'clinicDashboard.header' })

  const items = [
    { href: `/${locale}/clinic/dashboard`, icon: LayoutDashboard, label: tNav('dashboard') },
    { href: `/${locale}/clinic/doctors`, icon: Users, label: tNav('doctors') },
    { href: `/${locale}/clinic/consultations`, icon: ListChecks, label: tNav('consultations') },
    { href: `/${locale}/clinic/settings`, icon: Settings, label: tNav('settings') },
  ]

  // Verification banner — only shown when the clinic row is not yet
  // verified. Bypass / no-row flows show pending copy.
  let banner: { tone: 'pending' | 'rejected' | 'suspended'; text: string } | null = null
  const status = clinic?.verification_status ?? 'pending'
  if (status === 'pending') banner = { tone: 'pending', text: tHeader('verificationPending') }
  else if (status === 'rejected') banner = { tone: 'rejected', text: tHeader('verificationRejected') }
  else if (status === 'suspended') banner = { tone: 'suspended', text: tHeader('verificationSuspended') }

  const bannerStyle = {
    pending: { bg: '#FFFBEB', border: '#FCD34D', text: '#78350F' },
    rejected: { bg: '#FEF2F2', border: '#FCA5A5', text: '#7F1D1D' },
    suspended: { bg: '#F1F5F9', border: '#CBD5E1', text: '#0F172A' },
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between" style={{ padding: '14px clamp(18px, 3vw, 28px)' }}>
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <div
              className="grid place-items-center text-white font-bold"
              aria-hidden="true"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #4F46E5, #1E1B4B)',
                fontSize: 14,
              }}
            >
              O
            </div>
            <span className="text-[15px] font-semibold tracking-[-0.4px] text-[#0B1220]">
              OnCall <span className="text-slate-500 font-medium">Clínicas</span>
            </span>
          </Link>
          <div className="text-sm text-slate-600">{clinic?.name ?? bypass?.email ?? ''}</div>
        </div>
        {banner && (
          <div
            style={{
              padding: '10px 28px',
              background: bannerStyle[banner.tone].bg,
              borderTop: `1px solid ${bannerStyle[banner.tone].border}`,
              color: bannerStyle[banner.tone].text,
              fontSize: 13.5,
            }}
          >
            {banner.text}
          </div>
        )}
      </header>

      <div className="flex max-w-[1400px] mx-auto" style={{ padding: '0' }}>
        {/* Sidebar */}
        <aside
          className="hidden md:block sticky top-0 self-start"
          style={{
            width: 220,
            padding: 'clamp(20px, 2vw, 28px) 14px',
            borderRight: '1px solid #E2E8F0',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 text-slate-700 hover:bg-slate-100 transition-colors text-[14px]"
                style={{ padding: '9px 12px', borderRadius: 8 }}
              >
                <item.icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile bottom-tab nav */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 grid grid-cols-4"
          aria-label="Clinic navigation"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-2 text-slate-600"
              style={{ fontSize: 11 }}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1" style={{ padding: 'clamp(20px, 3vw, 36px)', paddingBottom: 80 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
