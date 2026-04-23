// Chat screen
const Chat = ({ t, onBack }) => {
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(true);
  const [messages, setMessages] = React.useState([
    { who: "doc", text: t.msg1, time: "10:32" },
    { who: "me", text: t.msg2, time: "10:33" },
    { who: "doc", text: t.msg3, time: "10:34" },
    { who: "me", text: t.msg4, time: "10:35" },
    { who: "doc", text: t.msg5, time: "10:36" },
  ]);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    setMessages([
      { who: "doc", text: t.msg1, time: "10:32" },
      { who: "me", text: t.msg2, time: "10:33" },
      { who: "doc", text: t.msg3, time: "10:34" },
      { who: "me", text: t.msg4, time: "10:35" },
      { who: "doc", text: t.msg5, time: "10:36" },
    ]);
  }, [t]);

  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { who: "me", text: input, time: "ahora" }]);
    setInput("");
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "#F4F6FA", fontFamily: "Inter, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #EEF1F5",
        padding: "56px 16px 12px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10,
          background: "transparent", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginLeft: -6,
        }}>
          <IconChevronLeft size={22} stroke="#0F172A" strokeWidth={2}/>
        </button>
        <div style={{ position: "relative" }}>
          <DoctorAvatar size={40}/>
          <div style={{
            position: "absolute", bottom: 0, right: 0,
            width: 11, height: 11, borderRadius: "50%",
            background: "#10B981", border: "2px solid #fff",
          }}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", letterSpacing: -0.2 }}>
            {t.chatTitle}
          </div>
          <div style={{ fontSize: 12, color: "#10B981", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }}/>
            {t.online}
          </div>
        </div>
        <button style={{
          width: 38, height: 38, borderRadius: 12,
          background: "#F1F5FB", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <IconPhone size={17} stroke="#3B82F6" strokeWidth={1.8}/>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: "auto", padding: "16px 14px",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{
          alignSelf: "center", fontSize: 11, color: "#9CA3AF",
          background: "#fff", padding: "4px 12px", borderRadius: 999,
          fontWeight: 500, letterSpacing: 0.2, marginBottom: 4,
        }}>{t.today} · 10:30</div>

        {messages.map((m, i) => {
          const isMe = m.who === "me";
          const prev = messages[i - 1];
          const grouped = prev && prev.who === m.who;
          return (
            <div key={i} style={{
              display: "flex", gap: 8,
              justifyContent: isMe ? "flex-end" : "flex-start",
              alignItems: "flex-end",
              marginTop: grouped ? -4 : 0,
            }}>
              {!isMe && (
                <div style={{ width: 28, visibility: grouped ? "hidden" : "visible" }}>
                  {!grouped && <DoctorAvatar size={28}/>}
                </div>
              )}
              <div style={{
                maxWidth: "75%",
                background: isMe ? "linear-gradient(135deg, #3B82F6, #2563EB)" : "#fff",
                color: isMe ? "#fff" : "#0F172A",
                padding: "10px 14px",
                borderRadius: 18,
                borderBottomRightRadius: isMe ? 4 : 18,
                borderBottomLeftRadius: !isMe ? 4 : 18,
                fontSize: 14, lineHeight: 1.4, letterSpacing: -0.1,
                boxShadow: isMe ? "0 1px 3px rgba(59,130,246,0.25)" : "0 1px 2px rgba(15,23,42,0.04)",
                border: isMe ? "none" : "1px solid #EEF1F5",
                textWrap: "pretty",
              }}>
                {m.text}
                <div style={{
                  fontSize: 10, marginTop: 4,
                  color: isMe ? "rgba(255,255,255,0.7)" : "#9CA3AF",
                  textAlign: "right", fontWeight: 500,
                  display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3,
                }}>
                  {m.time}
                  {isMe && <IconCheck size={11} stroke="rgba(255,255,255,0.8)" strokeWidth={2.5}/>}
                </div>
              </div>
            </div>
          );
        })}

        {typing && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginTop: 4 }}>
            <DoctorAvatar size={28}/>
            <div style={{
              background: "#fff", padding: "12px 14px",
              borderRadius: 18, borderBottomLeftRadius: 4,
              border: "1px solid #EEF1F5",
              display: "flex", gap: 4, alignItems: "center",
              boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: "50%", background: "#9CA3AF",
                  animation: `typingBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                }}/>
              ))}
            </div>
          </div>
        )}

        {typing && (
          <div style={{
            alignSelf: "flex-start", marginLeft: 44,
            fontSize: 11, color: "#9CA3AF", fontStyle: "italic",
            marginTop: -2,
          }}>
            Dra. García {t.typing}
          </div>
        )}
      </div>

      {/* Input bar */}
      <div style={{
        background: "#fff", borderTop: "1px solid #EEF1F5",
        padding: "10px 12px 26px",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <button style={{
          width: 38, height: 38, borderRadius: 12,
          background: "#F4F6FA", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <IconAttach size={18} stroke="#6B7280" strokeWidth={1.8}/>
        </button>
        <div style={{
          flex: 1, background: "#F4F6FA", borderRadius: 999,
          padding: "0 14px", height: 40,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder={t.messagePlaceholder}
            style={{
              flex: 1, border: "none", outline: "none", background: "transparent",
              fontSize: 14, color: "#0F172A", fontFamily: "inherit",
            }}
          />
          <IconMic size={18} stroke="#9CA3AF" strokeWidth={1.8}/>
        </div>
        <button onClick={send} style={{
          width: 40, height: 40, borderRadius: "50%",
          background: input.trim() ? "#3B82F6" : "#E5E7EB",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "background 0.2s",
          boxShadow: input.trim() ? "0 2px 6px rgba(59,130,246,0.3)" : "none",
        }}>
          <IconSend size={16} stroke="#fff" strokeWidth={2}/>
        </button>
      </div>
    </div>
  );
};

window.Chat = Chat;
