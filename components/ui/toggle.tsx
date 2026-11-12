import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { cn, type WithClassName } from "../lib/cn";

export type ToggleProps = WithClassName<BaseToggle.Props> & { size?: "md" | "sm" };

/**
 * Two-state button whose pressed state persists (aria-pressed), such as a
 * favorite or a view option. Off uses the secondary pair, on the selected
 * pair with its border, so both read as buttons and differ beyond color tone. Not for navigation: use a link with aria-current.
 */
export function Toggle({ className, size = "md", ...props }: ToggleProps) {
  return (
    <BaseToggle
      {...props}
      className={cn(
        "inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-field border border-transparent bg-secondary font-control text-action text-secondary-foreground",
        "transition-[background-color,border-color,color,translate] duration-(--duration-standard) ease-standard motion-reduce:transition-none",
        "outline-none focus-visible:focus-ring",
        "hover:not-data-disabled:not-data-pressed:bg-secondary-hover active:not-data-disabled:not-data-pressed:bg-secondary-pressed",
        "active:not-data-disabled:translate-y-(--press-depth)",
        "data-pressed:border-selected-border data-pressed:bg-selected data-pressed:text-selected-foreground",
        "data-disabled:cursor-not-allowed data-disabled:disabled-dim",
        size === "md" ? "h-control px-4" : "h-8 px-3 pointer-coarse:h-control",
        className,
      )}
    />
  );
}
