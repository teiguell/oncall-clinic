// Consultation Complete screen
const Complete = ({ t, onBackHome }) => {
  const [rating, setRating] = React.useState(5);
  const [review, setReview] = React.useState("");

  return (
    <div style={{
      background: "#FAFBFC", minHeight: "100%", paddingBottom: 40,
      fontFamily: "Inter, sans-serif", position: "relative", overflow: "hidden",
    }}>
      {/* Confetti */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 260, overflow: "hidden", pointerEvents: "none" }}>
        {Array.from({ length: 16 }).map((_, i) => {
          const colors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
          const left = (i * 23 + 7) % 100;
          const delay = (i * 0.15) % 2;
          const color = colors[i % colors.length];
          return (
            <div key={i} style={{
              position: "absolute", top: -10, left: `${left}%`,
              width: 8, height: 12, background: color, borderRadius: 2,
              animation: `confettiFall 3.5s ease-in ${delay}s infinite`,
              transform: `rotate(${i * 27}deg)`,
              opacity: 0.9,
            }}/>
          );
        })}
      </div>

      {/* Hero */}
      <div style={{
        padding: "80px 24px 28px", textAlign: "center", position: "relative",
      }}>
        <div style={{
          width: 84, height: 84, borderRadius: "50%", margin: "0 auto 18px",
          background: "linear-gradient(135deg, #10B981, #059669)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
          position: "relative",
          animation: "scaleIn 0.5s cubic-bezier(.3,1.4,.6,1)",
        }}>
          <div style={{
            position: "absolute", inset: -8, borderRadius: "50%",
            border: "2px solid #10B981", opacity: 0.3,
            animation: "ripple 2s ease-out infinite",
          }}/>
          <IconCheck size={44} stroke="#fff" strokeWidth={2.8}/>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", letterSpacing: -0.6 }}>
          {t.completeTitle}
        </div>
        <div style={{ fontSize: 14, color: "#6B7280", marginTop: 6, lineHeight: 1.4 }}>
          {t.completeSubtitle}
        </div>
      </div>

      {/* Summary card */}
      <div style={{ padding: "0 16px" }}>
        <div style={{
          background: "#fff", borderRadius: 18, border: "1px solid #EEF1F5",
          padding: 16,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", letterSpacing: 0.4, textTransform: "uppercase" }}>
            {t.summary}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0 14px" }}>
            <DoctorAvatar size={44} verified/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", letterSpacing: -0.2 }}>
                Dra. María García
              </div>
              <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 1 }}>{t.specialty}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[
              { label: t.date, value: "19 Abr" },
              { label: t.duration, value: "32 min" },
            ].map((f, i) => (
              <div key={i} style={{ background: "#FAFBFC", borderRadius: 12, padding: "10px 12px" }}>
                <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, letterSpacing: 0.3 }}>
                  {f.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginTop: 2, letterSpacing: -0.1 }}>
                  {f.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "#FAFBFC", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 4 }}>
              {t.diagnosis}
            </div>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, letterSpacing: -0.05 }}>
              {t.diagnosisText}
            </div>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{
          background: "#fff", borderRadius: 18, border: "1px solid #EEF1F5",
          padding: 16,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", letterSpacing: -0.1, textAlign: "center" }}>
            {t.rateConsultation}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, margin: "12px 0 14px" }}>
            {[1,2,3,4,5].map(n => (
              <div key={n} onClick={() => setRating(n)} style={{ cursor: "pointer", padding: 2, transition: "transform 0.15s", transform: n === rating ? "scale(1.1)" : "scale(1)" }}>
                <IconStar filled={n <= rating} size={32} color={n <= rating ? "#F59E0B" : "#E5E7EB"}/>
              </div>
            ))}
          </div>
          <textarea
            value={review}
            onChange={e => setReview(e.target.value)}
            placeholder={t.reviewPlaceholder}
            style={{
              width: "100%", minHeight: 72, resize: "none",
              background: "#FAFBFC", border: "1px solid #EEF1F5",
              borderRadius: 12, padding: 12, fontSize: 13,
              fontFamily: "inherit", color: "#0F172A",
              outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Invoice */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{
          background: "#fff", borderRadius: 18, border: "1px solid #EEF1F5",
          padding: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, letterSpacing: 0.3 }}>
                {t.invoice.toUpperCase()}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", letterSpacing: -0.8, marginTop: 2 }}>
                €150<span style={{ color: "#9CA3AF", fontWeight: 500 }}>.00</span>
              </div>
            </div>
            <div style={{
              background: "#D1FAE5", color: "#059669",
              padding: "4px 10px", borderRadius: 999,
              fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <IconCheck size={11} stroke="#059669" strokeWidth={2.5}/>
              PAGADO
            </div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", background: "#FAFBFC",
            borderRadius: 12, marginBottom: 12,
          }}>
            <div style={{
              width: 34, height: 22, borderRadius: 4,
              background: "linear-gradient(135deg, #1A1F71, #2D3DB5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: 0.5,
              fontStyle: "italic",
            }}>VISA</div>
            <div style={{ fontSize: 13, color: "#374151", fontVariantNumeric: "tabular-nums", letterSpacing: 0.3 }}>
              {t.paidWith} •••• 4242
            </div>
          </div>
          <button style={{
            width: "100%", height: 44,
            background: "#F1F5FB", color: "#3B82F6",
            border: "none", borderRadius: 12,
            fontSize: 14, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <IconDownload size={16} stroke="#3B82F6" strokeWidth={2}/>
            {t.downloadInvoice}
          </button>
        </div>
      </div>

      {/* Back home */}
      <div style={{ padding: "20px 16px 0" }}>
        <button onClick={onBackHome} style={{
          width: "100%", height: 52,
          background: "#0F172A", color: "#fff",
          border: "none", borderRadius: 14,
          fontSize: 15, fontWeight: 600, cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 2px 8px rgba(15,23,42,0.15)",
        }}>{t.backHome}</button>
      </div>
    </div>
  );
};

window.Complete = Complete;
