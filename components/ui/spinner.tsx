import { cn } from "../lib/cn";

/**
 * Indeterminate progress mark. A faint full track keeps the stopped state
 * (reduced motion, screenshots) readable as progress rather than as a glyph.
 * Decorative: pair it with visible text or aria-busy on the owning element.
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-[1em] shrink-0 animate-spin rounded-full border-[0.12em] border-current/30 border-t-current motion-reduce:animate-none",
        className,
      )}
    />
  );
}
