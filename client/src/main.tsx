import { createRoot } from "react-dom/client";
import React from "react";
import WorkingApp from "./WorkingApp";
import "./index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  const reactRoot = createRoot(rootElement);
  reactRoot.render(
    <React.StrictMode>
      <WorkingApp />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}
