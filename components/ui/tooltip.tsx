import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { cn, type WithClassName } from "../lib/cn";

/**
 * Supplementary label for a control, mostly icon buttons. Never the only
 * place for required information: tooltips do not appear on touch.
 * The trigger still needs its own accessible name (aria-label).
 * Wrap the app once in TooltipProvider so adjacent tooltips open instantly.
 */
export const TooltipProvider = BaseTooltip.Provider;
export const Tooltip = BaseTooltip.Root;
export const TooltipTrigger = BaseTooltip.Trigger;

export type TooltipContentProps = WithClassName<BaseTooltip.Popup.Props> & {
  /** Where the popup mounts. Pass an element inside the themed scope when the theme is not on <html>. */
  container?: BaseTooltip.Portal.Props["container"];
};

export function TooltipContent({ container, className, ...props }: TooltipContentProps) {
  return (
    <BaseTooltip.Portal container={container}>
      <BaseTooltip.Positioner sideOffset={6} className="z-50">
        <BaseTooltip.Popup
          {...props}
          className={cn(
            "max-w-64 rounded-field bg-foreground px-2 py-1 font-control text-caption text-background shadow-md",
            "origin-(--transform-origin) transition-[scale,opacity] duration-(--duration-standard) ease-standard motion-reduce:transition-none",
            "data-starting-style:scale-98 data-starting-style:opacity-0 data-ending-style:opacity-0 data-instant:transition-none",
            className,
          )}
        />
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
