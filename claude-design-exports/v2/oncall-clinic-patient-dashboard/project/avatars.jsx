// Doctor avatar — warm illustrated portrait placeholder (no stock photo)
const DoctorAvatar = ({ size = 48, verified = false, showRing = false, ringColor = "#3B82F6" }) => {
  const s = size;
  const initials = "MG";
  return (
    <div style={{
      width: s, height: s, position: "relative", flexShrink: 0,
    }}>
      {showRing && (
        <div style={{
          position: "absolute", inset: -3, borderRadius: "50%",
          background: `conic-gradient(${ringColor}, ${ringColor}80, ${ringColor})`,
          padding: 2,
        }}>
          <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: "50%" }} />
        </div>
      )}
      <div style={{
        width: s, height: s, borderRadius: "50%",
        background: "linear-gradient(135deg, #FDE68A 0%, #F59E0B 60%, #D97706 100%)",
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 600, fontSize: s * 0.38,
        letterSpacing: -0.5,
        boxShadow: "inset 0 -4px 8px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}>
        {/* abstract face silhouette via radial gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.35) 0%, transparent 40%)`,
        }}/>
        <span style={{ position: "relative", fontFamily: "Inter, sans-serif" }}>{initials}</span>
      </div>
      {verified && (
        <div style={{
          position: "absolute", bottom: -2, right: -2,
          width: s * 0.38, height: s * 0.38, minWidth: 16, minHeight: 16,
          borderRadius: "50%", background: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        }}>
          <IconShield size={Math.max(10, s * 0.26)}/>
        </div>
      )}
    </div>
  );
};

// Generic colored avatar for past consultations
const PersonAvatar = ({ size = 40, initials = "XX", hue = 210 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: `linear-gradient(135deg, oklch(0.82 0.08 ${hue}) 0%, oklch(0.62 0.14 ${hue}) 100%)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 600, fontSize: size * 0.38,
    fontFamily: "Inter, sans-serif", flexShrink: 0,
    boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.08)",
  }}>{initials}</div>
);

// Pulse badge — the "Médico en camino" indicator
const PulseBadge = ({ color = "#3B82F6", size = 8 }) => (
  <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
    <div style={{
      position: "absolute", inset: 0, borderRadius: "50%",
      background: color, animation: "pulseDot 1.8s ease-out infinite",
    }}/>
    <div style={{
      position: "absolute", inset: 0, borderRadius: "50%", background: color,
    }}/>
  </div>
);

window.DoctorAvatar = DoctorAvatar;
window.PersonAvatar = PersonAvatar;
window.PulseBadge = PulseBadge;
