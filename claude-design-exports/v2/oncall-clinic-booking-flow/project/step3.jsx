// STEP 3 — Location & Symptoms

function MapPreview() {
  // Stylized Ibiza-shaped map preview (no real maps)
  return (
    <div style={{
      position: 'relative', height: 130, borderRadius: 14, overflow: 'hidden',
      background: 'linear-gradient(135deg, #E8F0FB 0%, #DDE8F5 100%)',
      border: `1px solid ${TOKENS.line}`,
    }}>
      {/* grid lines */}
      <svg width="100%" height="100%" viewBox="0 0 350 130" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="#CBD6E5" strokeWidth="0.5" opacity="0.5"/>
          </pattern>
        </defs>
        <rect width="350" height="130" fill="url(#grid)" />
        {/* stylized coastline */}
        <path d="M20,80 Q60,55 110,70 T200,60 Q250,55 300,75 T340,95 L340,130 L0,130 Z"
          fill="#CDE3FA" opacity="0.65"/>
        <path d="M60,95 Q120,75 180,85 T320,100" fill="none" stroke="#93B9E8" strokeWidth="1.2" opacity="0.5"/>
        {/* roads */}
        <path d="M0,55 L180,65 L340,40" fill="none" stroke="#fff" strokeWidth="3" opacity="0.7"/>
        <path d="M100,0 L130,70 L170,130" fill="none" stroke="#fff" strokeWidth="2" opacity="0.6"/>
      </svg>
      {/* pin */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -100%)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: TOKENS.primary, border: '3px solid #fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 16px rgba(59,130,246,0.4)',
        }}>
          <IconPin size={18} stroke="#fff" sw={2} />
        </div>
        <div style={{
          position: 'absolute', top: -6, left: -6, width: 48, height: 48,
          borderRadius: '50%', background: TOKENS.primary, opacity: 0.2,
          animation: 'pulseRing 1.8s infinite',
        }} />
      </div>
      <div style={{
        position: 'absolute', bottom: 10, left: 12,
        fontFamily: 'Inter', fontSize: 11, color: TOKENS.ink2,
        padding: '4px 8px', background: 'rgba(255,255,255,0.9)',
        borderRadius: 6, fontWeight: 500,
      }}>Ibiza, ES</div>
    </div>
  );
}

