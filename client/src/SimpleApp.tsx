import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

// Página principal simplificada
function HomePage() {
  const [doctors, setDoctors] = useState([]);
  const [searchLocation, setSearchLocation] = useState("Ibiza, Cala de Bou");
  const [isLoading, setIsLoading] = useState(false);

  const searchDoctors = async () => {
    setIsLoading(true);
    try {
      // Coordenadas de Cala de Bou, Ibiza
      const response = await fetch('/api/doctors?lat=38.9532&lng=1.2989&distance=50&verified=true');
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error('Error buscando médicos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    searchDoctors();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">OnCall Clinic</h1>
          <p className="text-xl text-gray-700 mb-8">Médicos profesionales a domicilio</p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Buscar Médicos Disponibles</h2>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Ubicación"
              />
              <button
                onClick={searchDoctors}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {doctors.length > 0 ? (
              doctors.map((doctor: any, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{doctor.name}</h3>
                      <p className="text-gray-600">{doctor.specialty}</p>
                      <p className="text-sm text-gray-500">Licencia: {doctor.licenseNumber}</p>
                      <p className="text-sm text-blue-600">Distancia: {doctor.distance}km</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Disponible 24/7
                      </span>
                      <p className="text-lg font-bold mt-2">€{doctor.hourlyRate}/hora</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Reservar Cita
                    </button>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                      Ver Perfil
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600">
                  {isLoading ? 'Buscando médicos disponibles...' : 'No se encontraron médicos en esta área'}
                </p>
              </div>
            )}
          </div>

          {/* Botón de acceso administrativo */}
          <div className="fixed bottom-4 right-4">
            <button
              onClick={() => {
                const password = prompt('Contraseña de administrador:');
                if (password === 'Pepillo2727#') {
                  window.location.href = '/admin';
                } else if (password) {
                  alert('Contraseña incorrecta');
                }
              }}
              className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
            >
              🛡️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Login de médicos
function DoctorLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });
      
      if (response.ok) {
        window.location.href = '/doctor-dashboard';
      } else {
        alert('Error en el login');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Login Médicos</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="doctortest@oncall.clinic"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="pepe"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Iniciar Sesión
          </button>
        </form>
        <div className="mt-4 text-center">
          <a href="/" className="text-blue-600 hover:underline">Volver al inicio</a>
        </div>
      </div>
    </div>
  );
}

export default function SimpleApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/doctor-login" component={DoctorLogin} />
          <Route>
            <div className="text-center p-8">
              <h1>Página no encontrada</h1>
              <a href="/" className="text-blue-600 hover:underline">Volver al inicio</a>
            </div>
          </Route>
        </Switch>
      </Router>
    </QueryClientProvider>
  );
}