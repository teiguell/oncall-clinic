function WorkingApp() {
  return (
    <div style={{ fontFamily: "system-ui", margin: 0, padding: 0 }}>
      {/* Navigation */}
      <nav style={{ 
        background: "white", 
        borderBottom: "1px solid #e5e7eb", 
        padding: "1rem 2rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <div style={{ 
          maxWidth: "1200px", 
          margin: "0 auto", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ 
              width: "32px", 
              height: "32px", 
              background: "#2563eb", 
              borderRadius: "50%", 
              marginRight: "12px" 
            }}></div>
            <span style={{ fontSize: "24px", fontWeight: "bold", color: "#111827" }}>
              OnCall Clinic
            </span>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button style={{
              background: "#2563eb",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500"
            }}>
              Encontrar Doctor
            </button>
            <button style={{
              background: "transparent",
              color: "#374151",
              padding: "8px 16px",
              border: "none",
              cursor: "pointer"
            }}>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", 
        color: "white", 
        padding: "5rem 2rem",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{ 
            fontSize: "3.5rem", 
            fontWeight: "bold", 
            marginBottom: "1.5rem",
            lineHeight: "1.1"
          }}>
            Atención médica a domicilio
          </h1>
          <p style={{ 
            fontSize: "1.25rem", 
            marginBottom: "2rem", 
            opacity: "0.9",
            maxWidth: "600px",
            margin: "0 auto 2rem"
          }}>
            Atención médica profesional cuando la necesites, en la comodidad de tu hogar
          </p>
          <button style={{
            background: "white",
            color: "#2563eb",
            padding: "12px 32px",
            border: "none",
            borderRadius: "8px",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}>
            Buscar Doctor Ahora
          </button>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{ padding: "4rem 2rem", background: "white" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ 
            fontSize: "2.5rem", 
            fontWeight: "bold", 
            textAlign: "center", 
            marginBottom: "3rem",
            color: "#111827"
          }}>
            ¿Por qué elegir OnCall Clinic?
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "2rem" 
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                width: "64px", 
                height: "64px", 
                background: "#dbeafe", 
                borderRadius: "50%", 
                margin: "0 auto 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <div style={{ 
                  width: "32px", 
                  height: "32px", 
                  background: "#2563eb", 
                  borderRadius: "4px" 
                }}></div>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                Respuesta Rápida
              </h3>
              <p style={{ color: "#6b7280" }}>
                Atención médica en casa en menos de 1 hora
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                width: "64px", 
                height: "64px", 
                background: "#dbeafe", 
                borderRadius: "50%", 
                margin: "0 auto 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <div style={{ 
                  width: "32px", 
                  height: "32px", 
                  background: "#2563eb", 
                  borderRadius: "4px" 
                }}></div>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                Pago Seguro
              </h3>
              <p style={{ color: "#6b7280" }}>
                Sistema de pago en línea seguro y confiable
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                width: "64px", 
                height: "64px", 
                background: "#dbeafe", 
                borderRadius: "50%", 
                margin: "0 auto 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <div style={{ 
                  width: "32px", 
                  height: "32px", 
                  background: "#2563eb", 
                  borderRadius: "4px" 
                }}></div>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                Seguimiento en Tiempo Real
              </h3>
              <p style={{ color: "#6b7280" }}>
                Rastrea la ubicación de tu doctor en tiempo real
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                width: "64px", 
                height: "64px", 
                background: "#dbeafe", 
                borderRadius: "50%", 
                margin: "0 auto 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <div style={{ 
                  width: "32px", 
                  height: "32px", 
                  background: "#2563eb", 
                  borderRadius: "4px" 
                }}></div>
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                Doctores Verificados
              </h3>
              <p style={{ color: "#6b7280" }}>
                Todos los doctores están verificados y licenciados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: "4rem 2rem", background: "#f9fafb" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ 
            fontSize: "2.5rem", 
            fontWeight: "bold", 
            textAlign: "center", 
            marginBottom: "3rem",
            color: "#111827"
          }}>
            ¿Cómo funciona?
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "2rem" 
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                width: "48px", 
                height: "48px", 
                background: "#2563eb", 
                color: "white", 
                borderRadius: "50%", 
                margin: "0 auto 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: "bold"
              }}>
                1
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                Buscar Doctor
              </h3>
              <p style={{ color: "#6b7280" }}>
                Busca doctores disponibles por especialidad
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                width: "48px", 
                height: "48px", 
                background: "#2563eb", 
                color: "white", 
                borderRadius: "50%", 
                margin: "0 auto 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: "bold"
              }}>
                2
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                Reservar Cita
              </h3>
              <p style={{ color: "#6b7280" }}>
                Selecciona un horario y proporciona tu dirección
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                width: "48px", 
                height: "48px", 
                background: "#2563eb", 
                color: "white", 
                borderRadius: "50%", 
                margin: "0 auto 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: "bold"
              }}>
                3
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                Doctor Llega
              </h3>
              <p style={{ color: "#6b7280" }}>
                El doctor llega a tu ubicación
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                width: "48px", 
                height: "48px", 
                background: "#2563eb", 
                color: "white", 
                borderRadius: "50%", 
                margin: "0 auto 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: "bold"
              }}>
                4
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>
                Recibir Tratamiento
              </h3>
              <p style={{ color: "#6b7280" }}>
                Recibe atención médica profesional
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Example */}
      <section style={{ padding: "4rem 2rem", background: "white" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ 
            fontSize: "2.5rem", 
            fontWeight: "bold", 
            textAlign: "center", 
            marginBottom: "3rem",
            color: "#111827"
          }}>
            Doctores Disponibles
          </h2>
          <div style={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            padding: "2rem",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{
                width: "64px",
                height: "64px",
                background: "#dbeafe",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <div style={{ 
                  width: "32px", 
                  height: "32px", 
                  background: "#2563eb", 
                  borderRadius: "4px" 
                }}></div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.25rem" }}>
                  Dr. María González
                </h3>
                <p style={{ color: "#6b7280", marginBottom: "0.5rem" }}>Medicina General</p>
                <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                  Título Médico, Universidad Nacional
                </p>
                <div style={{ display: "flex", alignItems: "center", marginTop: "0.5rem" }}>
                  <span style={{ color: "#fbbf24" }}>★★★★★</span>
                  <span style={{ marginLeft: "0.5rem", fontSize: "0.875rem", color: "#6b7280" }}>
                    4.8 calificación
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#111827" }}>$80</p>
                <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>por visita</p>
                <span style={{
                  display: "inline-block",
                  background: "#dcfce7",
                  color: "#166534",
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "9999px",
                  marginTop: "0.5rem"
                }}>
                  Disponible Ahora
                </span>
              </div>
            </div>
            <div style={{ paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
              <p style={{ color: "#374151", marginBottom: "1rem" }}>
                Médico general con amplia experiencia en atención médica domiciliaria
              </p>
              <button style={{
                background: "#2563eb",
                color: "white",
                padding: "0.75rem 1.5rem",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer"
              }}>
                Reservar Cita
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        background: "#111827", 
        color: "white", 
        padding: "2rem", 
        textAlign: "center" 
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
            <div style={{ 
              width: "32px", 
              height: "32px", 
              background: "#2563eb", 
              borderRadius: "50%", 
              marginRight: "12px" 
            }}></div>
            <span style={{ fontSize: "20px", fontWeight: "bold" }}>OnCall Clinic</span>
          </div>
          <p style={{ color: "#9ca3af" }}>
            Atención médica profesional a domicilio. Disponible las 24 horas.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default WorkingApp;