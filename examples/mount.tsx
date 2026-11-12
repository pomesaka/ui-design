import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./app.css";
import { AnnouncerProvider } from "../components/ui/announcer";

// Theme names come from the theme files, so a new theme works in every example.
const themes = Object.keys(import.meta.glob("../themes/*.css"))
  .map((path) => path.match(/\/([a-z0-9-]+)\.css$/)?.[1])
  .filter((name): name is string => name !== undefined);

/** URL parameters of an example. `theme` is shared; the rest are listed in each example's README. */
export const params = new URLSearchParams(location.search);

/**
 * Render an example the way an adopting app would: one theme on <html>
 * (`?theme=<name>`, default from index.html) and providers at the root.
 */
export function mountExample(page: ReactNode) {
  const theme = params.get("theme");
  if (theme !== null && themes.includes(theme)) document.documentElement.dataset.theme = theme;
  const root = document.getElementById("root");
  if (!root) throw new Error("#root is missing");
  createRoot(root).render(
    <StrictMode>
      <AnnouncerProvider>{page}</AnnouncerProvider>
    </StrictMode>,
  );
}
