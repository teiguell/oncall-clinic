import { createRoot } from "react-dom/client";
import React from "react";
import SimpleApp from "./SimpleApp";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  const reactRoot = createRoot(rootElement);
  reactRoot.render(
    <React.StrictMode>
      <SimpleApp />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}
