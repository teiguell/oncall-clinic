// STEP 4 — Payment + Success

function Step4({ t, lang, selectedType, selectedDoctor, onPay, paid }) {
  const doctor = DOCTORS.find(d => d.id === selectedDoctor);
  const consultLabel = selectedType === 'general' ? t.s1_general : selectedType === 'urgent' ? t.s1_urgent : t.s1_ped;
  const [card, setCard] = React.useState('4242 4242 4242 4242');
  const [exp, setExp] = React.useState('12 / 28');
  const [cvc, setCvc] = React.useState('123');
  const [accept, setAccept] = React.useState(true);
  const [paying, setPaying] = React.useState(false);

  const fieldStyle = {
    padding: 14, borderRadius: 12, boxSizing: 'border-box',
    border: `1.5px solid ${TOKENS.line}`, background: TOKENS.surface,
    fontFamily: 'Inter', fontSize: 14, color: TOKENS.ink, outline: 'none',
  };

  if (paid) return <Success t={t} doctor={doctor} lang={lang} />;

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => { setPaying(false); onPay(); }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 20px 0' }}>
        {/* Order summary */}
        <div style={{
          background: TOKENS.surface, borderRadius: 16,
          border: `1px solid ${TOKENS.line}`, overflow: 'hidden', marginBottom: 14,
        }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${TOKENS.line}` }}>
            <div style={{
              fontFamily: 'Inter', fontSize: 11, fontWeight: 600,
              color: TOKENS.ink3, letterSpacing: 1.4, marginBottom: 10,
            }}>{t.order.toUpperCase()}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar hue={doctor.hue} init={doctor.init} verified size={46} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: TOKENS.ink }}>
                  {doctor.name}
                </div>
                <div style={{ fontFamily: 'Inter', fontSize: 12, color: TOKENS.ink2, marginTop: 2 }}>
                  {consultLabel} · ~{doctor.etaMin} min
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <Row label={t.consultation} value={`€${doctor.price}`} />
            <Row label={t.travel} value={<span style={{ color: TOKENS.success }}>{t.included}</span>} />
            <div style={{ height: 1, background: TOKENS.line, margin: '10px 0' }} />
            <Row label={<b style={{ color: TOKENS.ink }}>{t.total}</b>}
                 value={<span style={{ fontSize: 18, fontWeight: 700, color: TOKENS.ink, letterSpacing: -0.3 }}>€{doctor.price}</span>} />
          </div>
        </div>

        {/* Payment method */}
        <div style={{
          fontFamily: 'Inter', fontSize: 11, fontWeight: 600,
          color: TOKENS.ink3, letterSpacing: 1.4, marginBottom: 10,
        }}>{t.pay_method.toUpperCase()}</div>

        <div style={{ position: 'relative', marginBottom: 8 }}>
          <input value={card} onChange={e => setCard(e.target.value)} placeholder="1234 5678 9012 3456"
            style={{ ...fieldStyle, width: '100%', paddingLeft: 46, paddingRight: 74 }} />
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
            <IconCard size={18} stroke={TOKENS.ink2} />
          </div>
          <div style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            display: 'flex', gap: 4,
          }}>
            <CardLogo kind="visa" />
            <CardLogo kind="mc" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input value={exp} onChange={e => setExp(e.target.value)} placeholder="MM / YY"
            style={{ ...fieldStyle, flex: 1, minWidth: 0 }} />
          <input value={cvc} onChange={e => setCvc(e.target.value)} placeholder="CVC"
            style={{ ...fieldStyle, width: 96 }} />
        </div>

        {/* Security badges */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 14,
        }}>
          <Badge icon={<IconLock size={13} stroke={TOKENS.success} />} label={t.ssl} />
          <Badge icon={<IconShield size={13} stroke={TOKENS.primary} />} label={t.stripe} />
        </div>

        {/* Terms */}
        <label style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: 12, borderRadius: 12,
          background: TOKENS.surface, border: `1px solid ${TOKENS.line}`,
          cursor: 'pointer', marginBottom: 16,
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
            border: `1.5px solid ${accept ? TOKENS.primary : TOKENS.line}`,
            background: accept ? TOKENS.primary : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setAccept(!accept)}>
            {accept && <IconCheck size={12} stroke="#fff" sw={3} />}
          </div>
          <span style={{ fontFamily: 'Inter', fontSize: 12.5, color: TOKENS.ink2, lineHeight: 1.4 }}>
            {t.accept} <u>{t.terms}</u> {t.and} <u>{t.privacy}</u> {lang === 'es' ? 'de Ibiza Care SL.' : 'of Ibiza Care SL.'}
          </span>
        </label>
        <div style={{ height: 4 }} />
      </div>

      <StickyBar>
        <Btn variant="success" onClick={handlePay} disabled={!accept || paying}
          leading={paying ? <Spinner /> : <IconLock size={16} stroke="#fff" sw={2.5} />}>
          {paying ? (lang === 'es' ? 'Procesando...' : 'Processing...') : `${t.pay} €${doctor.price}`}
        </Btn>
      </StickyBar>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: 'Inter', fontSize: 13.5, padding: '4px 0' }}>
      <span style={{ color: TOKENS.ink2 }}>{label}</span>
      <span style={{ color: TOKENS.ink, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function Badge({ icon, label }) {
  return (
    <div style={{
      flex: 1, padding: '8px 10px', borderRadius: 10,
      background: TOKENS.surface, border: `1px solid ${TOKENS.line}`,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {icon}
      <span style={{ fontFamily: 'Inter', fontSize: 11.5, color: TOKENS.ink2, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function CardLogo({ kind }) {
  if (kind === 'visa') return (
    <div style={{
      width: 30, height: 20, borderRadius: 4,
      background: '#1A1F71', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter', fontSize: 9, fontWeight: 800, letterSpacing: 0.5,
    }}>VISA</div>
  );
  return (
    <div style={{
      width: 30, height: 20, borderRadius: 4,
      background: '#fff', border: `1px solid ${TOKENS.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EB001B', marginRight: -3 }} />
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F79E1B', opacity: 0.85 }} />
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 16, height: 16, borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}

function Success({ t, doctor, lang }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '30px 24px 28px', justifyContent: 'space-between', height: '100%',
    }}>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        {/* Big success animation */}
        <div style={{ position: 'relative', marginTop: 20, marginBottom: 24 }}>
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            background: TOKENS.success, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            animation: 'successPop 520ms cubic-bezier(.2,1.2,.5,1)',
            boxShadow: '0 10px 36px rgba(16,185,129,0.35)',
          }}>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <path d="M12 28 L24 40 L44 18" stroke="#fff" strokeWidth="5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{
                  strokeDasharray: 60, strokeDashoffset: 60,
                  animation: 'drawCheck 480ms 180ms forwards ease-out',
                }}/>
            </svg>
          </div>
          {/* ripple rings */}
          <div style={{
            position: 'absolute', inset: -14, borderRadius: '50%',
            border: `2px solid ${TOKENS.success}`, opacity: 0.2,
            animation: 'ringExpand 1.4s 200ms infinite',
          }} />
        </div>

        <h1 style={{
          fontFamily: 'Inter', fontSize: 26, fontWeight: 700, color: TOKENS.ink,
          margin: 0, letterSpacing: -0.6,
        }}>{t.success_title}</h1>
        <p style={{
          fontFamily: 'Inter', fontSize: 15, color: TOKENS.ink2,
          margin: '8px 0 0', textAlign: 'center', lineHeight: 1.5,
        }}>{t.success_msg}</p>

        {/* ETA card */}
        <div style={{
          width: '100%', marginTop: 22, padding: 16, borderRadius: 16,
          background: TOKENS.surface, border: `1px solid ${TOKENS.line}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar hue={doctor.hue} init={doctor.init} verified size={52} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Inter', fontSize: 13, color: TOKENS.ink2 }}>
                {t.success_eta}
              </div>
              <div style={{
                fontFamily: 'Inter', fontSize: 22, fontWeight: 700,
                color: TOKENS.ink, letterSpacing: -0.4,
              }}>
                {doctor.etaMin} min
              </div>
              <div style={{ fontFamily: 'Inter', fontSize: 12, color: TOKENS.ink2, marginTop: 1 }}>
                {doctor.name}
              </div>
            </div>
            <div style={{
              padding: '6px 10px', borderRadius: 999,
              background: TOKENS.softGreen, color: '#047857',
              fontFamily: 'Inter', fontSize: 11, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: 999, background: TOKENS.success,
                animation: 'pulseDot 1.6s infinite' }} />
              {lang === 'es' ? 'En ruta' : 'En route'}
            </div>
          </div>

          {/* progress dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 16 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 999,
                background: i <= 2 ? TOKENS.success : TOKENS.line,
              }} />
            ))}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontFamily: 'Inter', fontSize: 10.5, color: TOKENS.ink3,
            marginTop: 8, fontWeight: 500, letterSpacing: 0.2,
          }}>
            <span>{lang === 'es' ? 'Confirmado' : 'Confirmed'}</span>
            <span style={{ color: TOKENS.success }}>{lang === 'es' ? 'En ruta' : 'En route'}</span>
            <span>{lang === 'es' ? 'Llegado' : 'Arrived'}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ width: '100%', display: 'flex', gap: 8, marginTop: 12 }}>
          <Btn variant="ghost" leading={<IconPhone size={16} stroke={TOKENS.ink} />}>
            {t.success_call}
          </Btn>
          <Btn variant="ghost" leading={<IconMsg size={16} stroke={TOKENS.ink} />}>
            {t.success_msg_btn}
          </Btn>
        </div>
      </div>

      <div style={{ width: '100%', marginTop: 14 }}>
        <Btn>{t.success_track}</Btn>
      </div>
    </div>
  );
}

window.Step4 = Step4;
