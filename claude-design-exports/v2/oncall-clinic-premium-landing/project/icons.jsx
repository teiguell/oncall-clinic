// icons.jsx — minimal stroke icons, 24x24, currentColor
const Icon = {
  stetho: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 3v6a4 4 0 0 0 8 0V3" /><path d="M10 13v3a4 4 0 0 0 8 0v-2" />
      <circle cx="18" cy="12" r="2" />
    </svg>
  ),
  message: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-4 3v-3H6a2 2 0 0 1-2-2V6z"/>
      <path d="M8 10h8M8 13h5"/>
    </svg>
  ),
  pickDoc: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="8" r="3.5"/>
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/>
      <path d="M17 5l1.5 1.5L21 4"/>
    </svg>
  ),
  arrive: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 21s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  ),
  child: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="7" r="3"/>
      <path d="M9 7h.01M15 7h.01"/>
      <path d="M6 21c0-3 2.5-5 6-5s6 2 6 5"/>
    </svg>
  ),
  physio: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="8" cy="5" r="2"/>
      <path d="M8 7v5l4 2 3 5M8 12l-3 4M14 9l3-1 3 3"/>
    </svg>
  ),
  nurse: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 9c0-3 3.5-5 8-5s8 2 8 5"/>
      <path d="M12 4v4M10 6h4"/>
      <path d="M6 11c1 6 3 9 6 9s5-3 6-9"/>
    </svg>
  ),
  star: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8L5.7 21l1.7-7L2 9.5l7.1-.6L12 2z"/>
    </svg>
  ),
  check: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 12l5 5L20 6"/>
    </svg>
  ),
  x: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 6l12 12M18 6L6 18"/>
    </svg>
  ),
  plus: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  minus: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14"/>
    </svg>
  ),
  arrow: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M13 6l6 6-6 6"/>
    </svg>
  ),
  phone: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 5c0 9 6 15 15 15v-4l-4-1-2 2c-3-1-5-3-6-6l2-2-1-4H4z"/>
    </svg>
  ),
  shield: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  lock: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="5" y="11" width="14" height="9" rx="2"/>
      <path d="M8 11V8a4 4 0 0 1 8 0v3"/>
    </svg>
  ),
  badge: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 2l2 2 3-1 1 3 3 1-1 3 1 3-3 1-1 3-3-1-2 2-2-2-3 1-1-3-3-1 1-3-1-3 3-1 1-3 3 1 2-2z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  menu: (p = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}>
      <path d="M4 7h16M4 12h16M4 17h10"/>
    </svg>
  ),
  logo: (p = {}) => (
    <svg viewBox="0 0 28 28" fill="none" {...p}>
      <rect x="1" y="1" width="26" height="26" rx="8" fill="#3B82F6"/>
      <path d="M14 8v12M8 14h12" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/>
    </svg>
  ),
};
Object.assign(window, { Icon });
