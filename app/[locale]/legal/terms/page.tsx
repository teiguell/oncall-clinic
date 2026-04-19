import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones | Terms & Conditions',
}

export default async function TermsPage() {
  const t = await getTranslations('legal')

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{t('terms.title')}</h1>
      <p className="text-sm text-gray-500 mb-8">{t('terms.effectiveDate')}</p>

      {/* 1. Object of Service */}
      <section className="mb-8" id="object">
        <h2 className="text-xl font-semibold mb-3">{t('terms.s1Title')}</h2>
        <p>{t('terms.s1p1')}</p>
        <p className="mt-2">{t('terms.s1p2')}</p>
      </section>

      {/* 2. Nature of Intermediation */}
      <section className="mb-8" id="intermediation">
        <h2 className="text-xl font-semibold mb-3">{t('terms.s2Title')}</h2>
        <p>{t('terms.s2p1')}</p>
        <p className="mt-2">{t('terms.s2p2')}</p>
      </section>

      {/* 3. User Requirements */}
      <section className="mb-8" id="requirements">
        <h2 className="text-xl font-semibold mb-3">{t('terms.s3Title')}</h2>
        <p>{t('terms.s3p1')}</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>{t('terms.s3li1')}</li>
          <li>{t('terms.s3li2')}</li>
          <li>{t('terms.s3li3')}</li>
          <li>{t('terms.s3li4')}</li>
        </ul>
      </section>

      {/* 4. Booking Process */}
      <section className="mb-8" id="booking">
        <h2 className="text-xl font-semibold mb-3">{t('terms.s4Title')}</h2>
        <p>{t('terms.s4p1')}</p>
      </section>

      {/* 5. Payments */}
      <section className="mb-8" id="payments">
        <h2 className="text-xl font-semibold mb-3">{t('terms.s5Title')}</h2>
        <p>{t('terms.s5p1')}</p>
        <p className="mt-2">{t('terms.s5p2')}</p>
      </section>

      {/* 6. Cancellations */}
      <section className="mb-8" id="cancellations">
        <h2 className="text-xl font-semibold mb-3">{t('terms.s6Title')}</h2>
        <p>{t('terms.s6p1')}</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>{t('terms.s6li1')}</li>
          <li>{t('terms.s6li2')}</li>
          <li>{t('terms.s6li3')}</li>
        </ul>
      </section>

      {/* 7. Liability */}
      <section className="mb-8" id="liability">
        <h2 className="text-xl font-semibold mb-3">{t('terms.s7Title')}</h2>
        <p>{t('terms.s7p1')}</p>
        <p className="mt-2">{t('terms.s7p2')}</p>
      </section>

      {/* 8. Data Protection */}
      <section className="mb-8" id="data-protection">
        <h2 className="text-xl font-semibold mb-3">{t('terms.s8Title')}</h2>
        <p>{t('terms.s8p1')}</p>
      </section>

      {/* 9. Intellectual Property */}
      <section className="mb-8" id="ip">
        <h2 className="text-xl font-semibold mb-3">{t('terms.s9Title')}</h2>
        <p>{t('terms.s9p1')}</p>
      </section>

      {/* 10. Jurisdiction */}
      <section className="mb-8" id="jurisdiction">
        <h2 className="text-xl font-semibold mb-3">{t('terms.s10Title')}</h2>
        <p>{t('terms.s10p1')}</p>
      </section>

      {/* 11. Right of withdrawal (Art. 71 + 103.a LGDCU) */}
      <section className="mb-8" id="withdrawal">
        <h2 className="text-xl font-semibold mb-3">{t('terms.withdrawal.title')}</h2>
        <p>{t('terms.withdrawal.intro')}</p>
        <ul className="list-disc pl-6 mt-3 space-y-2">
          <li><strong>{t('terms.withdrawal.period').split(':')[0]}:</strong>{t('terms.withdrawal.period').split(':').slice(1).join(':')}</li>
          <li>{t('terms.withdrawal.exception')}</li>
          <li>{t('terms.withdrawal.practice')}</li>
        </ul>
        <p className="mt-4">{t('terms.withdrawal.howTo')}</p>
        <div className="mt-4 border rounded-lg p-4 bg-muted/30 text-sm">
          <p className="font-semibold mb-2">{t('terms.withdrawal.formTitle')}</p>
          <pre className="whitespace-pre-wrap font-sans text-muted-foreground leading-relaxed">{t('terms.withdrawal.formContent')}</pre>
        </div>
      </section>

      {/* 12. Online Dispute Resolution */}
      <section className="mb-8" id="odr">
        <h2 className="text-xl font-semibold mb-3">{t('terms.odr.title')}</h2>
        <p>
          {t('terms.odr.content')}{' '}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            https://ec.europa.eu/consumers/odr
          </a>
        </p>
      </section>
    </div>
  )
}
