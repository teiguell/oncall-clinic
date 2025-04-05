import React, { useState, useEffect } from 'react';

// Componente simplificado que no depende de ningún otro componente o estado complejo
function SimpleApp() {
  const [apiStatus, setApiStatus] = useState<string>("No comprobado");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Un efecto simple para verificar el estado de la API
  useEffect(() => {
    checkApiStatus();
  }, []);
  
  // Función simple para verificar la API
  const checkApiStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setApiStatus(data.status === 'ok' ? 'Conectado' : 'Error');
    } catch (error) {
      setApiStatus('Error de conexión');
      console.error('Error al verificar la API:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#0070f3', marginBottom: '0.5rem' }}>OnCall Clinic</h1>
        <p style={{ color: '#666', margin: '0' }}>Aplicación Médica Simplificada</p>
      </header>
      
      <div style={{ 
        background: 'white', 
        borderRadius: '8px', 
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h2>Estado del Sistema</h2>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            background: apiStatus === 'Conectado' ? '#10b981' : apiStatus === 'No comprobado' ? '#f59e0b' : '#ef4444',
            marginRight: '0.5rem'
          }}></div>
          <div>API de servicios médicos: {isLoading ? 'Verificando...' : apiStatus}</div>
        </div>
        <button 
          onClick={checkApiStatus}
          disabled={isLoading}
          style={{
            background: '#0070f3',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isLoading ? 'Verificando...' : 'Verificar Estado'}
        </button>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1rem' 
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3>Diagnóstico</h3>
          <p>Esta es una versión simplificada de la aplicación para identificar problemas de renderizado.</p>
          <div style={{ marginTop: '1rem' }}>
            <a 
              href="/diagnostico" 
              style={{
                color: '#0070f3',
                textDecoration: 'none'
              }}
            >
              Ver Diagnóstico Completo →
            </a>
          </div>
        </div>
        
        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3>Enlaces Útiles</h3>
          <ul style={{ paddingLeft: '1.5rem', margin: '1rem 0' }}>
            <li><a href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>Aplicación Principal</a></li>
            <li><a href="/test-basic" style={{ color: '#0070f3', textDecoration: 'none' }}>Página Básica de Pruebas</a></li>
            <li><a href="/api/health" style={{ color: '#0070f3', textDecoration: 'none' }}>API de Estado</a></li>
          </ul>
        </div>
      </div>
      
      <footer style={{ 
        textAlign: 'center', 
        marginTop: '2rem', 
        paddingTop: '1rem', 
        borderTop: '1px solid #eaeaea',
        color: '#666',
        fontSize: '0.875rem'
      }}>
        © 2025 OnCall Clinic - Versión Alpha Simplificada
      </footer>
    </div>
  );
}

export default SimpleApp;