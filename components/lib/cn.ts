import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge must know the token-based scales; otherwise it would treat
// `text-caption` (size) and `text-primary` (color) as the same group.
const merge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["body", "detail", "reading", "caption", "action", "heading", "section"],
      radius: ["field", "card", "dialog", "drawer", "full"],
      shadow: ["sm", "md", "lg"],
      font: ["sans", "serif", "mono", "body", "heading", "control"],
    },
  },
});

/** Join class names and let later Tailwind utilities override earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return merge(clsx(inputs));
}

/**
 * Base UI also accepts a state function for className. Wrappers take a plain
 * string so `cn` can merge it; state styling stays in data-attribute variants.
 */
export type WithClassName<P> = Omit<P, "className"> & { className?: string };
