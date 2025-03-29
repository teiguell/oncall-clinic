import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n"; // Import i18n configuration

// Initialize WebSocket for notifications when the app loads
import { setupNotificationsSocket } from "./lib/notifications";

// Setup the notifications websocket when the app loads
window.addEventListener('load', () => {
  setupNotificationsSocket();
});

createRoot(document.getElementById("root")!).render(<App />);
