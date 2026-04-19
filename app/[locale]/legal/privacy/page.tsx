import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getLocale } from 'next-intl/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad | Privacy Policy',
}

export default async function PrivacyPolicyPage() {
  const t = await getTranslations('legal')
  const locale = await getLocale()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{t('privacy.title')}</h1>
      <p className="text-sm text-gray-500 mb-4">{t('privacy.effectiveDate')}</p>
      <p className="mb-8 leading-relaxed">{t('privacy.lopdgddIntro')}</p>

      {/* 1. Data Controller */}
      <section className="mb-8" id="controller">
        <h2 className="text-xl font-semibold mb-3">{t('privacy.s1Title')}</h2>
        <ul className="space-y-1">
          <li><strong>{t('privacy.company')}:</strong> Ibiza Care SL</li>
          <li><strong>CIF:</strong> B19973569</li>
          <li><strong>{t('privacy.address')}:</strong> C/ Lugo 11, 3º2ª, Sant Josep de Sa Talaia, Illes Balears, España</li>
          <li><strong>DPO:</strong> Tei &mdash; <a href="mailto:dpo@oncall.clinic" className="text-blue-600 hover:underline">dpo@oncall.clinic</a></li>
        </ul>
      </section>

      {/* 2. Purposes & Legal Basis */}
      <section className="mb-8" id="purposes">
        <h2 className="text-xl font-semibold mb-3">{t('privacy.s2Title')}</h2>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-sm">{t('privacy.purpose1Title')}</h3>
            <p className="text-sm mt-1">{t('privacy.purpose1Desc')}</p>
            <p className="text-xs text-gray-500 mt-1">{t('privacy.purpose1Legal')}</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-sm">{t('privacy.purpose2Title')}</h3>
            <p className="text-sm mt-1">{t('privacy.purpose2Desc')}</p>
            <p className="text-xs text-gray-500 mt-1">{t('privacy.purpose2Legal')}</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-sm">{t('privacy.purpose3Title')}</h3>
            <p className="text-sm mt-1">{t('privacy.purpose3Desc')}</p>
            <p className="text-xs text-gray-500 mt-1">{t('privacy.purpose3Legal')}</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-sm">{t('privacy.purpose4Title')}</h3>
            <p className="text-sm mt-1">{t('privacy.purpose4Desc')}</p>
            <p className="text-xs text-gray-500 mt-1">{t('privacy.purpose4Legal')}</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-sm">{t('privacy.purpose5Title')}</h3>
            <p className="text-sm mt-1">{t('privacy.purpose5Desc')}</p>
            <p className="text-xs text-gray-500 mt-1">{t('privacy.purpose5Legal')}</p>
          </div>
          <div className="border rounded-lg p-4 border-amber-200 bg-amber-50">
            <h3 className="font-semibold text-sm">{t('privacy.purpose6Title')}</h3>
            <p className="text-sm mt-1">{t('privacy.purpose6Desc')}</p>
            <p className="text-xs text-gray-500 mt-1">{t('privacy.purpose6Legal')}</p>
          </div>
        </div>
      </section>

      {/* 3. Recipients / Third Parties */}
      <section className="mb-8" id="recipients">
        <h2 className="text-xl font-semibold mb-3">{t('privacy.s3Title')}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold border-b">{t('privacy.colProvider')}</th>
                <th className="px-4 py-2 text-left font-semibold border-b">{t('privacy.colPurpose')}</th>
                <th className="px-4 py-2 text-left font-semibold border-b">{t('privacy.colLocation')}</th>
                <th className="px-4 py-2 text-left font-semibold border-b">{t('privacy.colGuarantee')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="px-4 py-2">Supabase Inc.</td><td className="px-4 py-2">{t('privacy.supabasePurpose')}</td><td className="px-4 py-2">EU (Frankfurt)</td><td className="px-4 py-2">{t('privacy.gdprCompliant')}</td></tr>
              <tr className="border-b"><td className="px-4 py-2">Stripe Inc.</td><td className="px-4 py-2">{t('privacy.stripePurpose')}</td><td className="px-4 py-2">USA</td><td className="px-4 py-2">{t('privacy.stripeSafeguard')}</td></tr>
              <tr className="border-b"><td className="px-4 py-2">Google Maps</td><td className="px-4 py-2">{t('privacy.gmapsPurpose')}</td><td className="px-4 py-2">USA</td><td className="px-4 py-2">{t('privacy.stripeSafeguard')}</td></tr>
              <tr className="border-b"><td className="px-4 py-2">Crisp</td><td className="px-4 py-2">{t('privacy.crispPurpose')}</td><td className="px-4 py-2">EU (France)</td><td className="px-4 py-2">{t('privacy.gdprCompliant')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. ARSLOP Rights */}
      <section className="mb-8" id="rights">
        <h2 className="text-xl font-semibold mb-3">{t('privacy.s4Title')}</h2>
        <p className="mb-3">{t('privacy.s4Intro')}</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>{t('privacy.rightAccess')}</strong> (Art. 15 RGPD)</li>
          <li><strong>{t('privacy.rightRectification')}</strong> (Art. 16 RGPD)</li>
          <li><strong>{t('privacy.rightErasure')}</strong> (Art. 17 RGPD)</li>
          <li><strong>{t('privacy.rightRestriction')}</strong> (Art. 18 RGPD)</li>
          <li><strong>{t('privacy.rightPortability')}</strong> (Art. 20 RGPD)</li>
          <li><strong>{t('privacy.rightObjection')}</strong> (Art. 21 RGPD)</li>
        </ul>
        <p className="mt-3">{t('privacy.s4Contact')}</p>
        <p className="mt-2">{t('privacy.s4Aepd')}</p>
      </section>

      {/* 5. Data Retention */}
      <section className="mb-8" id="retention">
        <h2 className="text-xl font-semibold mb-3">{t('privacy.s5Title')}</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>{t('privacy.retention1')}</li>
          <li>{t('privacy.retention2')}</li>
          <li>{t('privacy.retention3')}</li>
        </ul>
      </section>

      {/* 6. International transfers */}
      <section className="mb-8" id="transfers">
        <h2 className="text-xl font-semibold mb-3">{t('privacy.s6Title')}</h2>
        <p>{t('privacy.s6Content')}</p>
      </section>

      {/* 6bis. Automated decisions — Art. 22 GDPR */}
      <section className="mb-8" id="automated-decisions">
        <h2 className="text-xl font-semibold mb-3">{t('privacy.automatedDecisions.title')}</h2>
        <p>{t('privacy.automatedDecisions.content')}</p>
      </section>

      {/* 7. DPIA — Art. 35 GDPR */}
      <section className="mb-8" id="dpia">
        <h2 className="text-xl font-semibold mb-3">{t('privacy.dpia.title')}</h2>
        <p>{t('privacy.dpia.intro')}</p>
        <p className="font-semibold mt-4 mb-2">{t('privacy.dpia.measuresTitle')}</p>
        <ul className="list-disc pl-6 space-y-1.5">
          <li>{t('privacy.dpia.m1')}</li>
          <li>{t('privacy.dpia.m2')}</li>
          <li>{t('privacy.dpia.m3')}</li>
          <li>{t('privacy.dpia.m4')}</li>
          <li>{t('privacy.dpia.m5')}</li>
          <li>{t('privacy.dpia.m6')}</li>
          <li>{t('privacy.dpia.m7')}</li>
          <li>{t('privacy.dpia.m8')}</li>
        </ul>
        <p className="mt-4">{t('privacy.dpia.aepd')}</p>
        <p className="mt-2">{t('privacy.dpia.contact')}</p>
      </section>

      {/* Manage preferences link */}
      <section className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="font-medium">{t('privacy.managePrefs')}</p>
        <Link href={`/${locale}/patient/privacy`} className="text-blue-600 hover:underline text-sm mt-1 block">
          {t('privacy.goToPanel')} &rarr;
        </Link>
      </section>
    </div>
  )
}
