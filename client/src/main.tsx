import { createRoot } from "react-dom/client";
import React from "react"; // Importación explícita de React
import TestApp from "./TestApp"; // Importamos la aplicación de prueba
import "./index.css";

// Renderizado básico sin proveedores adicionales
const root = document.getElementById("root");

// Verificación extra de que el elemento existe
if (root) {
  try {
    const reactRoot = createRoot(root);
    reactRoot.render(
      <React.StrictMode>
        <TestApp />
      </React.StrictMode>
    );
    console.log("React renderizado correctamente");
  } catch (error) {
    console.error("Error al renderizar React:", error);
    // Fallback manual en caso de error
    root.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1>OnCall Clinic</h1>
        <p>Lo sentimos, ha ocurrido un error al cargar la aplicación.</p>
        <button onclick="window.location.reload()">Reintentar</button>
      </div>
    `;
  }
} else {
  console.error("No se encontró el elemento root");
}
