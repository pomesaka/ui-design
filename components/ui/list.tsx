import { useId, type ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * Rows of similar items (members, files, invitations). Rows are separated by
 * rules, not cards. On wide screens the rows share one grid, so the meta and
 * action columns line up across rows whatever each row contains. Name the list with aria-labelledby pointing at its heading.
 * For many columns compared across rows, use a table instead.
 */
export function List({ className, children, ...props }: { className?: string; children: ReactNode; "aria-labelledby"?: string; "aria-label"?: string }) {
  return (
    <ul {...props} className={cn("flex flex-col border-t border-border md:grid md:grid-cols-[minmax(0,1fr)_auto_auto] md:gap-x-6", className)}>
      {children}
    </ul>
  );
}

export type ListItemProps = {
  /** What the row is about. It names the row for assistive technology. */
  title: ReactNode;
  /** Second line identifying the item, such as an email address. */
  description?: ReactNode;
  /** Status or metadata (last activity, expiry); aligned in its own column. */
  meta?: ReactNode;
  /**
   * At most two visible actions; move the rest into a Menu. Give each an
   * accessible name with the item ("阿部 誠さんを削除"). Use size="sm".
   */
  actions?: ReactNode;
  /** Row-level feedback shown under the row, such as an error Notice. */
  children?: ReactNode;
  className?: string;
};

/**
 * One row: identity on the left, meta in the middle, actions on the right; it
 * stacks on narrow screens. After removing a row, move focus to the next row's
 * same action, else the previous row's, else the list heading.
 */
export function ListItem({ title, description, meta, actions, children, className }: ListItemProps) {
  const titleId = useId();
  return (
    <li
      aria-labelledby={titleId}
      className={cn("flex flex-col gap-2 border-b border-border py-3 md:col-span-3 md:grid md:grid-cols-subgrid md:items-center md:gap-y-3", className)}
    >
      <div className="flex min-w-0 flex-col">
        <p id={titleId} className="font-body text-body break-words">{title}</p>
        {description && <p className="font-control text-caption text-reading-secondary break-all">{description}</p>}
      </div>
      {/* Always rendered, even empty, so every row keeps the shared columns. */}
      <div className="flex items-center gap-1 font-control text-caption text-reading-secondary empty:hidden md:empty:block">{meta}</div>
      <div className="flex flex-wrap items-center gap-2 empty:hidden md:empty:block md:justify-end">{actions}</div>
      {children && <div className="md:col-span-3">{children}</div>}
    </li>
  );
}

/**
 * Where focus should go when the row holding `trigger` is about to be removed:
 * the same action (matching `data-list-action`) in the next row, else in the
 * previous row, else `fallback` (usually the list heading, with tabIndex -1).
 * Call it before the row leaves the DOM, then focus the result afterwards.
 */
export function focusTargetAfterRemoval(trigger: HTMLElement | null, fallback: HTMLElement | null): HTMLElement | null {
  const row = trigger?.closest("li");
  const action = trigger?.dataset.listAction;
  if (!row || !action) return fallback;
  const selector = `[data-list-action="${CSS.escape(action)}"]:not(:disabled)`;
  const steps = [(element: Element) => element.nextElementSibling, (element: Element) => element.previousElementSibling];
  for (const step of steps) {
    for (let sibling = step(row); sibling; sibling = step(sibling)) {
      const match = sibling.querySelector(selector);
      if (match instanceof HTMLElement) return match;
    }
  }
  return fallback;
}
