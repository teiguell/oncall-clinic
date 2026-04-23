// Shared primitives — header, progress, buttons, etc.

const TOKENS = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  success: '#10B981',
  warning: '#F59E0B',
  bg: '#FAFBFC',
  surface: '#FFFFFF',
  ink: '#0F172A',
  ink2: '#475569',
  ink3: '#94A3B8',
  line: '#E7EAF0',
  softBlue: '#EFF5FF',
  softGreen: '#ECFDF5',
  softAmber: '#FFFBEB',
};

// Fake-iOS status bar (white text on gradient or dark on light)
function AppStatusBar({ tint = 'dark' }) {
  const c = tint === 'dark' ? '#0F172A' : '#fff';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 28px 6px', fontFamily: 'Inter', height: 44, boxSizing: 'border-box',
    }}>
      <span style={{ fontWeight: 600, fontSize: 15, color: c, letterSpacing: -0.2 }}>9:41</span>
      <div style={{ width: 100 }} />
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', color: c }}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill={c}>
          <rect x="0" y="7" width="3" height="4" rx="0.5"/>
          <rect x="4.5" y="4.5" width="3" height="6.5" rx="0.5"/>
          <rect x="9" y="2" width="3" height="9" rx="0.5"/>
          <rect x="13.5" y="0" width="3" height="11" rx="0.5"/>
        </svg>
        <svg width="24" height="11" viewBox="0 0 24 11"><rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke={c} fill="none" opacity="0.4"/><rect x="2" y="2" width="17" height="7" rx="1.5" fill={c}/><rect x="21.5" y="3.5" width="1.5" height="4" rx="0.5" fill={c} opacity="0.4"/></svg>
      </div>
    </div>
  );
}

// Progress header with back button + step indicator + progress bar
function StepHeader({ step, total = 4, onBack, t, compact = false }) {
  const pct = (step / total) * 100;
  return (
    <div style={{
      background: TOKENS.bg, borderBottom: `1px solid ${TOKENS.line}`,
      padding: '0 20px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 44 }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10, background: TOKENS.surface,
          border: `1px solid ${TOKENS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: 0,
          opacity: step === 1 ? 0.4 : 1,
        }}>
          <IconArrowLeft size={18} stroke={TOKENS.ink} />
        </button>
        <div style={{ textAlign: 'center', fontFamily: 'Inter' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: TOKENS.ink3, letterSpacing: 1.5 }}>
            {t.step.toUpperCase()} {step} / {total}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink, marginTop: 2 }}>
            {t.appName}
          </div>
        </div>
        <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconInfo size={20} stroke={TOKENS.ink3} />
        </div>
      </div>
      <div style={{ height: 4, background: TOKENS.line, borderRadius: 999, overflow: 'hidden', marginTop: 6 }}>
        <div style={{
          height: '100%', width: pct + '%', background: TOKENS.primary,
          borderRadius: 999, transition: 'width 360ms cubic-bezier(.3,.9,.4,1)',
        }} />
      </div>
    </div>
  );
}

// Primary/secondary button
function Btn({ children, onClick, variant = 'primary', disabled, trailing, leading, style = {} }) {
  const variants = {
    primary: { bg: TOKENS.primary, fg: '#fff', border: 'transparent' },
    success: { bg: TOKENS.success, fg: '#fff', border: 'transparent' },
    ghost: { bg: TOKENS.surface, fg: TOKENS.ink, border: TOKENS.line },
  };
  const v = variants[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', minHeight: 54, borderRadius: 14,
      background: disabled ? '#CBD5E1' : v.bg, color: v.fg,
      border: `1px solid ${v.border}`, fontFamily: 'Inter',
      fontSize: 16, fontWeight: 600, letterSpacing: -0.1,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      boxShadow: disabled ? 'none' : '0 4px 12px rgba(59,130,246,0.25)',
      transition: 'transform 150ms, box-shadow 150ms',
      ...style,
    }}
    onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(0.98)')}
    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {leading}
      <span>{children}</span>
      {trailing}
    </button>
  );
}

// Sticky bottom action bar
function StickyBar({ children, style = {} }) {
  return (
    <div style={{
      padding: '12px 20px 28px',
      background: 'linear-gradient(to top, #FAFBFC 70%, rgba(250,251,252,0))',
      position: 'sticky', bottom: 0, ...style,
    }}>{children}</div>
  );
}

// Pill / chip
function Chip({ active, onClick, children, size = 'md' }) {
  const padY = size === 'sm' ? 6 : 9;
  const padX = size === 'sm' ? 10 : 14;
  return (
    <button onClick={onClick} style={{
      padding: `${padY}px ${padX}px`, borderRadius: 999,
      fontFamily: 'Inter', fontSize: size === 'sm' ? 12 : 13, fontWeight: 500,
      background: active ? TOKENS.ink : TOKENS.surface,
      color: active ? '#fff' : TOKENS.ink2,
      border: `1px solid ${active ? TOKENS.ink : TOKENS.line}`,
      cursor: 'pointer', whiteSpace: 'nowrap',
      transition: 'all 160ms',
    }}>{children}</button>
  );
}

function Card({ children, style = {}, onClick, active }) {
  return (
    <div onClick={onClick} style={{
      background: TOKENS.surface,
      borderRadius: 16,
      border: `1.5px solid ${active ? TOKENS.primary : TOKENS.line}`,
      boxShadow: active
        ? '0 0 0 4px rgba(59,130,246,0.12), 0 2px 8px rgba(15,23,42,0.04)'
        : '0 1px 2px rgba(15,23,42,0.03)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 180ms, box-shadow 180ms',
      ...style,
    }}>{children}</div>
  );
}

// Avatar
function Avatar({ hue = 210, init = 'DR', size = 56, verified }) {
  const bg = `oklch(0.82 0.08 ${hue})`;
  const fg = `oklch(0.32 0.1 ${hue})`;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: bg, color: fg, position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter', fontWeight: 600, fontSize: size * 0.38,
      letterSpacing: -0.5,
    }}>
      {init}
      {verified && (
        <div style={{
          position: 'absolute', bottom: -2, right: -2,
          width: size * 0.36, height: size * 0.36, borderRadius: '50%',
          background: TOKENS.success, border: '2px solid #fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconCheck size={size * 0.2} stroke="#fff" sw={3} />
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  TOKENS, AppStatusBar, StepHeader, Btn, StickyBar, Chip, Card, Avatar,
});
