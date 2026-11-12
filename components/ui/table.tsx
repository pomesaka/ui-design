import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "../lib/cn";

export type TableProps = Omit<ComponentProps<"table">, "className"> & {
  /** Names the table and its scroll region. Visible unless `hideCaption`. */
  caption: ReactNode;
  hideCaption?: boolean;
  className?: string;
};

/**
 * Values compared across rows and columns (rates per site, monthly figures).
 * For items with one or two values and actions, use List instead.
 * The wrapper scrolls sideways on narrow screens and is `relative`, so
 * absolutely positioned content inside (such as sr-only text) stays within it
 * instead of widening the page. It is focusable so keyboard users can scroll it.
 */
export function Table({ caption, hideCaption = false, className, children, ...props }: TableProps) {
  const captionId = useId();
  return (
    <div
      role="region"
      aria-labelledby={captionId}
      tabIndex={0}
      className={cn("relative w-full overflow-x-auto rounded-field outline-none focus-visible:focus-ring", className)}
    >
      <table {...props} className="w-full border-collapse font-control text-body tabular-nums">
        <caption id={captionId} className={cn("pb-2 text-left font-heading text-section", hideCaption && "sr-only")}>
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return <thead {...props} className={cn("border-b border-border", className)} />;
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody {...props} className={cn("[&>tr]:border-b [&>tr]:border-border", className)} />;
}

export function TableRow(props: ComponentProps<"tr">) {
  return <tr {...props} />;
}

type CellAlign = { /** Numbers align right so digits line up. */ numeric?: boolean };

/**
 * Column heading (default) or row heading (`scope="row"`, the first cell of a
 * body row). Keep `scope` so each cell is read with its headings.
 */
export function TableHead({ numeric = false, scope = "col", className, ...props }: ComponentProps<"th"> & CellAlign) {
  return (
    <th
      {...props}
      scope={scope}
      className={cn(
        scope === "row"
          ? "whitespace-nowrap px-3 py-3 align-middle text-body [font-weight:var(--weight-control)]"
          : "h-10 whitespace-nowrap px-3 align-bottom text-caption text-reading-secondary [font-weight:var(--weight-control)]",
        numeric ? "text-right" : "text-left",
        className,
      )}
    />
  );
}

export function TableCell({ numeric = false, className, ...props }: ComponentProps<"td"> & CellAlign) {
  return <td {...props} className={cn("px-3 py-3 align-middle", numeric ? "text-right" : "text-left", className)} />;
}
