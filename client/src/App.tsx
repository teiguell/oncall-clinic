import { useEffect, useState } from "react";

// Esta versión simplificada no depende de i18n o de otros contextos complejos
function App() {
  // Estado para verificar la API
  const [apiStatus, setApiStatus] = useState('Desconocido');
  const [isLoading, setIsLoading] = useState(false);
  
  // Verificar el estado de la API al cargar
  useEffect(() => {
    async function checkApi() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setApiStatus(data.status === 'ok' ? 'Operativo' : 'Con problemas');
      } catch (error) {
        console.error('Error al verificar la API:', error);
        setApiStatus('No disponible');
      } finally {
        setIsLoading(false);
      }
    }
    
    checkApi();
  }, []);
  
  // Versión simplificada para diagnóstico
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-700">
      <div className="text-center text-white p-8">
        <h1 className="text-4xl font-bold mb-4">OnCall Clinic</h1>
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
          <p className="text-lg mb-4">
            Estamos actualizando nuestra aplicación para servirte mejor.
          </p>
          
          <h2 className="text-2xl font-semibold mb-2">Estado del sitio:</h2>
          <div className="bg-amber-500/20 p-4 rounded-lg mb-4">
            <p>⚠️ Mantenimiento programado</p>
            <p>Por favor, vuelve más tarde.</p>
          </div>

          <div className="mt-4 p-4 bg-blue-700/30 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Información:</h3>
            <p>Fecha y hora: {new Date().toLocaleString()}</p>
            <p className="mt-2">Estado API: 
              <span className={`ml-2 font-semibold ${
                apiStatus === 'Operativo' ? 'text-green-300' : 
                apiStatus === 'Con problemas' ? 'text-yellow-300' : 
                'text-red-300'
              }`}>
                {isLoading ? 'Verificando...' : apiStatus}
              </span>
            </p>
          </div>
          
          <div className="mt-6">
            <a 
              href="/SimpleApp" 
              className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors mr-4"
            >
              Versión Básica
            </a>
            <a 
              href="/api/health" 
              className="inline-block bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors"
            >
              Estado API
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}



export default App;
