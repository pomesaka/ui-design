import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./materials.css";
import { Page } from "./page";

const root = document.getElementById("root");
if (!root) throw new Error("#root is missing");
createRoot(root).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
