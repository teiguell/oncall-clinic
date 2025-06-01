import { useState, useEffect } from "react";

export default function WorkingApp() {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState("Cala de Bou, Ibiza");

  const searchDoctors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/doctors?lat=38.9532&lng=1.2989&distance=50&verified=true');
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    searchDoctors();
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f0f8ff', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '48px', color: '#1e40af', margin: '0 0 16px 0' }}>OnCall Clinic</h1>
          <p style={{ fontSize: '20px', color: '#6b7280', margin: '0' }}>Médicos profesionales a domicilio en España</p>
        </header>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#374151' }}>Buscar Médicos Disponibles</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ 
                flex: 1, 
                padding: '12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px',
                fontSize: '16px'
              }}
              placeholder="Ubicación"
            />
            <button
              onClick={searchDoctors}
              disabled={isLoading}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              {isLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          {doctors.length > 0 ? doctors.map((doctor: any, index) => (
            <div key={index} style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '24px', margin: '0 0 8px 0', color: '#1f2937' }}>{doctor.name}</h3>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '16px' }}>{doctor.specialty}</p>
                  <p style={{ margin: '0 0 4px 0', color: '#9ca3af', fontSize: '14px' }}>Licencia: {doctor.licenseNumber}</p>
                  <p style={{ margin: '0', color: '#2563eb', fontSize: '14px' }}>Distancia: {doctor.distance}km</p>
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
                    €{doctor.hourlyRate}/hora
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
          )) : (
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '24px', 
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
            }}>
              <p style={{ color: '#6b7280', fontSize: '16px', margin: '0' }}>
                {isLoading ? 'Buscando médicos disponibles...' : 'No se encontraron médicos en esta área'}
              </p>
            </div>
          )}
        </div>

        {/* Enlaces rápidos */}
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

        {/* Botón de administración */}
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