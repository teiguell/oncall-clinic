import { createRoot } from "react-dom/client";
import TestApp from "./TestApp"; // Importamos la aplicación de prueba
import "./index.css";

// Sin proveedores para probar simplicidad

createRoot(document.getElementById("root")!).render(
  <TestApp />
);
