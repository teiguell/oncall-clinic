import { useTranslations } from 'next-intl'

/**
 * Doctor app iPhone mockup — new-consultation notification screen.
 * Round 13 v3 design — server component (no animation state shipped).
 *
 * R7 compliance: the patient-context line displays "Adulto · Visita
 * programada" (logística), NOT clinical symptoms. The design source had
 * "Adulto, 34a · Fiebre + dolor abdominal" — replaced because OnCall is
 * an intermediary and never displays symptom data per Round 9 R7.
 */
export function PhoneMockPro() {
  const t = useTranslations('proV3.phone')
  const tabs = [
    t('tabs.0'),
    t('tabs.1'),
    t('tabs.2'),
    t('tabs.3'),
  ]

  const meta = [
    { label: t('metaDistanceLabel'), value: t('metaDistanceValue'), sub: t('metaDistanceSub') },
    { label: t('metaTypeLabel'),     value: t('metaTypeValue'),     sub: t('metaTypeSub') },
    { label: t('metaPaymentLabel'),  value: t('metaPaymentValue'),  sub: t('metaPaymentSub') },
  ]

  return (
    <div
      className="relative mx-auto"
      style={{
        width: 360,
        maxWidth: '100%',
      }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: 700,
          borderRadius: 56,
          background: '#0B1220',
          boxShadow:
            '0 30px 60px -30px rgba(11,18,32,.45), 0 0 0 8px #1F2937, 0 0 0 9px #0B1220',
          padding: 12,
        }}
      >
        {/* Notch */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-3 -translate-x-1/2 z-20"
          style={{ width: 122, height: 30, borderRadius: 16, background: '#0B1220' }}
        />
        {/* Screen */}
        <div
          className="relative w-full h-full overflow-hidden flex flex-col font-sans text-[color:#0B1220]"
          style={{ borderRadius: 44, background: '#F4F6FA' }}
        >
          {/* App header */}
          <div className="flex items-center justify-between px-5 mt-7 pb-2">
            <div className="flex items-center gap-2.5">
              <div
                className="grid place-items-center text-white font-bold"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)',
                  fontSize: 15,
                  letterSpacing: '-0.4px',
                }}
              >
                O
              </div>
              <div>
                <div className="text-[15px] font-semibold tracking-[-0.3px]">
                  {t('appName')}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-500">
                  <span
                    aria-hidden="true"
                    className="inline-block rounded-full bg-emerald-500"
                    style={{ width: 6, height: 6 }}
                  />
                  {t('online')}
                </div>
              </div>
            </div>
            <div
              className="grid place-items-center text-white text-[12px] font-semibold"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#cbd5e1,#94a3b8)',
              }}
            >
              DR
            </div>
          </div>

          {/* Today summary */}
          <div className="px-5 pb-3">
            <div
              className="bg-white border border-[#EEF1F5] flex items-center justify-between"
              style={{ borderRadius: 16, padding: '14px 16px' }}
            >
              <div>
                <div className="text-[11px] uppercase tracking-[0.4px] font-semibold text-slate-500">
                  {t('todayLabel')}
                </div>
                <div className="text-[22px] font-bold tracking-[-0.6px] mt-0.5">
                  {t('todaySummary')}
                </div>
              </div>
              <div className="flex items-end gap-1" style={{ height: 28 }}>
                {[10, 16, 8, 22, 14, 26, 18].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: 4,
                      height: h,
                      borderRadius: 2,
                      background: i === 6 ? '#3B82F6' : '#E5E7EB',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* New consultation notification — the hero element */}
          <div className="px-5 flex-1 overflow-hidden">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.4px] font-semibold text-slate-500 mb-2">
              <span
                aria-hidden="true"
                className="inline-block rounded-full bg-amber-500 live-dot"
                style={{
                  width: 6,
                  height: 6,
                  boxShadow: '0 0 0 4px rgba(245,158,11,.18)',
                }}
              />
              {t('newRequest')}
            </div>

            <div
              className="bg-white border border-[#EEF1F5] overflow-hidden"
              style={{
                borderRadius: 18,
                boxShadow:
                  '0 8px 24px -12px rgba(11,18,32,.12), 0 2px 6px -2px rgba(11,18,32,.06)',
              }}
            >
              {/* Patient row */}
              <div className="flex items-center gap-3 border-b border-[#F3F4F6]" style={{ padding: '14px 16px 10px' }}>
                <div
                  className="grid place-items-center font-bold flex-shrink-0"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg,#FEF3C7,#FDE68A)',
                    fontSize: 14,
                    color: '#92400E',
                  }}
                >
                  JM
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold tracking-[-0.2px] truncate">
                    {t('patientLocation')}
                  </div>
                  <div className="text-[12px] text-slate-500 truncate">
                    {t('patientContext')}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[18px] font-bold tracking-[-0.4px]">
                    {t('priceFigure')}
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-500">
                    {t('netLabel')}
                  </div>
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-3 border-b border-[#F3F4F6]">
                {meta.map((m, i) => (
                  <div
                    key={i}
                    className={i < 2 ? 'border-r border-[#F3F4F6]' : ''}
                    style={{ padding: '10px 12px' }}
                  >
                    <div className="text-[9.5px] uppercase tracking-[0.4px] font-semibold text-slate-400">
                      {m.label}
                    </div>
                    <div className="text-[13px] font-semibold tracking-[-0.2px] mt-0.5">
                      {m.value}
                    </div>
                    <div className="text-[10.5px] text-slate-500 mt-px">
                      {m.sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="grid p-3 gap-2" style={{ gridTemplateColumns: '1fr 1.6fr' }}>
                <button
                  type="button"
                  className="border border-slate-200 bg-white text-slate-700 font-semibold cursor-default"
                  style={{ borderRadius: 12, padding: '11px 0', fontSize: 13.5 }}
                  aria-label={t('skipBtn')}
                  disabled
                >
                  {t('skipBtn')}
                </button>
                <button
                  type="button"
                  className="border-0 text-white font-semibold cursor-default"
                  style={{
                    borderRadius: 12,
                    padding: '11px 0',
                    fontSize: 13.5,
                    background: 'linear-gradient(135deg,#F59E0B,#D97706)',
                    boxShadow: '0 4px 12px -2px rgba(245,158,11,.4)',
                  }}
                  aria-label={t('acceptBtn')}
                  disabled
                >
                  {t('acceptBtn')}
                </button>
              </div>
            </div>

            {/* Mini upcoming */}
            <div className="mt-3.5">
              <div className="text-[11px] uppercase tracking-[0.4px] font-semibold text-slate-500 mb-2">
                {t('upcomingTitle')}
              </div>
              <div
                className="bg-white border border-[#EEF1F5] flex items-center gap-3"
                style={{ borderRadius: 14, padding: '10px 14px' }}
              >
                <div
                  className="grid place-items-center text-[#1D4ED8] font-bold flex-shrink-0"
                  style={{ width: 30, height: 30, borderRadius: 9, background: '#EFF6FF', fontSize: 11 }}
                >
                  {t('upcomingTime')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold tracking-[-0.2px] truncate">
                    {t('upcomingTitle2')}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {t('upcomingMeta')}
                  </div>
                </div>
                <div className="text-slate-400 text-[18px]" aria-hidden="true">›</div>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div
            className="bg-white border border-[#EEF1F5] grid grid-cols-4 mx-5 mb-2"
            style={{
              borderRadius: 18,
              padding: '8px 6px',
              marginTop: 14,
              boxShadow: '0 4px 16px -8px rgba(11,18,32,.08)',
            }}
          >
            {tabs.map((label, i) => (
              <div
                key={label}
                className={`text-center text-[10.5px] font-semibold tracking-[-0.1px] ${
                  i === 0 ? 'text-[#3B82F6]' : 'text-slate-400'
                }`}
                style={{ padding: '6px 0' }}
              >
                <div
                  className="mx-auto mb-1"
                  aria-hidden="true"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: i === 0 ? '#3B82F6' : 'transparent',
                  }}
                />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
