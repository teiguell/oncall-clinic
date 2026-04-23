// Tracking screen — full-width map + draggable-style bottom sheet
const Tracking = ({ t, etaMin, onBack, onOpenChat, onComplete }) => {
  const progress = Math.max(0, Math.min(1, 1 - etaMin / 12));

  const steps = [
    { label: t.step1, icon: IconCheck, state: "done" },
    { label: t.step2, icon: IconCar, state: etaMin > 0 ? "active" : "done" },
    { label: t.step3, icon: IconPin, state: etaMin === 0 ? "active" : "pending" },
    { label: t.step4, icon: IconStethoscope, state: "pending" },
    { label: t.step5, icon: IconCheck, state: "pending" },
  ];

  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      background: "#E6EFF4", overflow: "hidden",
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Full-bleed map */}
      <div style={{ position: "absolute", inset: 0 }}>
        <MapView progress={progress} height={874}/>
      </div>

      {/* Top bar overlay */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        padding: "56px 16px 12px",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "#fff", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}>
          <IconChevronLeft size={18} stroke="#0F172A" strokeWidth={2.2}/>
        </button>
        <div style={{ flex: 1 }}/>
        <div style={{
          background: "#fff", borderRadius: 999,
          padding: "8px 14px 8px 10px",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}>
          <PulseBadge color="#3B82F6" size={7}/>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F172A", letterSpacing: -0.1 }}>
            {t.trackingTitle}
          </div>
        </div>
      </div>

      {/* ETA hero overlay — floats above sheet */}
      <div style={{
        position: "absolute", left: 16, right: 16, top: 120, zIndex: 15,
        background: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
        borderRadius: 18, padding: "14px 16px",
        boxShadow: "0 8px 24px rgba(30,64,175,0.3)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "rgba(255,255,255,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <IconCar size={22} stroke="#fff" strokeWidth={1.8}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 500, letterSpacing: 0.4, textTransform: "uppercase" }}>
            {t.doctorOnWay}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", letterSpacing: -0.2, marginTop: 1 }}>
            {etaMin === 0 ? t.arrived : `Dra. García ${t.willArrive} ~${etaMin} min`}
          </div>
        </div>
      </div>

      {/* Bottom sheet */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 25,
        background: "#fff",
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        boxShadow: "0 -8px 32px rgba(0,0,0,0.08)",
        paddingBottom: 28,
        maxHeight: "65%",
        overflowY: "auto",
      }}>
        {/* Grip handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "#E5E7EB" }}/>
        </div>

        {/* Doctor card row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "8px 20px 14px",
          borderBottom: "1px solid #F1F5F9",
        }}>
          <DoctorAvatar size={48} verified/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 600, color: "#0F172A", letterSpacing: -0.2 }}>
              Dra. María García
            </div>
            <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 2 }}>
              {t.specialty} · <span style={{ color: "#10B981", fontWeight: 500 }}>{t.verified}</span>
            </div>
          </div>
          <button style={{
            width: 40, height: 40, borderRadius: 12,
            background: "#F1F5FB", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IconPhone size={18} stroke="#3B82F6" strokeWidth={1.8}/>
          </button>
          <button onClick={onOpenChat} style={{
            width: 40, height: 40, borderRadius: 12,
            background: "#F1F5FB", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IconChat size={18} stroke="#3B82F6" strokeWidth={1.8}/>
          </button>
        </div>

        {/* Vertical stepper */}
        <div style={{ padding: "16px 20px 4px" }}>
          {steps.map((s, i) => {
            const Ic = s.icon;
            const isActive = s.state === "active";
            const isDone = s.state === "done";
            const color = isDone ? "#10B981" : isActive ? "#3B82F6" : "#CBD5E1";
            const bg = isDone ? "#D1FAE5" : isActive ? "#DBEAFE" : "#F1F5F9";
            return (
              <div key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
                {/* Icon circle + line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%", background: bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative", zIndex: 2,
                  }}>
                    {isActive && (
                      <div style={{
                        position: "absolute", inset: -4, borderRadius: "50%",
                        background: "#3B82F6", opacity: 0.25,
                        animation: "stepPulse 1.8s ease-out infinite",
                      }}/>
                    )}
                    <Ic size={15} stroke={color} strokeWidth={2.2}/>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{
                      width: 2, flex: 1, minHeight: 20,
                      background: isDone ? "#10B981" : "#E5E7EB",
                      marginTop: -1, marginBottom: -1,
                    }}/>
                  )}
                </div>
                {/* Label */}
                <div style={{ flex: 1, paddingBottom: i < steps.length - 1 ? 18 : 4, paddingTop: 5 }}>
                  <div style={{
                    fontSize: 14, fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#0F172A" : isDone ? "#0F172A" : "#9CA3AF",
                    letterSpacing: -0.1,
                  }}>
                    {s.label}
                  </div>
                  {isActive && (
                    <div style={{ fontSize: 12, color: "#3B82F6", fontWeight: 500, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                      {etaMin === 0 ? t.arrived : `ETA ${etaMin} min`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div style={{
          display: "flex", gap: 10, padding: "12px 20px 8px",
        }}>
          <button onClick={onOpenChat} style={{
            flex: 1, height: 50,
            background: "#3B82F6", color: "#fff",
            border: "none", borderRadius: 14,
            fontSize: 15, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 2px 8px rgba(59,130,246,0.25)",
          }}>{t.contact}</button>
          <button onClick={onComplete} style={{
            flex: 1, height: 50,
            background: "#fff", color: "#EF4444",
            border: "1px solid #FEE2E2", borderRadius: 14,
            fontSize: 15, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit",
          }}>{t.cancel}</button>
        </div>
      </div>
    </div>
  );
};

window.Tracking = Tracking;
