import React, { useState, useEffect } from "react";

function TestApp() {
  const [count, setCount] = useState(0);
  const [testMessage, setTestMessage] = useState("Cargando...");

  useEffect(() => {
    console.log("Componente montado correctamente");
    setTestMessage("React funciona correctamente");
    
    // Intentar una petición básica para verificar que la API está funcionando
    fetch('/api/health')
      .then(res => res.json())
      .catch(err => console.error('Error en petición de prueba:', err));
      
    return () => {
      console.log("Componente desmontado");
    };
  }, []);

  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      textAlign: 'center',
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#1D7EFC', fontSize: '2rem', marginBottom: '1rem' }}>
        OnCall Clinic - Aplicación de Prueba
      </h1>
      
      <div style={{ 
        background: '#f0f9ff', 
        padding: '1.5rem',
        borderRadius: '0.5rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Estado: {testMessage}</h2>
        <p style={{ marginBottom: '1rem' }}>Esta es una aplicación simple para verificar que React funciona correctamente.</p>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '1rem',
          margin: '2rem 0'
        }}>
          <button 
            onClick={() => setCount(c => c - 1)}
            style={{
              background: '#e0e0e0',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            -
          </button>
          
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {count}
          </span>
          
          <button 
            onClick={() => setCount(c => c + 1)}
            style={{
              background: '#1D7EFC',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            +
          </button>
        </div>
      </div>
      
      <button 
        onClick={() => console.log('Botón clickeado')}
        style={{
          background: '#10b981',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.25rem',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        Verificar Consola
      </button>
      
      <footer style={{ 
        marginTop: '3rem',
        color: '#6b7280',
        fontSize: '0.875rem'
      }}>
        &copy; 2025 OnCall Clinic - Versión de prueba
      </footer>
    </div>
  );
}

export default TestApp;