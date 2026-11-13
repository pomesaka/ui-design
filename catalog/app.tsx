import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
// The themes of themes/, or of the project named by CATALOG_THEMES (vite.config.ts).
import { themes } from "virtual:project-themes";
import { Toggle } from "../components/ui/toggle";
import { AnnouncerProvider } from "../components/ui/announcer";
import { TooltipProvider } from "../components/ui/tooltip";
import { Foundations } from "./foundations";
import { Playground } from "./playground";
import { Specimens } from "./specimens";
import { TokenList, isColor, useAppliedTokens } from "./tokens";


/** Popups mount inside their theme panel so they read the same tokens. */
const PortalContext = createContext<HTMLElement | null>(null);
export const usePortal = () => useContext(PortalContext) ?? undefined;

const contents = [
  ["all", "すべて"],
  ["tokens", "token"],
  ["parts", "部品"],
] satisfies [string, string][];

function readParam(name: string, allowed: string[]): string {
  const requested = new URL(location.href).searchParams.get(name);
  return requested !== null && allowed.includes(requested) ? requested : "all";
}

export function App() {
  const [view, setView] = useState(() => readParam("theme", themes));
  const [show, setShow] = useState(() => readParam("show", contents.map(([id]) => id)));
  useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set("theme", view);
    url.searchParams.set("show", show);
    history.replaceState(null, "", url);
  }, [view, show]);
  const shown = view === "all" ? themes : [view];

  return (
    <AnnouncerProvider>
      <TooltipProvider>
        <div className="mx-auto flex max-w-[110rem] flex-col gap-6 p-4 sm:p-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-heading">ui-design カタログ</h1>
              <p className="font-control text-caption text-reading-secondary">tokenと部品の状態を固定して並べ、末尾で実際に操作する</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div role="group" aria-label="表示する内容" className="flex flex-wrap gap-2">
                {contents.map(([id, label]) => (
                  <Toggle key={id} size="sm" pressed={show === id} onPressedChange={() => setShow(id)}>
                    {label}
                  </Toggle>
                ))}
              </div>
              <div role="group" aria-label="表示するテーマ" className="flex flex-wrap gap-2">
                {["all", ...themes].map((id) => (
                  <Toggle key={id} size="sm" pressed={view === id} onPressedChange={() => setView(id)}>
                    {id === "all" ? "並べて比較" : id}
                  </Toggle>
                ))}
              </div>
            </div>
          </header>
          <div className={shown.length > 1 ? "grid gap-6 min-[90rem]:grid-cols-2" : "mx-auto grid w-full max-w-[56rem]"}>
            {shown.map((theme) => (
              <ThemePanel key={theme} theme={theme}>
                {show !== "parts" && <Foundations theme={theme} />}
                {show !== "tokens" && <Specimens />}
                {show !== "tokens" && <Playground theme={theme} />}
              </ThemePanel>
            ))}
          </div>
        </div>
      </TooltipProvider>
    </AnnouncerProvider>
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
      <PortalContext value={portal}>{children}</PortalContext>
      <div ref={setPortal} />
    </section>
  );
}

/**
 * A titled group of specimens. `legend` lists the tokens its specimens apply:
 * "all" of them, or the "other" ones when its rows already name their colors.
 */
export function Section({ title, legend, children }: { title: string; legend?: "all" | "other"; children: ReactNode }) {
  const [read, tokens] = useAppliedTokens();
  return (
    <section ref={read} className="flex flex-col gap-4 border-t border-border pt-6">
      <h3 className="font-control text-action">{title}</h3>
      {children}
      {legend && <TokenList tokens={legend === "all" ? tokens : tokens.filter((name) => !isColor(name))} />}
    </section>
  );
}
