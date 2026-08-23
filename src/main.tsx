import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Auto cache & storage clearing system to prevent password protection bypass
if (typeof window !== "undefined") {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
  if ("caches" in window) {
    caches.keys().then((names) => {
      for (const name of names) {
        caches.delete(name);
      }
    });
  }
  try {
    sessionStorage.clear();
    localStorage.clear();
  } catch (e) {
    // Ignore storage access errors
  }
}

createRoot(document.getElementById("root")!).render(<App />);
