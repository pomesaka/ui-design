import type { ReactNode } from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cn, type WithClassName } from "../lib/cn";

export type SwitchProps = WithClassName<BaseSwitch.Root.Props> & { children?: ReactNode };

/** A setting that applies immediately. For choices submitted later, use Checkbox. */
export function Switch({ className, children, ...props }: SwitchProps) {
  const control = (
    <BaseSwitch.Root
      {...props}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border border-input bg-muted p-0.5",
        "transition-[background-color,border-color] duration-(--duration-standard) ease-standard motion-reduce:transition-none",
        "outline-none focus-visible:focus-ring",
        "data-checked:border-primary data-checked:bg-primary",
        "data-disabled:cursor-not-allowed data-disabled:disabled-dim",
        children ? undefined : className,
      )}
    >
      <BaseSwitch.Thumb
        className={cn(
          "size-4.5 rounded-full bg-card shadow-sm",
          "transition-[translate] duration-(--duration-standard) ease-standard motion-reduce:transition-none",
          "data-checked:translate-x-4",
        )}
      />
    </BaseSwitch.Root>
  );
  if (!children) return control;
  return (
    <label className={cn("inline-flex min-h-hit cursor-pointer items-center gap-3 font-control text-body text-foreground has-data-disabled:cursor-not-allowed [&:has([data-disabled])>span:last-child]:disabled-dim", className)}>
      {control}
      <span>{children}</span>
    </label>
  );
}
