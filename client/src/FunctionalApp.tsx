function FunctionalApp() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f0f8ff', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '48px', color: '#1e40af', margin: '0 0 16px 0' }}>OnCall Clinic</h1>
          <p style={{ fontSize: '20px', color: '#6b7280', margin: '0' }}>Médicos profesionales a domicilio en España</p>
        </header>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#374151' }}>Dr Test - Médico Disponible</h2>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '24px', margin: '0 0 8px 0', color: '#1f2937' }}>Dr. Test Alpha</h3>
                <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '16px' }}>Medicina General</p>
                <p style={{ margin: '0 0 4px 0', color: '#9ca3af', fontSize: '14px' }}>Licencia: MD-ALPHA-TEST</p>
                <p style={{ margin: '0', color: '#2563eb', fontSize: '14px' }}>Distancia: 0.1km - Cala de Bou, Ibiza</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '4px 12px', 
                  backgroundColor: '#dcfce7', 
                  color: '#166534', 
                  borderRadius: '20px', 
                  fontSize: '14px' 
                }}>
                  Disponible 24/7
                </span>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#1f2937' }}>
                  €60/hora
                </p>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <button style={{ 
                padding: '8px 16px', 
                backgroundColor: '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                Reservar Cita
              </button>
              <button style={{ 
                padding: '8px 16px', 
                backgroundColor: '#f3f4f6', 
                color: '#374151', 
                border: 'none', 
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                Ver Perfil
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <a 
            href="/doctor-login" 
            style={{ 
              display: 'inline-block',
              margin: '0 12px',
              padding: '12px 24px',
              backgroundColor: '#059669',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          >
            Login Médicos
          </a>
          <a 
            href="/legal/privacy-policy-es" 
            style={{ 
              margin: '0 12px',
              color: '#6b7280',
              textDecoration: 'none'
            }}
          >
            Política de Privacidad
          </a>
          <a 
            href="/legal/terms-of-use-es" 
            style={{ 
              margin: '0 12px',
              color: '#6b7280',
              textDecoration: 'none'
            }}
          >
            Términos de Uso
          </a>
        </div>

        <div style={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '20px' 
        }}>
          <button
            onClick={() => {
              const password = prompt('Contraseña de administrador:');
              if (password === 'Pepillo2727#') {
                window.location.href = '/admin';
              } else if (password) {
                alert('Contraseña incorrecta');
              }
            }}
            style={{ 
              width: '50px', 
              height: '50px', 
              backgroundColor: 'white', 
              border: '2px solid #e5e7eb', 
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          >
            🛡️
          </button>
        </div>
      </div>
    </div>
  );
}

export default FunctionalApp;