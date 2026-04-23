// STEP 2 — Choose Your Doctor

function Step2({ t, lang, selectedDoctor, setSelectedDoctor, onNext, onBack }) {
  const [filter, setFilter] = React.useState('all');
  const filters = [
    { id: 'all', label: t.all },
    { id: 'avail', label: t.avail },
    { id: 'top', label: t.top },
    { id: 'near', label: t.near },
  ];

  // Sort doctors per filter for feel of working UI
  let sorted = [...DOCTORS];
  if (filter === 'avail') sorted.sort((a,b) => a.etaMin - b.etaMin);
  if (filter === 'top') sorted.sort((a,b) => b.rating - a.rating);
  if (filter === 'near') sorted.sort((a,b) => a.etaMin - b.etaMin);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: '20px 20px 10px' }}>
          <h1 style={{
            fontFamily: 'Inter', fontSize: 26, fontWeight: 700,
            color: TOKENS.ink, letterSpacing: -0.7, margin: 0,
          }}>{t.s2_title}</h1>
          <p style={{
            fontFamily: 'Inter', fontSize: 14, color: TOKENS.ink2,
            margin: '6px 0 0',
          }}>{t.s2_sub}</p>
        </div>

        {/* filter rail */}
        <div style={{
          display: 'flex', gap: 8, padding: '6px 20px 14px',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          {filters.map(f => (
            <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>

        {/* doctor list */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map(d => {
            const active = selectedDoctor === d.id;
            return (
              <Card key={d.id} active={active} onClick={() => setSelectedDoctor(d.id)} style={{ padding: 14 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <Avatar hue={d.hue} init={d.init} verified={d.verified} size={54} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontFamily: 'Inter', fontSize: 15, fontWeight: 600,
                          color: TOKENS.ink, letterSpacing: -0.2,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{d.name}</div>
                        <div style={{
                          fontFamily: 'Inter', fontSize: 12.5, color: TOKENS.ink2,
                          marginTop: 2, lineHeight: 1.3,
                        }}>
                          {lang === 'es' ? d.specialty_es : d.specialty_en} · {d.years} {t.years}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{
                          fontFamily: 'Inter', fontSize: 15, fontWeight: 700,
                          color: TOKENS.ink, letterSpacing: -0.2,
                        }}>€{d.price}</div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10, marginTop: 8,
                      fontFamily: 'Inter', fontSize: 12,
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: TOKENS.ink }}>
                        <IconStar size={12} stroke={TOKENS.warning} fill={TOKENS.warning} sw={1} />
                        <span style={{ fontWeight: 600 }}>{d.rating.toFixed(1)}</span>
                        <span style={{ color: TOKENS.ink3 }}>({d.reviews})</span>
                      </span>
                      <span style={{ color: TOKENS.ink3 }}>·</span>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        color: TOKENS.success, fontWeight: 600,
                      }}>
                        <IconClock size={12} stroke={TOKENS.success} />
                        ~{d.etaMin} min
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                      {d.langs.map(l => (
                        <span key={l} style={{
                          fontFamily: 'Inter', fontSize: 10.5, fontWeight: 600,
                          padding: '3px 7px', borderRadius: 6,
                          background: '#F1F5F9', color: TOKENS.ink2, letterSpacing: 0.3,
                        }}>{l}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ height: active ? 10 : 0, transition: 'height 200ms' }} />
                <div style={{
                  overflow: 'hidden',
                  maxHeight: active ? 44 : 0,
                  opacity: active ? 1 : 0,
                  transition: 'max-height 240ms, opacity 240ms',
                }}>
                  <div style={{
                    padding: '10px 12px', borderRadius: 10,
                    background: TOKENS.softBlue,
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontFamily: 'Inter', fontSize: 12, color: TOKENS.primaryDark, fontWeight: 500,
                  }}>
                    <IconCheck size={14} stroke={TOKENS.primary} sw={2.5} />
                    {t.selected}
                  </div>
                </div>
              </Card>
            );
          })}
          <div style={{ height: 4 }} />
        </div>
      </div>

      <StickyBar>
        <Btn onClick={onNext} disabled={!selectedDoctor} trailing={<IconArrowRight size={18} stroke="#fff" />}>
          {t.cont}
        </Btn>
      </StickyBar>
    </div>
  );
}

window.Step2 = Step2;
