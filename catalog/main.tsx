import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./catalog.css";
import { App } from "./app";

const root = document.getElementById("root");
if (!root) throw new Error("#root is missing");
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
