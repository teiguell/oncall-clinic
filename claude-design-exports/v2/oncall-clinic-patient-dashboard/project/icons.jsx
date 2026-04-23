// Stroke-based line icons (Lucide-ish) sized via style.width/height
const Icon = ({ d, size = 20, stroke = "currentColor", strokeWidth = 2, fill = "none", children, viewBox = "0 0 24 24" }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d} /> : children}
  </svg>
);

const IconBell = (p) => <Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></Icon>;
const IconHome = (p) => <Icon {...p}><path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z"/></Icon>;
const IconList = (p) => <Icon {...p}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></Icon>;
const IconChat = (p) => <Icon {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></Icon>;
const IconUser = (p) => <Icon {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>;
const IconPhone = (p) => <Icon {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></Icon>;
const IconCheck = (p) => <Icon {...p}><path d="M20 6 9 17l-5-5"/></Icon>;
const IconCheckCircle = (p) => <Icon {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></Icon>;
const IconCar = (p) => <Icon {...p}><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></Icon>;
const IconPin = (p) => <Icon {...p}><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></Icon>;
const IconStethoscope = (p) => <Icon {...p}><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .2.3"/><path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></Icon>;
const IconPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
const IconReceipt = (p) => <Icon {...p}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><path d="M8 7h8M8 12h8M8 17h5"/></Icon>;
const IconSend = (p) => <Icon {...p}><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></Icon>;
const IconAttach = (p) => <Icon {...p}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></Icon>;
const IconChevronLeft = (p) => <Icon {...p}><path d="m15 18-6-6 6-6"/></Icon>;
const IconChevronRight = (p) => <Icon {...p}><path d="m9 18 6-6-6-6"/></Icon>;
const IconStar = ({ filled, size = 20, color = "#F59E0B" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth={2} strokeLinejoin="round">
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const IconDownload = (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></Icon>;
const IconMic = (p) => <Icon {...p}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10a7 7 0 0 1-14 0M12 19v3"/></Icon>;
const IconSparkle = (p) => <Icon {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></Icon>;
const IconNav = (p) => <Icon {...p}><path d="M3 11l19-9-9 19-2-8-8-2z"/></Icon>;
const IconX = (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>;
const IconArrow = (p) => <Icon {...p}><path d="M5 12h14M13 5l7 7-7 7"/></Icon>;
const IconShield = (p) => (
  <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="#3B82F6">
    <path d="M12 2 3 6v6c0 5 4 9 9 10 5-1 9-5 9-10V6l-9-4z"/>
    <path d="m9 12 2 2 4-4" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

Object.assign(window, {
  IconBell, IconHome, IconList, IconChat, IconUser, IconPhone, IconCheck, IconCheckCircle,
  IconCar, IconPin, IconStethoscope, IconPlus, IconReceipt, IconSend, IconAttach,
  IconChevronLeft, IconChevronRight, IconStar, IconDownload, IconMic, IconSparkle,
  IconNav, IconX, IconArrow, IconShield,
});
