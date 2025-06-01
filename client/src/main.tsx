import { createRoot } from "react-dom/client";
import React from "react";
import DirectApp from "./DirectApp";
import "./index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  const reactRoot = createRoot(rootElement);
  reactRoot.render(
    <React.StrictMode>
      <DirectApp />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}
