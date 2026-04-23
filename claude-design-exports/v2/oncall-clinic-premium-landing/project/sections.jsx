// sections.jsx — Landing page sections for OnCall Clinic
const { useState } = React;

// ─── Shared primitives ───────────────────────────────────────
function Kicker({ children, tone = 'blue' }) {
  const colors = {
    blue: { bg: 'rgba(59,130,246,0.08)', fg: '#1d4ed8' },
    amber: { bg: 'rgba(245,158,11,0.1)', fg: '#b45309' },
    green: { bg: 'rgba(16,185,129,0.1)', fg: '#047857' },
    neutral: { bg: 'rgba(15,23,42,0.04)', fg: '#475569' },
  }[tone];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 10px', borderRadius: 999,
      background: colors.bg, color: colors.fg,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: colors.fg }} />
      {children}
    </div>
  );
}

function SectionTitle({ kicker, kickerTone, title }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <Kicker tone={kickerTone}>{kicker}</Kicker>
      <h2 style={{
        margin: '14px 0 0', fontSize: 32, lineHeight: 1.08,
        letterSpacing: '-0.025em', fontWeight: 640, color: '#0B1220',
        textWrap: 'balance',
      }}>{title}</h2>
    </div>
  );
}

// ─── 1. HERO ─────────────────────────────────────────────────
function Hero({ t, onRequest }) {
  return (
    <section style={{
      position: 'relative', padding: '76px 22px 40px', overflow: 'hidden',
      background: `
        radial-gradient(120% 60% at 100% 0%, rgba(245,158,11,0.10), transparent 60%),
        radial-gradient(90% 70% at 0% 15%, rgba(59,130,246,0.13), transparent 55%),
        linear-gradient(180deg, #FAFBFC 0%, #F1F6FE 100%)
      `,
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 36,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon.logo width="28" height="28" />
          <span style={{ fontSize: 15, fontWeight: 620, letterSpacing: '-0.01em', color: '#0B1220' }}>
            OnCall Clinic
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <LangPill />
          <button style={iconBtn} aria-label="Menu">
            <Icon.menu width="18" height="18" style={{ color: '#0B1220' }} />
          </button>
        </div>
      </div>

      {/* Floating Ibiza orb — abstract, not stock */}
      <Orb />

      <div style={{ position: 'relative', zIndex: 2, marginTop: 24 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.16em',
          color: '#3B82F6', textTransform: 'uppercase', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 99, background: '#10B981',
            boxShadow: '0 0 0 4px rgba(16,185,129,0.15)',
          }}/>
          {t.hero.eyebrow}
        </div>
        <h1 style={{
          margin: 0, fontSize: 46, lineHeight: 1.03,
          letterSpacing: '-0.035em', fontWeight: 680, color: '#0B1220',
          whiteSpace: 'pre-line', textWrap: 'balance',
        }}>{t.hero.title}</h1>
        <p style={{
          margin: '18px 0 28px', fontSize: 17, lineHeight: 1.45,
          color: '#475569', maxWidth: 340,
        }}>{t.hero.sub}</p>

        <button onClick={onRequest} style={{
          ...primaryBtn, width: '100%',
        }}>
          <span>{t.hero.cta}</span>
          <Icon.arrow width="18" height="18" />
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 6, marginTop: 10, fontSize: 12.5, color: '#64748B',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: '#10B981' }}/>
          {t.hero.ctaSub}
        </div>

        {/* Trust strip */}
        <div style={{
          marginTop: 28, display: 'flex', gap: 10, flexWrap: 'wrap',
        }}>
          {t.hero.trust.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 12px', borderRadius: 99,
              background: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(15,23,42,0.06)',
              fontSize: 12.5, fontWeight: 520, color: '#334155',
              backdropFilter: 'blur(8px)',
            }}>
              {i === 0 && <Icon.badge width="14" height="14" style={{ color: '#3B82F6' }}/>}
              {i === 1 && <Icon.shield width="14" height="14" style={{ color: '#10B981' }}/>}
              {i === 2 && <Icon.lock width="14" height="14" style={{ color: '#F59E0B' }}/>}
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Orb() {
  return (
    <div style={{
      position: 'absolute', top: 48, right: -60, width: 240, height: 240,
      pointerEvents: 'none', zIndex: 1,
    }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'conic-gradient(from 120deg, #3B82F6, #60A5FA, #F59E0B, #3B82F6)',
        filter: 'blur(22px)', opacity: 0.45,
      }}/>
      <div style={{
        position: 'absolute', inset: 30, borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #fff, #E0EAFB 60%, #BBD2F5 100%)',
        boxShadow: '0 30px 60px rgba(59,130,246,0.25), inset -20px -30px 60px rgba(59,130,246,0.2)',
      }}/>
      <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 30 }}>
        <g opacity="0.55" stroke="#3B82F6" strokeWidth="0.5" fill="none">
          <ellipse cx="100" cy="100" rx="70" ry="28" />
          <ellipse cx="100" cy="100" rx="70" ry="28" transform="rotate(60 100 100)"/>
          <ellipse cx="100" cy="100" rx="70" ry="28" transform="rotate(-60 100 100)"/>
        </g>
      </svg>
    </div>
  );
}

