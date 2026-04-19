import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aviso Legal | Legal Notice',
}

export default async function AvisoLegalPage() {
  const t = await getTranslations('legal.avisoLegal')

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-sm text-gray-500 mb-8">{t('effectiveDate')}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('s1Title')}</h2>
        <p>{t('s1p1')}</p>
        <ul className="mt-3 space-y-1">
          <li><strong>{t('companyName')}:</strong> Ibiza Care SL</li>
          <li><strong>{t('taxId')}:</strong> B19973569</li>
          <li><strong>{t('address')}:</strong> C/ Lugo 11, 3º2ª, Sant Josep de Sa Talaia, Illes Balears, España</li>
          <li><strong>{t('registry')}:</strong> Registro Mercantil de Eivissa, Tomo 2148, Folio 1, Hoja IB-21129</li>
          <li><strong>Email:</strong> <a href="mailto:info@oncall.clinic" className="text-blue-600 hover:underline">info@oncall.clinic</a></li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('s2Title')}</h2>
        <p>{t('s2p1')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('s3Title')}</h2>
        <p>{t('s3p1')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('s4Title')}</h2>
        <p>{t('s4p1')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('s5Title')}</h2>
        <p>{t('s5p1')}</p>
      </section>
    </div>
  )
}
