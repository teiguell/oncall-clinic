import React from "react";

function TestApp() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-primary text-white p-4">
        <h1 className="text-2xl font-bold">OnCall Clinic - Test App</h1>
      </header>
      
      <main className="flex-grow p-4">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Aplicación de prueba</h2>
          <p className="mb-4">Esta es una página básica para verificar que la aplicación React pueda renderizarse correctamente.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-medium mb-2">Para pacientes</h3>
              <p>Encuentre médicos disponibles para visitas a domicilio.</p>
              <button className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
                Buscar médicos
              </button>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-medium mb-2">Para médicos</h3>
              <p>Registre sus servicios y encuentre nuevos pacientes.</p>
              <button className="mt-4 border border-primary text-primary px-4 py-2 rounded-md hover:bg-primary hover:text-white">
                Registrarse como médico
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; 2025 OnCall Clinic - Versión de prueba</p>
      </footer>
    </div>
  );
}

export default TestApp;