// Dashboard screen
const Dashboard = ({ t, etaMin, onOpenTracking, onOpenChat }) => {
  return (
    <div style={{
      background: "#FAFBFC", minHeight: "100%", paddingBottom: 100,
      fontFamily: "Inter, -apple-system, sans-serif",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "56px 20px 20px",
      }}>
        <div>
          <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 500, letterSpacing: 0.2 }}>
            {new Date().toLocaleDateString(t === T.es ? 'es-ES' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#0F172A", letterSpacing: -0.7, marginTop: 2 }}>
            {t.greeting}
          </div>
        </div>
        <div style={{
          position: "relative", width: 44, height: 44, borderRadius: 14,
          background: "#fff", border: "1px solid #EEF1F5",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}>
          <IconBell size={20} stroke="#0F172A" strokeWidth={1.8}/>
          <div style={{
            position: "absolute", top: 8, right: 8,
            width: 8, height: 8, borderRadius: "50%", background: "#EF4444",
            border: "2px solid #fff", boxSizing: "content-box",
          }}/>
        </div>
      </div>

      {/* Active consultation card */}
      <div style={{ padding: "0 16px" }}>
        <div style={{
          background: "linear-gradient(180deg, #FFFFFF 0%, #FAFCFF 100%)",
          borderRadius: 20,
          border: "1px solid #E7EEF9",
          boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(59,130,246,0.06)",
          overflow: "hidden",
        }}>
          {/* Status strip */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "14px 16px 12px",
          }}>
            <PulseBadge color="#3B82F6" size={8}/>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#3B82F6", letterSpacing: 0.1 }}>
              {t.doctorOnWay.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}/>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#6B7280", letterSpacing: 0.3 }}>
              LIVE
            </div>
          </div>

          {/* Doctor row */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "0 16px 14px",
          }}>
            <DoctorAvatar size={52} verified/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", letterSpacing: -0.2 }}>
                Dra. María García
              </div>
              <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <span>{t.specialty}</span>
                <span style={{ color: "#D1D5DB" }}>·</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <IconStar filled size={11} color="#F59E0B"/> 4.9
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 500, letterSpacing: 0.3 }}>ETA</div>
              <div style={{
                fontSize: 28, fontWeight: 700, color: "#10B981",
                letterSpacing: -1, lineHeight: 1, marginTop: 2,
                fontVariantNumeric: "tabular-nums",
              }}>
                {etaMin}<span style={{ fontSize: 13, fontWeight: 500, color: "#10B981", marginLeft: 3 }}>{t.eta}</span>
              </div>
            </div>
          </div>

          {/* Mini map */}
          <div style={{ position: "relative", height: 140, overflow: "hidden" }}>
            <MapView progress={Math.max(0.1, 1 - etaMin / 12)} mini height={140}/>
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(255,255,255,0) 60%, rgba(255,255,255,0.7) 100%)",
              pointerEvents: "none",
            }}/>
          </div>

          {/* CTA */}
          <div style={{ padding: 12 }}>
            <button onClick={onOpenTracking} style={{
              width: "100%", height: 48,
              background: "#3B82F6", color: "#fff",
              border: "none", borderRadius: 14,
              fontSize: 15, fontWeight: 600, letterSpacing: -0.1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(59,130,246,0.3), 0 4px 12px rgba(59,130,246,0.25)",
              fontFamily: "inherit",
            }}>
              {t.viewTracking}
              <IconArrow size={16} stroke="#fff" strokeWidth={2.2}/>
            </button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 10, padding: "20px 16px 8px",
      }}>
        {[
          { label: t.newConsultation, icon: IconPlus, bg: "#3B82F6", fg: "#fff" },
          { label: t.myProfile, icon: IconUser, bg: "#fff", fg: "#0F172A" },
          { label: t.invoices, icon: IconReceipt, bg: "#fff", fg: "#0F172A" },
        ].map((a, i) => {
          const Ic = a.icon;
          return (
            <div key={i} style={{
              background: a.bg, borderRadius: 16,
              padding: "14px 12px", cursor: "pointer",
              border: a.bg === "#fff" ? "1px solid #EEF1F5" : "none",
              boxShadow: a.bg === "#3B82F6" ? "0 2px 8px rgba(59,130,246,0.2)" : "none",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: a.bg === "#3B82F6" ? "rgba(255,255,255,0.2)" : "#F1F5FB",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Ic size={18} stroke={a.fg} strokeWidth={1.8}/>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: a.fg, lineHeight: 1.25, letterSpacing: -0.1 }}>
                {a.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Past consultations */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 10,
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", letterSpacing: -0.2 }}>
            {t.pastConsultations}
          </div>
          <div style={{ fontSize: 13, color: "#3B82F6", fontWeight: 500 }}>{t.viewAll}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { doc: t.past1Doctor, type: t.past1Type, date: t.past1Date, rating: 5, init: "JR", hue: 220 },
            { doc: t.past2Doctor, type: t.past2Type, date: t.past2Date, rating: 4, init: "EC", hue: 340 },
          ].map((c, i) => (
            <div key={i} style={{
              background: "#fff", borderRadius: 14,
              border: "1px solid #EEF1F5",
              padding: 12, display: "flex", alignItems: "center", gap: 12,
            }}>
              <PersonAvatar size={40} initials={c.init} hue={c.hue}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", letterSpacing: -0.1 }}>
                  {c.doc}
                </div>
                <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 2 }}>
                  {c.type} · {c.date}
                </div>
              </div>
              <div style={{ display: "flex", gap: 1 }}>
                {[1,2,3,4,5].map(n => (
                  <IconStar key={n} filled={n <= c.rating} size={11} color={n <= c.rating ? "#F59E0B" : "#E5E7EB"}/>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

window.Dashboard = Dashboard;
