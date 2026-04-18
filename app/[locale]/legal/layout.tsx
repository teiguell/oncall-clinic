import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'
import { ChevronRight, ArrowLeft } from 'lucide-react'

export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const t = await getTranslations('legal')

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto max-w-4xl px-4 h-14 flex items-center gap-4">
          <Link href={`/${locale}`} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <nav className="flex items-center gap-1 text-sm text-gray-500">
            <Link href={`/${locale}`} className="hover:text-gray-900">OnCall Clinic</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900 font-medium">{t('breadcrumb')}</span>
          </nav>
        </div>
      </header>
      <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <p className="text-xs text-gray-500 mb-8">{t('lastUpdated')}: 17/04/2026</p>
        <article className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-a:text-blue-600 prose-strong:text-gray-900">
          {children}
        </article>
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-gray-500">
            &copy; 2026 Ibiza Care SL &middot; CIF: B-XXXXXXXX &middot; Ibiza, Espa&ntilde;a
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <Link href={`/${locale}/legal/terms`} className="text-blue-600 hover:underline">{t('navTerms')}</Link>
            <Link href={`/${locale}/legal/privacy`} className="text-blue-600 hover:underline">{t('navPrivacy')}</Link>
            <Link href={`/${locale}/legal/cookies`} className="text-blue-600 hover:underline">{t('navCookies')}</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
