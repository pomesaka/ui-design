import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Button } from "../components/ui/button";
import { Toggle } from "../components/ui/toggle";
import { Section } from "./app";
import { TokenValue, contract, mapping } from "./tokens";

// A kind added to the contract still appears, under its own name, until it is drawn here.
const drawnKinds = new Set(["color", "font", "typography", "spacing", "shape", "interaction", "motion"]);
const sampleText = "予約を確定しました Aa 123";
// rem-based column width: fewer columns on narrow screens and at larger text.
const columns = "columns-[13rem] gap-6";
const entry = "mb-2 flex break-inside-avoid items-center gap-2";

function Name({ children }: { children: ReactNode }) {
  return <span className="min-w-0 wrap-anywhere font-control text-caption text-foreground">{children}</span>;
}

/** Every token of the contract, drawn with the surrounding theme's values. */
export function Foundations() {
  const rest = Object.entries(contract).filter(([kind]) => !drawnKinds.has(kind));
  return (
    <>
      <Section title="色">
        <Colors names={contract.color ?? []} />
      </Section>
      <Section title="文字">
        <TypeStyles />
        <Fonts names={contract.font ?? []} />
      </Section>
      <Section title="余白・寸法">
        <Lengths names={contract.spacing ?? []} />
      </Section>
      <Section title="形・影">
        <Shapes names={contract.shape ?? []} />
      </Section>
      <Section title="操作状態">
        <States names={contract.interaction ?? []} />
      </Section>
      <Section title="動き">
        <Motion names={contract.motion ?? []} />
      </Section>
      {rest.map(([kind, names]) => (
        <Section key={kind} title={kind}>
          <Values names={names} />
        </Section>
      ))}
    </>
  );
}

const sampled = "grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3";

/** A sample with the tokens it shows named under it. */
function Sampled({ names, children }: { names: string[]; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      {children}
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        {names.map((name) => (
          <span key={name} className="flex min-w-0 items-baseline gap-2">
            <Name>{name}</Name>
            <TokenValue name={name} />
          </span>
        ))}
      </div>
    </div>
  );
}

// The real button in the state each token shapes, beside its resting state where the difference is a comparison.
const stateSamples: [string[], ReactNode][] = [
  [["disabled-opacity"], <><Button>保存</Button><Button disabled>保存</Button></>],
  [["press-depth"], <><Button>保存</Button><Button data-preview-state="pressed">保存</Button></>],
  [["focus-outline-width", "focus-outline-offset"], <Button data-preview-state="focus">保存</Button>],
];

function States({ names }: { names: string[] }) {
  const samples = stateSamples
    .map(([tokens, sample]) => [tokens.filter((token) => names.includes(token)), sample] satisfies [string[], ReactNode])
    .filter(([tokens]) => tokens.length > 0);
  const drawn = new Set(samples.flatMap(([tokens]) => tokens));
  return (
    <>
      <div className={sampled}>
        {samples.map(([tokens, sample]) => (
          <Sampled key={tokens[0]} names={tokens}>
            <div inert className="pointer-events-none flex items-start gap-3 p-1 [&_*]:transition-none">
              {sample}
            </div>
          </Sampled>
        ))}
      </div>
      <Values names={names.filter((name) => !drawn.has(name))} />
    </>
  );
}

// Long enough for the slowest duration to finish and rest before it turns back.
const motionInterval = 1200;

function Motion({ names }: { names: string[] }) {
  const [moved, setMoved] = useState(false);
  const [repeating, setRepeating] = useState(true);
  useEffect(() => {
    if (!repeating) return;
    const timer = setInterval(() => setMoved((now) => !now), motionInterval);
    return () => clearInterval(timer);
  }, [repeating]);
  const durations = names.filter((name) => name.startsWith("duration-"));
  const eases = names.filter((name) => name.startsWith("ease-"));
  return (
    <>
      <Toggle size="sm" className="self-start" pressed={repeating} onPressedChange={setRepeating}>
        繰り返す
      </Toggle>
      <div className={sampled}>
        {durations.map((name) => (
          <Sampled key={name} names={[name]}>
            <span className="flex h-3 overflow-hidden rounded-full border border-border">
              <span
                className={`w-full origin-left bg-primary transition-[scale] motion-reduce:transition-none ${moved ? "scale-x-100" : "scale-x-0"}`}
                style={{ transitionDuration: `var(--${name})`, transitionTimingFunction: "var(--ease-standard)" }}
              />
            </span>
          </Sampled>
        ))}
        {eases.map((name) => (
          <Sampled key={name} names={[name]}>
            <EaseCurve name={name} />
          </Sampled>
        ))}
      </div>
      <Values names={names.filter((name) => !durations.includes(name) && !eases.includes(name))} />
    </>
  );
}

const curveSteps = 24;

