import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aviso Legal | Legal Notice',
  description:
    'Información legal sobre Ibiza Care SLU conforme al artículo 10 LSSI-CE. Identificación, actividad, condiciones de uso y jurisdicción aplicable.',
}

export default async function AvisoLegalPage() {
  const t = await getTranslations('legal.legalNotice')

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t('effectiveDate')}</p>

      {/* 1. Identificación del titular (Art. 10.1 LSSI-CE) */}
      <section className="mb-8" id="identification">
        <h2 className="text-xl font-semibold mb-3">{t('identification.title')}</h2>
        <p>{t('identification.intro')}</p>
        <ul className="mt-4 space-y-1.5 border rounded-lg p-4 bg-muted/30">
          <li><strong>{t('identification.companyName')}:</strong> Ibiza Care, Sociedad Limitada (SLU)</li>
          <li><strong>{t('identification.taxId')}:</strong> B19973569</li>
          <li><strong>{t('identification.address')}:</strong> C/ Lugo 11, 3º2ª, 07830 Sant Josep de Sa Talaia, Illes Balears, España</li>
          <li><strong>{t('identification.registry')}:</strong> Registro Mercantil de Eivissa, Hoja IB-21129, Inscripción 1ª</li>
          <li><strong>{t('identification.cnae')}:</strong> 8690 — {t('identification.cnaeDesc')}</li>
          <li><strong>Email:</strong> <a href="mailto:info@oncall.clinic" className="text-primary hover:underline">info@oncall.clinic</a></li>
          <li><strong>{t('identification.dpo')}:</strong> <a href="mailto:dpo@oncall.clinic" className="text-primary hover:underline">dpo@oncall.clinic</a></li>
        </ul>
      </section>

      {/* 2. Objeto y naturaleza del servicio */}
      <section className="mb-8" id="purpose">
        <h2 className="text-xl font-semibold mb-3">{t('purpose.title')}</h2>
        <div className="border-l-4 border-amber-400 bg-amber-50 p-4 rounded-r-lg mb-4">
          <p className="font-medium text-amber-900">{t('purpose.warning')}</p>
        </div>
        <p>{t('purpose.p1')}</p>
        <p className="mt-2">{t('purpose.p2')}</p>
        <p className="mt-2">{t('purpose.p3')}</p>
      </section>

      {/* 3. Condiciones de uso */}
      <section className="mb-8" id="conditions">
        <h2 className="text-xl font-semibold mb-3">{t('conditions.title')}</h2>
        <p>{t('conditions.p1')}</p>
        <p className="mt-2">{t('conditions.p2')}</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>{t('conditions.l1')}</li>
          <li>{t('conditions.l2')}</li>
          <li>{t('conditions.l3')}</li>
        </ul>
      </section>

      {/* 4. Propiedad intelectual e industrial (RDL 1/1996) */}
      <section className="mb-8" id="intellectual-property">
        <h2 className="text-xl font-semibold mb-3">{t('intellectualProperty.title')}</h2>
        <p>{t('intellectualProperty.p1')}</p>
        <p className="mt-2">{t('intellectualProperty.p2')}</p>
      </section>

      {/* 5. Limitación de responsabilidad */}
      <section className="mb-8" id="liability">
        <h2 className="text-xl font-semibold mb-3">{t('liability.title')}</h2>
        <div className="border-l-4 border-destructive/50 bg-destructive/5 p-4 rounded-r-lg mb-4">
          <p className="font-medium">{t('liability.clinicalWarning')}</p>
        </div>
        <p>{t('liability.p1')}</p>
        <p className="mt-2">{t('liability.p2')}</p>
      </section>

      {/* 6. Protección de datos */}
      <section className="mb-8" id="data-protection">
        <h2 className="text-xl font-semibold mb-3">{t('dataProtection.title')}</h2>
        <p>
          {t('dataProtection.p1')}{' '}
          <Link href="./privacy" className="text-primary hover:underline">
            {t('dataProtection.privacyLink')}
          </Link>
          .
        </p>
      </section>

      {/* 7. Ley aplicable y jurisdicción */}
      <section className="mb-8" id="jurisdiction">
        <h2 className="text-xl font-semibold mb-3">{t('jurisdiction.title')}</h2>
        <p>{t('jurisdiction.p1')}</p>
        <p className="mt-2">
          {t('jurisdiction.odrIntro')}{' '}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            https://ec.europa.eu/consumers/odr
          </a>
        </p>
      </section>
    </div>
  )
}
