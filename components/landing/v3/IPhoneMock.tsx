import { useTranslations } from 'next-intl'
import { MapPin } from 'lucide-react'
import { LogoMark } from './LogoMark'

/**
 * iPhone-frame booking-screen mock for the v3 hero.
 *
 * R7 compliance: chips inside the mock are TYPE-OF-VISIT (Urgente /
 * Programada / Hoy / Mañana) — NOT clinical symptoms. Faithful to the
 * actual booking flow which collects type + address + time, never
 * symptoms.
 *
 * Server component. The pin pulse animation is pure CSS (live-dot
 * keyframes already defined in globals.css).
 */
export function IPhoneMock() {
  const t = useTranslations('landingV3.hero.phone')
  return (
    <div
      className="relative mx-auto"
      style={{
        width: 300,
        height: 620,
        maxWidth: '100%',
      }}
    >
      {/* iPhone bezel */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          borderRadius: 50,
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
          style={{
            width: 110,
            height: 28,
            borderRadius: 16,
            background: '#0B1220',
          }}
        />
        {/* Screen */}
        <div
          className="relative w-full h-full overflow-hidden flex flex-col font-sans text-[color:#0B1220]"
          style={{
            borderRadius: 38,
            background: '#FAFBFC',
          }}
        >
          {/* App header */}
          <div className="flex items-center justify-between px-[18px] pt-3 pb-2 mt-6">
            <LogoMark size={22} />
            <div className="grid place-items-center w-[30px] h-[30px] rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold">
              {t('appHeaderLocale')}
            </div>
          </div>

          {/* Map area */}
          <div
            className="relative mx-[14px] mt-2 overflow-hidden border border-slate-200"
            style={{ height: 168, borderRadius: 14, background: '#E8EEF6' }}
          >
            {/* Stylised coastline */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 300 200"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <rect width="300" height="200" fill="#E8EEF6" />
              <path d="M0 110 Q60 80 120 105 T260 95 L300 110 L300 200 L0 200 Z" fill="#D9E4F1" />
              <path d="M0 140 Q80 120 160 138 T300 130 L300 200 L0 200 Z" fill="#CDDCEE" />
              <path d="M40 170 Q120 150 200 165 T300 160 L300 200 L0 200 L0 175 Q20 172 40 170 Z" fill="#BFD0E6" />
              <g stroke="#A8BDD8" strokeWidth="0.8" opacity="0.6">
                <path d="M20 60 L80 100 L150 80 L220 110 L290 75" fill="none" />
                <path d="M0 140 L60 130 L120 145 L180 125 L260 140 L300 130" fill="none" />
              </g>
              <circle cx="80" cy="60" r="3" fill="#94A3B8" />
              <circle cx="220" cy="40" r="3" fill="#94A3B8" />
              <circle cx="60" cy="160" r="3" fill="#94A3B8" />
            </svg>

            {/* Pin */}
            <div
              className="absolute left-1/2"
              style={{ top: '44%', transform: 'translate(-50%, -100%)' }}
            >
              <div
                className="grid place-items-center"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50% 50% 50% 0',
                  background: '#3B82F6',
                  transform: 'rotate(-45deg)',
                  boxShadow: '0 8px 16px -4px rgba(59,130,246,.45)',
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: 'white',
                    transform: 'rotate(45deg)',
                  }}
                />
              </div>
              <span
                aria-hidden="true"
                className="absolute live-dot"
                style={{
                  top: 32,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: 'rgba(59,130,246,.3)',
                }}
              />
            </div>

            {/* Address chip */}
            <div
              className="absolute flex items-center gap-2 bg-white shadow-[0_4px_12px_-4px_rgba(11,18,32,.12)]"
              style={{
                left: 10,
                right: 10,
                bottom: 10,
                borderRadius: 10,
                padding: '8px 11px',
                fontSize: 11.5,
              }}
            >
              <MapPin className="h-[14px] w-[14px] text-[#3B82F6] flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{t('addressTitle')}</div>
                <div className="text-slate-500 text-[10px] truncate">{t('addressDetail')}</div>
              </div>
            </div>
          </div>

          {/* Type-of-visit chips (R7: NO symptoms — type is what we collect) */}
          <div className="px-[18px] pt-3 flex-1 overflow-hidden">
            <div className="text-[11px] uppercase tracking-[0.06em] font-semibold text-slate-500">
              {t('chipsLabel')}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                { l: t('chipUrgent'), active: true },
                { l: t('chipScheduled'), active: false },
                { l: t('chipToday'), active: false },
                { l: t('chipTomorrow'), active: false },
              ].map((chip) => (
                <span
                  key={chip.l}
                  className="text-[11px] px-[10px] py-[6px] rounded-full border"
                  style={{
                    background: chip.active ? '#EEF4FF' : 'white',
                    borderColor: chip.active ? '#BFDBFE' : '#E5E7EB',
                    color: chip.active ? '#1D4ED8' : '#0B1220',
                    fontWeight: chip.active ? 600 : 500,
                  }}
                >
                  {chip.l}
                </span>
              ))}
            </div>

            {/* ETA + price row */}
            <div
              className="mt-3 flex items-center justify-between border border-slate-200 bg-white"
              style={{ padding: '10px 12px', borderRadius: 12 }}
            >
              <div>
                <div className="text-[10px] text-slate-500">{t('etaLabel')}</div>
                <div className="font-bold text-[14px]">{t('etaValue')}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500">{t('priceLabel')}</div>
                <div className="font-bold text-[14px]">{t('priceValue')}</div>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="px-[14px] pt-2 pb-[18px]">
            <button
              type="button"
              aria-label={t('submit')}
              className="w-full text-white font-bold text-[14px]"
              style={{
                height: 46,
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                boxShadow: '0 8px 20px -6px rgba(59,130,246,.5)',
                letterSpacing: '-0.01em',
                cursor: 'default',
              }}
            >
              {t('submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
