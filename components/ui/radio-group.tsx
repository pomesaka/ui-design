import type { ReactNode } from "react";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { cn, type WithClassName } from "../lib/cn";

/** One choice from a short, always visible list. Label the group (aria-labelledby or Field). */
export function RadioGroup({ className, ...props }: WithClassName<BaseRadioGroup.Props>) {
  return <BaseRadioGroup {...props} className={cn("flex flex-col gap-1", className)} />;
}

export type RadioProps = WithClassName<BaseRadio.Root.Props> & { children: ReactNode };

export function Radio({ className, children, ...props }: RadioProps) {
  return (
    <label className={cn("inline-flex min-h-hit cursor-pointer items-center gap-2 font-control text-body text-foreground has-data-disabled:cursor-not-allowed [&:has([data-disabled])>span:last-child]:disabled-dim", className)}>
      <BaseRadio.Root
        {...props}
        className={cn(
          "inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border border-input bg-card",
          "outline-none focus-visible:focus-ring",
          "data-checked:border-primary data-checked:bg-primary",
          "data-disabled:cursor-not-allowed data-disabled:disabled-dim",
        )}
      >
        <BaseRadio.Indicator className="size-2 rounded-full bg-primary-foreground" />
      </BaseRadio.Root>
      <span>{children}</span>
    </label>
  );
}
