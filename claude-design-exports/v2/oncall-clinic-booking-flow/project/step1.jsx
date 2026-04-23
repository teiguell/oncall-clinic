// STEP 1 — Consultation Type

function Step1({ t, lang, selectedType, setSelectedType, onNext }) {
  const typeLabels = {
    general: { title: t.s1_general, sub: t.s1_general_sub, Icon: IconStethoscope, accent: TOKENS.primary, softBg: TOKENS.softBlue },
    urgent:  { title: t.s1_urgent,  sub: t.s1_urgent_sub,  Icon: IconAlert,       accent: TOKENS.warning, softBg: TOKENS.softAmber },
    ped:     { title: t.s1_ped,     sub: t.s1_ped_sub,     Icon: IconBaby,        accent: '#EC4899',      softBg: '#FDF2F8' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 20px 0' }}>
        {/* Intro */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', background: TOKENS.softGreen, borderRadius: 999,
            marginBottom: 14,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: TOKENS.success,
              boxShadow: `0 0 0 4px ${TOKENS.success}22`, animation: 'pulseDot 1.6s infinite' }} />
            <span style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, color: '#047857', letterSpacing: 0.2 }}>
              {lang === 'es' ? '8 médicos disponibles en Ibiza' : '8 doctors available in Ibiza'}
            </span>
          </div>
          <h1 style={{
            fontFamily: 'Inter', fontSize: 26, fontWeight: 700,
            color: TOKENS.ink, letterSpacing: -0.7, margin: 0, lineHeight: 1.15,
            textWrap: 'balance',
          }}>{t.s1_title}</h1>
          <p style={{
            fontFamily: 'Inter', fontSize: 14, color: TOKENS.ink2,
            margin: '8px 0 0', lineHeight: 1.5,
          }}>{t.s1_sub}</p>
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CONSULT_TYPES.map(c => {
            const L = typeLabels[c.id];
            const active = selectedType === c.id && !c.disabled;
            return (
              <Card key={c.id} active={active}
                onClick={c.disabled ? undefined : () => setSelectedType(c.id)}
                style={{
                  padding: 16, display: 'flex', alignItems: 'center', gap: 14,
                  opacity: c.disabled ? 0.55 : 1,
                  cursor: c.disabled ? 'not-allowed' : 'pointer',
                }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  background: L.softBg, color: L.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <L.Icon size={26} stroke={L.accent} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{
                      fontFamily: 'Inter', fontSize: 15.5, fontWeight: 600,
                      color: TOKENS.ink, letterSpacing: -0.2,
                    }}>{L.title}</span>
                    {c.badge === 'soon' && (
                      <span style={{
                        fontFamily: 'Inter', fontSize: 9.5, fontWeight: 700,
                        padding: '2px 6px', borderRadius: 4,
                        background: '#F1F5F9', color: TOKENS.ink3, letterSpacing: 0.4,
                      }}>{t.soon}</span>
                    )}
                    {c.badge === 'urgent' && (
                      <span style={{
                        fontFamily: 'Inter', fontSize: 9.5, fontWeight: 700,
                        padding: '2px 6px', borderRadius: 4,
                        background: TOKENS.softAmber, color: '#B45309', letterSpacing: 0.4,
                      }}>{lang === 'es' ? '< 20 MIN' : '< 20 MIN'}</span>
                    )}
                  </div>
                  <div style={{
                    fontFamily: 'Inter', fontSize: 12.5, color: TOKENS.ink2,
                    lineHeight: 1.35,
                  }}>{L.sub}</div>
                  <div style={{
                    fontFamily: 'Inter', fontSize: 12.5, color: TOKENS.ink,
                    fontWeight: 600, marginTop: 6,
                  }}>
                    {t.from} <span style={{ fontSize: 14 }}>€{c.price}</span>
                  </div>
                </div>
                {/* selected check */}
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  border: `1.5px solid ${active ? TOKENS.primary : TOKENS.line}`,
                  background: active ? TOKENS.primary : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 180ms',
                }}>
                  {active && <IconCheck size={14} stroke="#fff" sw={3} />}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Trust row */}
        <div style={{
          marginTop: 18, padding: '12px 14px',
          background: TOKENS.surface, borderRadius: 12,
          border: `1px solid ${TOKENS.line}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <IconShield size={18} stroke={TOKENS.success} />
          <div style={{ fontFamily: 'Inter', fontSize: 12, color: TOKENS.ink2, lineHeight: 1.4 }}>
            {lang === 'es'
              ? <>Médicos colegiados · Reembolso a tu aseguradora</>
              : <>Licensed doctors · Reimbursable by your insurer</>}
          </div>
        </div>
        <div style={{ height: 20 }} />
      </div>

      <StickyBar>
        <Btn onClick={onNext} disabled={!selectedType} trailing={<IconArrowRight size={18} stroke="#fff" />}>
          {t.cont}
        </Btn>
      </StickyBar>
    </div>
  );
}

window.Step1 = Step1;
