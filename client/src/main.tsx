import { createRoot } from "react-dom/client";
import React from "react"; // Importación explícita de React
import App from "./App"; // Importamos la aplicación completa
import "./index.css"; // Importamos los estilos

console.log("Iniciando aplicación React completa...");

// Renderizado básico sin proveedores adicionales
const rootElement = document.getElementById("root");

// Verificación extra de que el elemento existe
if (rootElement) {
  console.log("Elemento root encontrado, intentando renderizar la aplicación completa");
  try {
    const reactRoot = createRoot(rootElement);
    reactRoot.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Aplicación completa renderizada correctamente");
  } catch (error) {
    console.error("Error al renderizar la aplicación completa:", error);
    // Fallback manual en caso de error
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1>OnCall Clinic</h1>
        <p>Lo sentimos, ha ocurrido un error al cargar la aplicación.</p>
        <p>Error: ${error instanceof Error ? error.message : 'Desconocido'}</p>
        <button onclick="window.location.reload()">Reintentar</button>
      </div>
    `;
  }
} else {
  console.error("No se encontró el elemento root");
  // Intentar insertar un nuevo div root en caso de que no exista
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  
  console.log("Elemento root creado, intentando renderizar la aplicación completa");
  try {
    const reactRoot = createRoot(newRoot);
    reactRoot.render(<App />);
    console.log("Aplicación completa renderizada en el nuevo elemento root");
  } catch (error) {
    console.error("Error al renderizar la aplicación completa en el nuevo elemento:", error);
  }
}
