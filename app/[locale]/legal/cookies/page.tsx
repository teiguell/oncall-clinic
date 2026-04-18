import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Cookies | Cookie Policy',
}

export default async function CookiesPage() {
  const t = await getTranslations('legal')

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{t('cookies.title')}</h1>
      <p className="text-sm text-gray-500 mb-8">{t('cookies.effectiveDate')}</p>

      {/* Intro */}
      <section className="mb-8">
        <p>{t('cookies.intro')}</p>
      </section>

      {/* What are cookies */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('cookies.whatTitle')}</h2>
        <p>{t('cookies.whatDesc')}</p>
      </section>

      {/* Cookie table */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('cookies.tableTitle')}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold border-b">{t('cookies.colName')}</th>
                <th className="px-4 py-2 text-left font-semibold border-b">{t('cookies.colType')}</th>
                <th className="px-4 py-2 text-left font-semibold border-b">{t('cookies.colPurpose')}</th>
                <th className="px-4 py-2 text-left font-semibold border-b">{t('cookies.colDuration')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2 font-mono text-xs">sb-*-auth-token</td>
                <td className="px-4 py-2">{t('cookies.technical')}</td>
                <td className="px-4 py-2">{t('cookies.authPurpose')}</td>
                <td className="px-4 py-2">{t('cookies.sessionDuration')}</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2 font-mono text-xs">NEXT_LOCALE</td>
                <td className="px-4 py-2">{t('cookies.technical')}</td>
                <td className="px-4 py-2">{t('cookies.localePurpose')}</td>
                <td className="px-4 py-2">1 {t('cookies.year')}</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2 font-mono text-xs">cookie_consent</td>
                <td className="px-4 py-2">{t('cookies.technical')}</td>
                <td className="px-4 py-2">{t('cookies.consentPurpose')}</td>
                <td className="px-4 py-2">1 {t('cookies.year')}</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2 font-mono text-xs">_ga, _ga_*</td>
                <td className="px-4 py-2">{t('cookies.analytics')}</td>
                <td className="px-4 py-2">{t('cookies.gaPurpose')}</td>
                <td className="px-4 py-2">2 {t('cookies.years')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-gray-500">{t('cookies.noMarketing')}</p>
      </section>

      {/* How to manage */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('cookies.manageTitle')}</h2>
        <p>{t('cookies.manageDesc')}</p>
      </section>

      {/* Legal basis */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('cookies.legalTitle')}</h2>
        <p>{t('cookies.legalDesc')}</p>
      </section>
    </div>
  )
}
