import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Toggle } from "../components/ui/toggle";
import { ToastProvider } from "../components/ui/toast";
import { TooltipProvider } from "../components/ui/tooltip";
import { Playground } from "./playground";
import { Specimens } from "./specimens";

// Every theme file is loaded and listed, so a new theme appears without edits here.
const themeFiles = import.meta.glob("../themes/*.css", { eager: true });
const themes = Object.keys(themeFiles)
  .map((path) => path.match(/\/([a-z0-9-]+)\.css$/)?.[1])
  .filter((name): name is string => name !== undefined)
  .sort();

/** Popups mount inside their theme panel so they read the same tokens. */
const PortalContext = createContext<HTMLElement | null>(null);
export const usePortal = () => useContext(PortalContext) ?? undefined;

function readView(): string {
  const requested = new URL(location.href).searchParams.get("theme");
  return requested !== null && themes.includes(requested) ? requested : "all";
}

export function App() {
  const [view, setView] = useState(readView);
  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set("theme", view);
    history.replaceState(null, "", url);
  }, [view]);
  const shown = view === "all" ? themes : [view];

  return (
    <TooltipProvider>
      <div className="mx-auto flex max-w-[110rem] flex-col gap-6 p-4 sm:p-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-heading">ui-design カタログ</h1>
            <p className="font-control text-caption text-reading-secondary">部品の状態を固定して並べ、末尾で実際に操作する</p>
          </div>
          <div role="group" aria-label="表示するテーマ" className="flex flex-wrap gap-2">
            {["all", ...themes].map((id) => (
              <Toggle key={id} size="sm" pressed={view === id} onPressedChange={() => setView(id)}>
                {id === "all" ? "並べて比較" : id}
              </Toggle>
            ))}
          </div>
        </header>
        <div className={shown.length > 1 ? "grid gap-6 min-[90rem]:grid-cols-2" : "mx-auto grid w-full max-w-[56rem]"}>
          {shown.map((theme) => (
            <ThemePanel key={theme} theme={theme}>
              <Specimens />
              <Playground theme={theme} />
            </ThemePanel>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

function ThemePanel({ theme, children }: { theme: string; children: ReactNode }) {
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  return (
    <section
      data-theme={theme}
      aria-labelledby={`${theme}-title`}
      className="flex min-w-0 flex-col gap-8 rounded-dialog border border-border bg-background p-4 text-foreground sm:p-6"
    >
      <h2 id={`${theme}-title`} className="font-heading text-heading">{theme}</h2>
      <PortalContext value={portal}>
        <ToastProvider container={portal ?? undefined}>{children}</ToastProvider>
      </PortalContext>
      <div ref={setPortal} />
    </section>
  );
}

/** A titled group of specimens. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-border pt-5">
      <h3 className="font-control text-action">{title}</h3>
      {children}
    </section>
  );
}