function Step3({ t, lang, selectedType, selectedDoctor, location, setLocation, symptoms, setSymptoms, quickSyms, toggleQuick, onNext }) {
  const doctor = DOCTORS.find(d => d.id === selectedDoctor);
  const consult = CONSULT_TYPES.find(c => c.id === selectedType);
  const consultLabel = selectedType === 'general' ? t.s1_general : selectedType === 'urgent' ? t.s1_urgent : t.s1_ped;
  const [showSugg, setShowSugg] = React.useState(false);

  const quick = [
    { id: 'fever', label: t.fever },
    { id: 'head', label: t.head },
    { id: 'naus', label: t.naus },
    { id: 'abd', label: t.abd },
    { id: 'allerg', label: t.allerg },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px 0' }}>
        {/* Location */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: 'Inter', fontSize: 11, fontWeight: 600,
            color: TOKENS.ink3, letterSpacing: 1.4, marginBottom: 10,
          }}>{lang === 'es' ? 'UBICACIÓN' : 'LOCATION'}</div>

          <MapPreview />

          <div style={{ position: 'relative', marginTop: 10 }}>
            <div style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}>
              <IconPin size={18} stroke={TOKENS.primary} />
            </div>
            <input
              value={location}
              onChange={e => { setLocation(e.target.value); setShowSugg(e.target.value.length > 0 && e.target.value.length < 20); }}
              onFocus={() => location.length > 0 && location.length < 20 && setShowSugg(true)}
              onBlur={() => setTimeout(() => setShowSugg(false), 150)}
              placeholder={t.s3_loc}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '14px 14px 14px 42px', borderRadius: 12,
                border: `1.5px solid ${TOKENS.line}`, background: TOKENS.surface,
                fontFamily: 'Inter', fontSize: 14, color: TOKENS.ink,
                outline: 'none',
              }}
              onFocusCapture={e => e.target.style.borderColor = TOKENS.primary}
              onBlurCapture={e => e.target.style.borderColor = TOKENS.line}
            />
            {showSugg && (
              <div style={{
                marginTop: 6, background: TOKENS.surface, borderRadius: 12,
                border: `1px solid ${TOKENS.line}`, overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
              }}>
                <div
                  onMouseDown={() => { setLocation("Hotel Ushuaïa, Playa d'en Bossa"); setShowSugg(false); }}
                  style={{
                    padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
                    cursor: 'pointer',
                  }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, background: TOKENS.softBlue,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <IconPin size={16} stroke={TOKENS.primary} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Inter', fontSize: 13.5, fontWeight: 600, color: TOKENS.ink }}>
                      Hotel Ushuaïa
                    </div>
                    <div style={{ fontFamily: 'Inter', fontSize: 12, color: TOKENS.ink2 }}>
                      Playa d'en Bossa · 2.4 km
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Symptoms */}
        <div style={{ marginBottom: 18 }}>
          <div style={{
            fontFamily: 'Inter', fontSize: 11, fontWeight: 600,
            color: TOKENS.ink3, letterSpacing: 1.4, marginBottom: 10,
          }}>{lang === 'es' ? 'SÍNTOMAS' : 'SYMPTOMS'}</div>

          <textarea
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            placeholder={t.s3_sym_ph}
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: 14, borderRadius: 12,
              border: `1.5px solid ${TOKENS.line}`, background: TOKENS.surface,
              fontFamily: 'Inter', fontSize: 14, color: TOKENS.ink,
              outline: 'none', resize: 'none', lineHeight: 1.5,
            }}
          />

          <div style={{
            fontFamily: 'Inter', fontSize: 12, color: TOKENS.ink2,
            margin: '12px 0 8px', fontWeight: 500,
          }}>{t.s3_quick}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {quick.map(q => {
              const on = quickSyms.includes(q.id);
              return (
                <button key={q.id} onClick={() => toggleQuick(q.id)} style={{
                  padding: '7px 12px', borderRadius: 999,
                  fontFamily: 'Inter', fontSize: 12.5, fontWeight: 500,
                  background: on ? TOKENS.softBlue : TOKENS.surface,
                  color: on ? TOKENS.primaryDark : TOKENS.ink2,
                  border: `1px solid ${on ? TOKENS.primary : TOKENS.line}`,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all 160ms',
                }}>
                  {on && <IconCheck size={12} stroke={TOKENS.primary} sw={3} />}
                  {q.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary card */}
        <div style={{
          background: TOKENS.surface, borderRadius: 14,
          border: `1px solid ${TOKENS.line}`, padding: 14,
          marginBottom: 16,
        }}>
          <div style={{
            fontFamily: 'Inter', fontSize: 11, fontWeight: 600,
            color: TOKENS.ink3, letterSpacing: 1.4, marginBottom: 10,
          }}>{t.sum.toUpperCase()}</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Avatar hue={doctor.hue} init={doctor.init} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: TOKENS.ink }}>
                {doctor.name}
              </div>
              <div style={{ fontFamily: 'Inter', fontSize: 11.5, color: TOKENS.ink2 }}>
                {lang === 'es' ? doctor.specialty_es : doctor.specialty_en} · ~{doctor.etaMin} min
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: TOKENS.line, margin: '10px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontSize: 13, marginBottom: 4 }}>
            <span style={{ color: TOKENS.ink2 }}>{t.cont_type}</span>
            <span style={{ color: TOKENS.ink, fontWeight: 500 }}>{consultLabel}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontSize: 13 }}>
            <span style={{ color: TOKENS.ink2 }}>{t.est_price}</span>
            <span style={{ color: TOKENS.ink, fontWeight: 700 }}>€{doctor.price}</span>
          </div>
        </div>
        <div style={{ height: 8 }} />
      </div>

      <StickyBar>
        <Btn onClick={onNext} disabled={!location || !symptoms} trailing={<IconArrowRight size={18} stroke="#fff" />}>
          {t.confirm}
        </Btn>
      </StickyBar>
    </div>
  );
}

window.Step3 = Step3;
