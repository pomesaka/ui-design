import { cn } from "./cn";

// Floating surfaces (select, menu, tooltip) share one elevation and motion so
// layered UI reads as one material. Motion is a short scale/fade from the
// trigger; reduced motion keeps only the end state.
export const floatingSurface = cn(
  "rounded-card border border-border bg-popover text-popover-foreground shadow-md outline-none",
  "origin-(--transform-origin) transition-[scale,opacity] duration-(--duration-expand) ease-standard motion-reduce:transition-none",
  "data-starting-style:scale-98 data-starting-style:opacity-0 data-ending-style:scale-98 data-ending-style:opacity-0",
);

// Items sit inside a p-1 popup; the radius subtracts that inset so corners stay concentric.
export const listItem = cn(
  "flex min-h-9 cursor-default select-none items-center gap-2 rounded-[calc(var(--radius-card)-var(--space-1))] px-2.5 py-1.5 font-control text-body outline-none",
  "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
  "data-disabled:cursor-not-allowed data-disabled:disabled-dim",
);