/** Progress over time of an easing, sampled from the browser so any easing value draws. */
function EaseCurve({ name }: { name: string }) {
  const [points, setPoints] = useState("");
  const read = useCallback(
    (element: SVGSVGElement | null) => {
      if (!element) return;
      const easing = getComputedStyle(element).getPropertyValue(`--${name}`).trim();
      try {
        // text-indent has no effect on an svg and is not clamped, so an overshooting easing keeps its shape.
        const probe = element.animate({ textIndent: ["0px", "100px"] }, { duration: curveSteps, easing, fill: "both" });
        probe.pause();
        const samples = Array.from({ length: curveSteps + 1 }, (_, step) => {
          probe.currentTime = step;
          return `${(step * 100) / curveSteps},${100 - Number.parseFloat(getComputedStyle(element).textIndent)}`;
        });
        probe.cancel();
        setPoints(samples.join(" "));
      } catch {
        // A value the browser does not accept as an easing draws no curve; its text still shows.
      }
    },
    [name],
  );
  return (
    <svg ref={read} aria-hidden viewBox="0 0 100 100" className="size-12 overflow-visible border border-border text-primary">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

type ColorRole = "surface" | "text" | "line" | "ring";

// The contract names a color by how it is used (tokens/README.md), so the
// sample is drawn from the name: text as text, a border as a line.
function roleOf(name: string): ColorRole {
  if (name === "foreground" || name.endsWith("-foreground") || name === "reading-secondary") return "text";
  if (name.endsWith("ring")) return "ring";
  if (name === "input" || name.endsWith("border")) return "line";
  return "surface";
}

const familyOf = (name: string) => name.split("-")[0] ?? name;

/** The surface a text or line color sits on: its pair, else its family's surface, else the page. */
function surfaceUnder(name: string, all: ReadonlySet<string>): string {
  const family = familyOf(name);
  const candidates = [name.replace(/-foreground$/, ""), `${family}-surface`, family];
  return candidates.find((candidate) => candidate !== name && all.has(candidate)) ?? "background";
}

function sampleStyle(name: string, all: ReadonlySet<string>): CSSProperties {
  const color = `var(--${name})`;
  const under = `var(--${surfaceUnder(name, all)})`;
  switch (roleOf(name)) {
    case "surface":
      return { background: color };
    case "text":
      return { background: under, color };
    case "line":
      return { background: under, borderColor: color, borderWidth: "var(--focus-outline-width)" };
    case "ring":
      return { background: under, outline: `var(--focus-outline-width) solid ${color}`, outlineOffset: "calc(var(--focus-outline-width) * -2)" };
  }
}

function Colors({ names }: { names: string[] }) {
  const all = new Set(names);
  const families = new Map<string, string[]>();
  for (const name of names) families.set(familyOf(name), [...(families.get(familyOf(name)) ?? []), name]);
  // Colors that share a first word are one role and its states; the rest are the page basics.
  const groups = [
    [...families.values()].filter((family) => family.length === 1).flat(),
    ...[...families.values()].filter((family) => family.length > 1),
  ];
  return (
    <div className={columns}>
      {groups.map((group) => (
        <ul key={group[0]} className="m-0 mb-4 list-none break-inside-avoid p-0">
          {group.map((name) => (
            <li key={name} className={entry}>
              <span
                aria-hidden
                className="flex h-6 w-8 shrink-0 items-center justify-center rounded-field border border-border font-control text-caption"
                style={sampleStyle(name, all)}
              >
                {roleOf(name) === "text" && "Aa"}
              </span>
              <Name>{name}</Name>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

function TypeStyles() {
  return (
    <div className="grid gap-x-6 gap-y-3 lg:grid-cols-2">
      {[...(mapping.get("text") ?? [])].map(([key, tokens]) => {
        const lineHeight = tokens.find((token) => token.endsWith("-line-height"));
        const weight = tokens.find((token) => token.startsWith("weight-"));
        return (
          <div key={key} className="flex min-w-0 flex-col gap-1">
            <p
              className="m-0"
              style={{
                fontSize: `var(--text-${key})`,
                lineHeight: lineHeight && `var(--${lineHeight})`,
                fontWeight: weight && `var(--${weight})`,
              }}
            >
              {sampleText}
            </p>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <Name>text-{key}</Name>
              {tokens.map((token) => (
                <TokenValue key={token} name={token} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Fonts({ names }: { names: string[] }) {
  return (
    <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
      {names.map((name) => (
        <div key={name} className="flex min-w-0 flex-col gap-1">
          <span style={{ fontFamily: `var(--${name})` }}>{sampleText}</span>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <Name>{name}</Name>
            <TokenValue name={name} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Lengths({ names }: { names: string[] }) {
  return (
    <ul className={`m-0 list-none p-0 ${columns}`}>
      {names.map((name) => (
        <li key={name} className={entry}>
          {/* The slot is as wide as the longest step, so names line up. */}
          <span aria-hidden className="flex w-12 shrink-0">
            <span className="h-3 bg-primary" style={{ width: `var(--${name})` }} />
          </span>
          <Name>{name}</Name>
          <TokenValue name={name} />
        </li>
      ))}
    </ul>
  );
}

function Shapes({ names }: { names: string[] }) {
  return (
    <ul className={`m-0 list-none p-0 ${columns}`}>
      {names.map((name) => {
        const shadow = name.startsWith("shadow");
        return (
          <li key={name} className={`${entry} py-1`}>
            <span
              aria-hidden
              className="h-8 w-12 shrink-0 border border-border bg-card"
              style={shadow ? { boxShadow: `var(--${name})`, borderRadius: "var(--radius-field)" } : { borderRadius: `var(--${name})` }}
            />
            <Name>{name}</Name>
            {!shadow && <TokenValue name={name} />}
          </li>
        );
      })}
    </ul>
  );
}

function Values({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  return (
    <dl className={`m-0 ${columns}`}>
      {names.map((name) => (
        <div key={name} className={`${entry} flex-wrap`}>
          <dt className="flex">
            <Name>{name}</Name>
          </dt>
          <dd className="m-0 flex">
            <TokenValue name={name} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
