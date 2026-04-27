'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

/**
 * /pro income calculator — Round 13 v3 design.
 *
 * Dual slider (visits/month + price/visit) + 3 preset chips
 * (Part-time / Side income / Full-time). Output card is dark navy
 * with amber gradient on the headline figure + breakdown rows
 * (Bruto, Stripe €2.50/visit, OnCall 10%, Neto).
 *
 * Math:
 *   gross       = visits × price
 *   stripeFees  = visits × €2.50  (Stripe per-charge fee)
 *   commission  = gross × 10%     (OnCall, all-inclusive of VAT)
 *   net         = gross − stripeFees − commission
 *
 * The "all-inclusive" claim from Round 11 still holds — this commission
 * already covers VAT. Stripe is shown as a separate line for honesty;
 * the doctor sees both fees explicitly so the €132 net average is
 * defensible against any "we hide fees" suspicion.
 */

const STRIPE_FEE = 2.5
const COMMISSION_RATE = 0.10

const VISITS_MIN = 1
const VISITS_MAX = 50
const VISITS_DEFAULT = 12

const PRICE_MIN = 90
const PRICE_MAX = 220
const PRICE_STEP = 5
const PRICE_DEFAULT = 150

const PRESETS = [
  { id: 'partTime', visits: 8, price: 130 },
  { id: 'side',     visits: 16, price: 150 },
  { id: 'fullTime', visits: 32, price: 165 },
] as const

const fmtEuro = (n: number) =>
  `€${Math.round(n).toLocaleString('es-ES')}`

