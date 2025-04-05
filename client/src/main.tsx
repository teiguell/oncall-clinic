import { createRoot } from "react-dom/client";
import React from "react"; // Importación explícita de React
import App from "./App"; // Importamos la aplicación completa
import SimpleApp from "./SimpleApp"; // Aplicación simplificada para solución de problemas
import "./index.css"; // Importamos los estilos

console.log("Iniciando aplicación React...");

// Determinar qué aplicación cargar basado en la URL
const isSimpleApp = window.location.pathname === '/SimpleApp';
const AppComponent = isSimpleApp ? SimpleApp : App;

console.log(`Cargando ${isSimpleApp ? 'SimpleApp' : 'App'} basado en la URL actual: ${window.location.pathname}`);

// Renderizado básico sin proveedores adicionales
const rootElement = document.getElementById("root");

// Verificación extra de que el elemento existe
if (rootElement) {
  console.log("Elemento root encontrado, intentando renderizar la aplicación");
  try {
    const reactRoot = createRoot(rootElement);
    reactRoot.render(
      <React.StrictMode>
        <AppComponent />
      </React.StrictMode>
    );
    console.log(`${isSimpleApp ? 'SimpleApp' : 'App'} renderizada correctamente`);
  } catch (error) {
    console.error(`Error al renderizar ${isSimpleApp ? 'SimpleApp' : 'App'}:`, error);
    // Fallback manual en caso de error
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1>OnCall Clinic</h1>
        <p>Lo sentimos, ha ocurrido un error al cargar la aplicación.</p>
        <p>Error: ${error instanceof Error ? error.message : 'Desconocido'}</p>
        <div style="margin-top: 20px;">
          <button onclick="window.location.reload()" style="padding: 8px 16px; margin-right: 10px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer;">Reintentar</button>
          ${!isSimpleApp ? '<a href="/SimpleApp" style="padding: 8px 16px; background: #eaeaea; color: #333; text-decoration: none; border-radius: 4px;">Versión Simplificada</a>' : '<a href="/" style="padding: 8px 16px; background: #eaeaea; color: #333; text-decoration: none; border-radius: 4px;">Página Principal</a>'}
          <a href="/diagnostico" style="display: block; margin-top: 10px; color: #0070f3;">Ver Diagnóstico</a>
        </div>
      </div>
    `;
  }
} else {
  console.error("No se encontró el elemento root");
  // Intentar insertar un nuevo div root en caso de que no exista
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  
  console.log("Elemento root creado, intentando renderizar la aplicación");
  try {
    const reactRoot = createRoot(newRoot);
    reactRoot.render(<AppComponent />);
    console.log(`${isSimpleApp ? 'SimpleApp' : 'App'} renderizada en el nuevo elemento root`);
  } catch (error) {
    console.error(`Error al renderizar ${isSimpleApp ? 'SimpleApp' : 'App'} en el nuevo elemento:`, error);
    
    // Si la renderización falla, mostrar error y enlaces alternativos
    newRoot.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1>OnCall Clinic</h1>
        <p>Lo sentimos, ha ocurrido un error al cargar la aplicación.</p>
        <p>Error: ${error instanceof Error ? error.message : 'Desconocido'}</p>
        <div style="margin-top: 20px;">
          <a href="/diagnostico" style="padding: 8px 16px; background: #0070f3; color: white; text-decoration: none; border-radius: 4px; margin-right: 10px;">Página de Diagnóstico</a>
          <a href="/test-basic" style="padding: 8px 16px; background: #eaeaea; color: #333; text-decoration: none; border-radius: 4px;">Página Básica</a>
        </div>
      </div>
    `;
  }
}
