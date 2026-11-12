import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../app.css";
import { AnnouncerProvider } from "../../components/ui/announcer";
import { readScenario } from "./data";
import { MembersPage } from "./members-page";

// `?theme=luma-dark` switches the theme; other parameters pick the scenario (see README).
const theme = new URLSearchParams(location.search).get("theme");
if (theme === "luma-light" || theme === "luma-dark") document.documentElement.dataset.theme = theme;

const root = document.getElementById("root");
if (!root) throw new Error("#root is missing");
createRoot(root).render(
  <StrictMode>
    <AnnouncerProvider>
      <MembersPage scenario={readScenario(location.search)} />
    </AnnouncerProvider>
  </StrictMode>,
);