function LangPill() {
  return null; // rendered externally via Topbar in App for state
}

// ─── 2. HOW IT WORKS ─────────────────────────────────────────
function How({ t }) {
  const icons = [Icon.message, Icon.pickDoc, Icon.arrive];
  return (
    <section style={section}>
      <SectionTitle kicker={t.how.kicker} title={t.how.title} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {t.how.steps.map((s, i) => {
          const IconC = icons[i];
          return (
            <div key={i} style={{
              position: 'relative', padding: 18, borderRadius: 16,
              background: '#fff',
              border: '1px solid rgba(15,23,42,0.06)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 8px 24px rgba(15,23,42,0.04)',
              display: 'flex', gap: 14, alignItems: 'flex-start',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: 'linear-gradient(135deg, #EFF5FF, #DCEAFC)',
                color: '#2563EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconC width="22" height="22"/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
                  color: '#94A3B8', marginBottom: 4,
                }}>{s.n}</div>
                <div style={{
                  fontSize: 17, fontWeight: 600, color: '#0B1220',
                  letterSpacing: '-0.01em',
                }}>{s.t}</div>
                <div style={{ marginTop: 4, fontSize: 14, color: '#64748B', lineHeight: 1.45 }}>
                  {s.d}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── 3. SERVICES ─────────────────────────────────────────────
function Services({ t }) {
  const icons = [Icon.stetho, Icon.child, Icon.physio, Icon.nurse];
  return (
    <section style={{ ...section, background: '#F6F8FB' }}>
      <SectionTitle kicker={t.services.kicker} kickerTone="amber" title={t.services.title} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {t.services.items.map((s, i) => {
          const IconC = icons[i];
          return (
            <div key={i} style={{
              position: 'relative', padding: 16, borderRadius: 16,
              background: '#fff',
              border: '1px solid rgba(15,23,42,0.05)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 6px 20px rgba(15,23,42,0.04)',
              opacity: s.active ? 1 : 0.88,
              minHeight: 168,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              {!s.active && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  fontSize: 9.5, fontWeight: 600, letterSpacing: '0.08em',
                  padding: '4px 7px', borderRadius: 99,
                  background: 'rgba(15,23,42,0.06)', color: '#64748B',
                  textTransform: 'uppercase',
                }}>Soon</div>
              )}
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: s.active
                  ? 'linear-gradient(135deg, #DBEAFE, #BFDBFE)'
                  : 'rgba(15,23,42,0.04)',
                color: s.active ? '#1D4ED8' : '#94A3B8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconC width="20" height="20"/>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{
                  fontSize: 15.5, fontWeight: 600, color: '#0B1220',
                  letterSpacing: '-0.01em',
                }}>{s.t}</div>
                <div style={{
                  marginTop: 3, fontSize: 12.5, color: '#64748B', lineHeight: 1.4,
                  minHeight: 34,
                }}>{s.d}</div>
                <div style={{
                  marginTop: 10, fontSize: 12.5, fontWeight: 600,
                  color: s.active ? '#10B981' : '#94A3B8',
                }}>{s.price}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── 4. DOCTOR PREVIEW ───────────────────────────────────────
function Doctors({ t }) {
  const avatars = [
    { bg: 'linear-gradient(135deg, #FDE68A, #F59E0B)', initials: 'EM' },
    { bg: 'linear-gradient(135deg, #BFDBFE, #3B82F6)', initials: 'MD' },
    { bg: 'linear-gradient(135deg, #FBCFE8, #EC4899)', initials: 'SR' },
  ];
  return (
    <section style={section}>
      <SectionTitle kicker={t.doctors.kicker} kickerTone="green" title={t.doctors.title} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {t.doctors.list.map((d, i) => {
          const a = avatars[i];
          return (
            <div key={i} style={{
              padding: 16, borderRadius: 16, background: '#fff',
              border: '1px solid rgba(15,23,42,0.06)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 8px 24px rgba(15,23,42,0.04)',
              display: 'flex', gap: 14, alignItems: 'center',
            }}>
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 58, height: 58, borderRadius: '50%', background: a.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 18, fontWeight: 620, letterSpacing: '-0.02em',
                  boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.08)',
                }}>{a.initials}</div>
                <div style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#10B981', border: '2.5px solid #fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                }}>
                  <Icon.check width="11" height="11"/>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 15, fontWeight: 620, color: '#0B1220',
                  letterSpacing: '-0.01em',
                }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                </div>
                <div style={{ marginTop: 2, fontSize: 12.5, color: '#64748B' }}>{d.spec}</div>
                <div style={{
                  marginTop: 8, display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: 12, color: '#475569',
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Icon.star width="12" height="12" style={{ color: '#F59E0B' }}/>
                    <b style={{ color: '#0B1220', fontWeight: 620 }}>{d.rating}</b>
                    <span style={{ color: '#94A3B8' }}>({d.reviews})</span>
                  </span>
                  <span style={{ color: '#CBD5E1' }}>·</span>
                  <span style={{ color: '#10B981', fontWeight: 580 }}>{d.eta}</span>
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: '#94A3B8', letterSpacing: '0.02em' }}>
                  {d.langs}
                </div>
              </div>
              <button style={{
                padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0',
                background: '#fff', color: '#0B1220', fontSize: 13, fontWeight: 600,
                minHeight: 44, minWidth: 44, cursor: 'pointer',
              }}>{t.doctors.book}</button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── 5. TRUST SECTION ────────────────────────────────────────
function Trust({ t }) {
  return (
    <section style={{ ...section, background: '#F6F8FB' }}>
      <SectionTitle kicker={t.trust.kicker} kickerTone="neutral" title={t.trust.title} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Included - emerald */}
        <div style={{
          padding: 18, borderRadius: 16,
          background: 'linear-gradient(160deg, #ECFDF5 0%, #D1FAE5 100%)',
          border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 9, background: '#10B981',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon.check width="16" height="16"/>
            </div>
            <div style={{ fontSize: 15, fontWeight: 620, color: '#064E3B', letterSpacing: '-0.01em' }}>
              {t.trust.inc.t}
            </div>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {t.trust.inc.items.map((it, i) => (
              <li key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0', fontSize: 14, color: '#065F46',
                borderTop: i === 0 ? 'none' : '1px solid rgba(6,95,70,0.1)',
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 99, background: 'rgba(16,185,129,0.2)',
                  color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon.check width="11" height="11"/>
                </span>
                {it}
              </li>
            ))}
          </ul>
        </div>

        {/* Not included - rose */}
        <div style={{
          padding: 18, borderRadius: 16,
          background: 'linear-gradient(160deg, #FFF1F2 0%, #FFE4E6 100%)',
          border: '1px solid rgba(244,63,94,0.18)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 9, background: '#E11D48',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon.x width="16" height="16"/>
            </div>
            <div style={{ fontSize: 15, fontWeight: 620, color: '#881337', letterSpacing: '-0.01em' }}>
              {t.trust.exc.t}
            </div>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {t.trust.exc.items.map((it, i) => (
              <li key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0', fontSize: 14, color: '#9F1239',
                borderTop: i === 0 ? 'none' : '1px solid rgba(159,18,57,0.1)',
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 99, background: 'rgba(244,63,94,0.2)',
                  color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon.x width="11" height="11"/>
                </span>
                {it}
              </li>
            ))}
          </ul>
          <a href="tel:112" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 14, padding: '12px 14px', borderRadius: 12,
            background: '#E11D48', color: '#fff',
            fontSize: 13.5, fontWeight: 620, textDecoration: 'none',
            minHeight: 44,
          }}>
            <Icon.phone width="15" height="15"/>
            {t.trust.exc.cta}
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── 6. FAQ ───────────────────────────────────────────────────
function FAQ({ t }) {
  const [open, setOpen] = useState(0);
  return (
    <section style={section}>
      <SectionTitle kicker={t.faq.kicker} title={t.faq.title} />
      <div style={{
        borderRadius: 16, background: '#fff',
        border: '1px solid rgba(15,23,42,0.06)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 8px 24px rgba(15,23,42,0.04)',
        overflow: 'hidden',
      }}>
        {t.faq.items.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i} style={{
              borderTop: i === 0 ? 'none' : '1px solid rgba(15,23,42,0.06)',
            }}>
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                style={{
                  width: '100%', padding: '16px 18px', background: 'none',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 12, minHeight: 44,
                }}
              >
                <span style={{
                  flex: 1, fontSize: 14.5, fontWeight: 580, color: '#0B1220',
                  letterSpacing: '-0.005em', lineHeight: 1.35,
                }}>{f.q}</span>
                <span style={{
                  width: 28, height: 28, borderRadius: 99,
                  background: isOpen ? '#0B1220' : 'rgba(15,23,42,0.04)',
                  color: isOpen ? '#fff' : '#0B1220',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.2s',
                }}>
                  {isOpen ? <Icon.minus width="14" height="14"/> : <Icon.plus width="14" height="14"/>}
                </span>
              </button>
              {isOpen && (
                <div style={{
                  padding: '0 18px 18px', fontSize: 14, color: '#475569',
                  lineHeight: 1.55, maxWidth: 340,
                }}>{f.a}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── 7. CTA FINAL ────────────────────────────────────────────
function FinalCTA({ t, onRequest }) {
  return (
    <section style={{
      padding: '44px 22px 48px', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(160deg, #0B1F3F 0%, #1E3A8A 60%, #3B82F6 140%)',
      color: '#fff',
    }}>
      {/* decorative */}
      <div style={{
        position: 'absolute', top: -80, right: -80, width: 260, height: 260,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.35), transparent 70%)',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: -100, left: -60, width: 240, height: 240,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.6), transparent 70%)',
        pointerEvents: 'none',
      }}/>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.16em',
          color: '#93C5FD', textTransform: 'uppercase', marginBottom: 12,
        }}>24 / 7 · IBIZA</div>
        <h2 style={{
          margin: 0, fontSize: 32, lineHeight: 1.06, fontWeight: 680,
          letterSpacing: '-0.03em', textWrap: 'balance',
        }}>{t.finalCta.title}</h2>
        <p style={{ margin: '10px 0 24px', fontSize: 15, color: '#CBD5E1' }}>
          {t.finalCta.sub}
        </p>
        <button onClick={onRequest} style={{
          ...primaryBtn,
          width: '100%',
          background: '#fff', color: '#0B1220',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        }}>
          <span>{t.finalCta.cta}</span>
          <Icon.arrow width="18" height="18"/>
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          margin: '20px 0',
        }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }}/>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>{t.finalCta.or}</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }}/>
        </div>
        <a href={`tel:${t.finalCta.phone.replace(/\s/g,'')}`} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '14px 18px', borderRadius: 14,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.14)',
          color: '#fff', textDecoration: 'none',
          fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em',
          minHeight: 44, backdropFilter: 'blur(8px)',
        }}>
          <Icon.phone width="16" height="16"/>
          {t.finalCta.phone}
        </a>
      </div>
    </section>
  );
}

// ─── 8. FOOTER ───────────────────────────────────────────────
function Footer({ t, lang, setLang }) {
  return (
    <footer style={{
      padding: '32px 22px 40px', background: '#0B1220', color: '#94A3B8',
      fontSize: 12.5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <Icon.logo width="26" height="26"/>
        <span style={{ fontSize: 15, fontWeight: 620, color: '#fff', letterSpacing: '-0.01em' }}>
          {t.footer.brand}
        </span>
      </div>
      <div style={{ lineHeight: 1.6, marginBottom: 18 }}>
        {t.footer.company}<br/>
        {t.footer.addr}
      </div>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '10px 16px', marginBottom: 22,
      }}>
        {t.footer.links.map((l, i) => (
          <a key={i} href="#" style={{
            color: '#CBD5E1', textDecoration: 'none',
            fontSize: 13, fontWeight: 520,
          }}>{l}</a>
        ))}
      </div>
      {/* Language switcher */}
      <div style={{
        display: 'inline-flex', padding: 3, borderRadius: 99,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        marginBottom: 20,
      }}>
        {['es','en'].map(l => (
          <button key={l} onClick={() => setLang(l)} style={{
            padding: '8px 16px', borderRadius: 99, border: 'none',
            background: lang === l ? '#fff' : 'transparent',
            color: lang === l ? '#0B1220' : '#94A3B8',
            fontSize: 12, fontWeight: 620, letterSpacing: '0.05em',
            cursor: 'pointer', minHeight: 32,
          }}>{l.toUpperCase()}</button>
        ))}
      </div>
      <div style={{
        paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.06)',
        fontSize: 11.5, color: '#64748B',
      }}>{t.footer.copy}</div>
    </footer>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const section = {
  padding: '44px 22px',
  background: '#FAFBFC',
};
const primaryBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '16px 22px', borderRadius: 14, border: 'none',
  background: 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)',
  color: '#fff', fontSize: 16, fontWeight: 620,
  letterSpacing: '-0.01em', cursor: 'pointer',
  boxShadow: '0 1px 0 rgba(255,255,255,0.2) inset, 0 10px 24px rgba(59,130,246,0.35), 0 2px 4px rgba(37,99,235,0.2)',
  minHeight: 52,
  fontFamily: 'inherit',
};
const iconBtn = {
  width: 40, height: 40, borderRadius: 12,
  background: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(15,23,42,0.06)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
};

Object.assign(window, { Hero, How, Services, Doctors, Trust, FAQ, FinalCTA, Footer });
