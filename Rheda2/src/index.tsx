import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

if (import.meta.env.MODE === "development") {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  ReactDOM.hydrateRoot(
    document.getElementById("root") as HTMLElement,
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