export function IncomeCalculator(_props: { locale: string }) {
  const t = useTranslations('proV3.income')
  const [visits, setVisits] = useState(VISITS_DEFAULT)
  const [price, setPrice] = useState(PRICE_DEFAULT)

  const { gross, stripeFees, commission, net, visitsPct, pricePct } = useMemo(() => {
    const gross = visits * price
    const stripeFees = visits * STRIPE_FEE
    const commission = gross * COMMISSION_RATE
    const net = gross - stripeFees - commission
    const visitsPct = ((visits - VISITS_MIN) / (VISITS_MAX - VISITS_MIN)) * 100
    const pricePct = ((price - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
    return { gross, stripeFees, commission, net, visitsPct, pricePct }
  }, [visits, price])

  return (
    <section
      id="income-calculator"
      className="bg-[#FAFBFC]"
      style={{ padding: 'clamp(56px, 8vw, 100px) clamp(18px, 4vw, 56px)' }}
    >
      <div className="max-w-[1240px] mx-auto">
        <div className="max-w-[720px]" style={{ marginBottom: 'clamp(28px, 4vw, 44px)' }}>
          <div className="text-[12px] font-semibold uppercase tracking-[1px] text-[#3B82F6] mb-2.5">
            {t('kicker')}
          </div>
          <h2
            className="font-display text-balance"
            style={{
              fontSize: 'clamp(32px, 4.5vw, 46px)',
              fontWeight: 700,
              letterSpacing: '-1.4px',
              color: '#0B1220',
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            {t('title')}
          </h2>
          <p
            className="text-slate-500 mt-3.5"
            style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', lineHeight: 1.55 }}
          >
            {t('subtitle')}
          </p>
        </div>

        <div
          className="bg-white border border-[#EEF1F5] overflow-hidden grid"
          style={{
            borderRadius: 20,
            boxShadow: '0 30px 60px -30px rgba(11,18,32,.12)',
            gridTemplateColumns: '1fr',
          }}
        >
          <div className="md:grid md:grid-cols-[1.1fr_0.9fr]">
            {/* Controls column */}
            <div style={{ padding: 'clamp(24px, 3.5vw, 36px)' }}>
              {/* Visits slider */}
              <div className="mb-8">
                <div className="flex items-baseline justify-between mb-3.5">
                  <label htmlFor="proIncomeVisits" className="text-[13px] font-semibold text-[#374151]">
                    {t('visitsLabel')}
                  </label>
                  <span
                    className="font-bold text-[#0B1220] tabular-nums"
                    style={{ fontSize: 28, letterSpacing: '-1px' }}
                  >
                    {visits}
                  </span>
                </div>
                <input
                  id="proIncomeVisits"
                  type="range"
                  min={VISITS_MIN}
                  max={VISITS_MAX}
                  value={visits}
                  onChange={(e) => setVisits(Number(e.target.value))}
                  className="w-full appearance-none cursor-pointer focus:outline-none"
                  aria-label={t('visitsLabel')}
                  style={{
                    height: 6,
                    borderRadius: 999,
                    background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${visitsPct}%, #E5E7EB ${visitsPct}%, #E5E7EB 100%)`,
                  }}
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                  <span>1</span>
                  <span>15</span>
                  <span>30</span>
                  <span>50</span>
                </div>
              </div>

              {/* Price slider */}
              <div className="mb-7">
                <div className="flex items-baseline justify-between mb-3.5">
                  <label htmlFor="proIncomePrice" className="text-[13px] font-semibold text-[#374151]">
                    {t('priceLabel')}
                  </label>
                  <span
                    className="font-bold text-[#0B1220] tabular-nums"
                    style={{ fontSize: 22, letterSpacing: '-0.6px' }}
                  >
                    €{price}
                  </span>
                </div>
                <input
                  id="proIncomePrice"
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full appearance-none cursor-pointer focus:outline-none"
                  aria-label={t('priceLabel')}
                  style={{
                    height: 6,
                    borderRadius: 999,
                    background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${pricePct}%, #E5E7EB ${pricePct}%, #E5E7EB 100%)`,
                  }}
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                  <span>€90</span>
                  <span>€155</span>
                  <span>€220</span>
                </div>
              </div>

              {/* Preset chips */}
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setVisits(p.visits)
                      setPrice(p.price)
                    }}
                    className="border border-slate-200 bg-white text-slate-700 hover:border-slate-300 transition-colors"
                    style={{
                      borderRadius: 999,
                      padding: '7px 14px',
                      fontSize: 12.5,
                      fontWeight: 500,
                    }}
                  >
                    {t(`presets.${p.id}`)} · {p.visits}
                    {t('presets.perMonth')}
                  </button>
                ))}
              </div>
            </div>

            {/* Output column */}
            <div
              className="text-white relative overflow-hidden"
              style={{
                background: 'linear-gradient(165deg, #0B1220 0%, #111827 100%)',
                padding: 'clamp(24px, 3.5vw, 36px)',
              }}
            >
              <div
                aria-hidden="true"
                className="absolute"
                style={{
                  top: -60,
                  right: -60,
                  width: 240,
                  height: 240,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(closest-side, rgba(245,158,11,0.22), transparent 70%)',
                }}
              />
              <div className="relative">
                <div
                  className="font-semibold uppercase tracking-[1px] text-white/55 mb-3"
                  style={{ fontSize: 12 }}
                >
                  {t('outputUpTo')}
                </div>
                <div
                  className="font-bold tabular-nums"
                  aria-live="polite"
                  style={{
                    fontSize: 'clamp(56px, 7vw, 76px)',
                    letterSpacing: '-3px',
                    lineHeight: 1,
                    background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {fmtEuro(net)}
                </div>
                <div className="text-white/60 mt-1.5 font-medium" style={{ fontSize: 16 }}>
                  {t('outputUnit')}
                </div>

                {/* Breakdown rows */}
                <div
                  className="mt-7 flex flex-col gap-3 pt-5"
                  style={{ borderTop: '1px solid rgba(255,255,255,.1)' }}
                >
                  <Row
                    label={t('rowGross')}
                    value={`+${fmtEuro(gross)}`}
                    valueColor="white"
                  />
                  <Row
                    label={t('rowStripe', { visits })}
                    value={`−${fmtEuro(stripeFees)}`}
                    valueColor="rgba(255,255,255,.55)"
                  />
                  <Row
                    label={t('rowCommission')}
                    value={`−${fmtEuro(commission)}`}
                    valueColor="rgba(255,255,255,.55)"
                  />
                  <div
                    className="flex justify-between font-bold tabular-nums"
                    style={{
                      fontSize: 14.5,
                      paddingTop: 12,
                      borderTop: '1px solid rgba(255,255,255,.1)',
                    }}
                  >
                    <span>{t('rowNet')}</span>
                    <span style={{ color: '#F59E0B' }}>{fmtEuro(net)}</span>
                  </div>
                </div>

                <div
                  className="mt-6 text-white/40"
                  style={{ fontSize: 11, lineHeight: 1.5 }}
                >
                  {t('footnote')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Row({
  label,
  value,
  valueColor,
}: {
  label: string
  value: string
  valueColor: string
}) {
  return (
    <div
      className="flex justify-between tabular-nums"
      style={{ fontSize: 13.5 }}
    >
      <span style={{ color: 'rgba(255,255,255,.6)' }}>{label}</span>
      <span style={{ color: valueColor, fontWeight: 600 }}>{value}</span>
    </div>
  )
}
