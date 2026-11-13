import environment from "./environment.module.css";
import frosted from "./frosted.module.css";
import lens from "./lens.module.css";
import paper from "./paper.module.css";
import press from "./press.module.css";
import raised from "./raised.module.css";

/**
 * - `lens`: clear glass floating over content; `lens-rimmed` for a lone control, `lens-inset` for the selected item inside a lens.
 * - `frosted`: glass that diffuses a busy backdrop (a map) behind a field.
 * - `ceramic`, `opal`, `paper-relief`: raised solids for a filled control.
 * - `paper`, `illuminated-paper`: the reading surface, lit faintly or fully.
 */
export type MaterialKind =
  | "lens"
  | "lens-rimmed"
  | "lens-inset"
  | "frosted"
  | "ceramic"
  | "opal"
  | "paper-relief"
  | "paper"
  | "illuminated-paper";

const classes: Record<MaterialKind, (string | undefined)[]> = {
  lens: [lens.surface],
  "lens-rimmed": [lens.surface, lens.rimmed],
  "lens-inset": [lens.inset],
  frosted: [frosted.frosted],
  ceramic: [raised.surface, raised.ceramic],
  opal: [raised.surface, raised.opal],
  "paper-relief": [raised.surface, raised.paper],
  paper: [paper.surface],
  "illuminated-paper": [paper.surface, paper.illuminated],
};

/** Frozen states for a specimen; a live control gets them from :hover and :active. */
export type MaterialPreview = "hover" | "pressed";

/**
 * Class of a material finish for one element. The element keeps its own shape
 * (size, radius, padding). Most finishes draw with ::before and ::after, so
 * put them on an element that does not draw its own.
 *
 * `press` adds the shared response of a control: the lit and shaded edges
 * swap as it sinks. It is meant for lens and the raised solids.
 */
export function materialClassName(kind: MaterialKind, { press: pressed = false, preview }: { press?: boolean; preview?: MaterialPreview } = {}): string {
  return [
    environment.material,
    ...classes[kind],
    pressed ? press.pressFeedback : undefined,
    preview === "hover" ? press.materialHover : undefined,
    preview === "pressed" ? press.materialPressed : undefined,
  ]
    .filter((name) => name !== undefined)
    .join(" ");
}
