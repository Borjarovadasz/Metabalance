import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import { apiFetch } from "./api";

const reportError = (() => {
  let last = 0;
  return async (payload) => {
    const now = Date.now();
    if (now - last < 2000) return;
    last = now;
    try {
      await apiFetch("/api/errors", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    } catch {
      // ignore
    }
  };
})();

const sendClientError = (message, stack) => {
  reportError({
    message,
    stack,
    url: window.location.href
  });
};

window.addEventListener("error", (event) => {
  sendClientError(event.message, event.error?.stack);
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  sendClientError(reason?.message || "Unhandled promise rejection", reason?.stack);
});

// manual test from console: window.reportTestError()
window.reportTestError = () => {
  sendClientError("Teszt hiba", "");
};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
