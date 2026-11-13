import { useCallback, useId, useState, type ReactNode } from "react";
import forest from "./assets/window-light-forest.jpg";
import { materialClassName, type MaterialKind } from "./luma/material";
import { PhotoAfterlight } from "./luma/photo-afterlight";
import { useSurfaceLighting, type ScreenLight } from "./luma/use-surface-lighting";

// Every theme file is loaded and listed, so a material is seen under each theme.
const themeFiles = import.meta.glob("../themes/*.css", { eager: true });
const themes = Object.keys(themeFiles)
  .map((path) => path.match(/\/([a-z0-9-]+)\.css$/)?.[1])
  .filter((name): name is string => name !== undefined)
  .sort();

// The fixed light of the materials: upper left, a third of the way out of the screen.
const restingAngle = 315;
const elevation = Math.asin(1 / Math.sqrt(3));

function lightAt(angle: number, strength: number): ScreenLight {
  const turn = (angle * Math.PI) / 180;
  return {
    direction: { x: Math.cos(elevation) * Math.sin(turn), y: Math.cos(elevation) * Math.cos(turn), z: Math.sin(elevation) },
    strength,
  };
}

export function Page() {
  const [angle, setAngle] = useState(restingAngle);
  const [strength, setStrength] = useState(1);
  const [stage, setStage] = useState<HTMLElement | null>(null);
  // The light is set once on the page; every material below inherits it.
  useSurfaceLighting(stage, lightAt(angle, strength));

  return (
    <div ref={setStage} className="mx-auto flex max-w-[110rem] flex-col gap-8 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-heading text-heading">材質</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Range label="光の向き" min={0} max={360} step={5} value={angle} onChange={setAngle} />
          <Range label="光の強さ" min={0} max={1} step={0.05} value={strength} onChange={setStrength} />
        </div>
      </header>
      <Group title="レンズ" backdrops={["flat", "photo"]}>
        <div className={`${materialClassName("lens")} flex gap-1 rounded-full p-1`}>
          {["地図", "記録", "設定"].map((item, index) => (
            <span key={item} className={`${index === 0 ? materialClassName("lens-inset") : ""} rounded-full px-4 py-2`}>
              {item}
            </span>
          ))}
        </div>
        <Control kind="lens-rimmed">投稿</Control>
      </Group>
      <Group title="セラミック・乳白ガラス・紙のレリーフ" backdrops={["flat", "photo"]}>
        <Control kind="ceramic">セラミック</Control>
        <Control kind="opal">乳白ガラス</Control>
        <Control kind="paper-relief">紙のレリーフ</Control>
      </Group>
      <Group title="すりガラス" backdrops={["flat", "photo"]}>
        <span className={`${materialClassName("frosted")} rounded-full px-6 py-3`}>投稿を検索</span>
      </Group>
      <Group title="紙・照らされた紙" backdrops={["flat"]}>
        {(["paper", "illuminated-paper"] satisfies MaterialKind[]).map((kind) => (
          <p key={kind} className={`${materialClassName(kind)} m-0 max-w-[16rem] rounded-card p-4 font-body text-body`}>
            木陰で、ひと休み。川沿いの道は午後になると風が通ります。
          </p>
        ))}
      </Group>
      <Group title="写真の余光" backdrops={["flat"]}>
        {[false, true].map((enabled) => (
          <PhotoAfterlight key={String(enabled)} className="w-[14rem]" src={forest} alt="木漏れ日が差す、緑の木々。" enabled={enabled} />
        ))}
      </Group>
      <p className="font-control text-caption text-reading-secondary">
        見本写真 <a className="underline" href="https://unsplash.com/photos/green-and-brown-trees-during-daytime-ZSsoiZf10jM" target="_blank" rel="noreferrer">César Couto / Unsplash</a>
      </p>
    </div>
  );
}

function Range({ label, value, onChange, ...range }: { label: string; min: number; max: number; step: number; value: number; onChange: (value: number) => void }) {
  const id = useId();
  return (
    <div className="flex items-center gap-2 font-control text-caption">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="range" {...range} value={value} onChange={(event) => onChange(event.target.valueAsNumber)} className="accent-primary" />
    </div>
  );
}

type BackdropKind = "flat" | "photo";

/** One material family under every theme, over the backdrops it is meant for. */
function Group({ title, backdrops, children }: { title: string; backdrops: BackdropKind[]; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <h2 id={id} className="font-control text-action">{title}</h2>
      <div className="grid gap-6 lg:grid-cols-3">
        {themes.map((theme) => (
          <ThemePanel key={theme} theme={theme}>
            {backdrops.map((backdrop) => (
              <Backdrop key={backdrop} kind={backdrop}>{children}</Backdrop>
            ))}
          </ThemePanel>
        ))}
      </div>
    </section>
  );
}

function ThemePanel({ theme, children }: { theme: string; children: ReactNode }) {
  // The raised solids need more relief on a dark page (luma/environment.module.css); the theme's color-scheme tells which it is.
  const read = useCallback((element: HTMLElement | null) => {
    if (element && getComputedStyle(element).colorScheme === "dark") element.style.setProperty("--material-relief", "1");
  }, []);
  return (
    <div
      ref={read}
      data-theme={theme}
      className="flex min-w-0 flex-col gap-3 rounded-dialog border border-border bg-background p-4 text-foreground"
    >
      <h3 className="font-control text-caption text-reading-secondary">{theme}</h3>
      {children}
    </div>
  );
}

/** A material is judged over a flat color and over a photo: the rim must carry the first, the blur the second. */
function Backdrop({ kind, children }: { kind: BackdropKind; children: ReactNode }) {
  return (
    <div
      className="relative flex min-h-[10rem] flex-wrap items-center justify-center gap-3 overflow-hidden rounded-drawer bg-background p-4 font-control text-action"
      // A clear material has no fill, so text over it takes its contrast from what lies behind, not from the theme. This photo is dark under every theme.
      style={kind === "photo" ? { color: "white" } : undefined}
    >
      {kind === "photo" && <img src={forest} alt="" className="absolute inset-0 size-full object-cover" />}
      {children}
    </div>
  );
}

/** A pressable specimen: the material's own press response is part of what is shown. */
function Control({ kind, children }: { kind: MaterialKind; children: ReactNode }) {
  return (
    <button type="button" className={`${materialClassName(kind, { press: true })} cursor-pointer rounded-full px-4 py-3 outline-none focus-visible:focus-ring`}>
      {children}
    </button>
  );
}
