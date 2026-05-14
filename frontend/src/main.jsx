
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import NotificationManager from "./services/NotificationManager";

// Global error handlers for debugging "blank interface" issues
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global Error Caught:", { message, source, lineno, colno, error });
  return false;
};

window.onunhandledrejection = function(event) {
  console.error("Unhandled Promise Rejection:", event.reason);
};

console.log("COP Ayikai Doblo: Initializing application...");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("COP Ayikai Doblo Error: Root element not found!");
} else {
  console.log("COP Ayikai Doblo: Root element found, rendering app...");
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
}

// Register Service Worker for PWA installability and background notifications
console.log("COP Ayikai Doblo: Registering Service Worker...");
NotificationManager.registerServiceWorker();
