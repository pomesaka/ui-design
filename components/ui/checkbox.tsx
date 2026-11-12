import type { ReactNode } from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { cn, type WithClassName } from "../lib/cn";
import { CheckIcon, MinusIcon } from "../lib/icons";

export type CheckboxProps = WithClassName<BaseCheckbox.Root.Props> & {
  /** Visible label. Wrapping makes the whole row a hit target. */
  children?: ReactNode;
};

export function Checkbox({ className, children, ...props }: CheckboxProps) {
  const box = (
    <BaseCheckbox.Root
      {...props}
      className={cn(
        "group inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[calc(var(--radius-field)*0.6)] border border-input bg-card text-primary-foreground",
        "outline-none focus-visible:focus-ring",
        "data-checked:border-primary data-checked:bg-primary data-indeterminate:border-primary data-indeterminate:bg-primary",
        "data-invalid:border-destructive data-disabled:cursor-not-allowed data-disabled:disabled-dim",
        children ? undefined : className,
      )}
    >
      <BaseCheckbox.Indicator className="flex text-[0.875rem]">
        <CheckIcon className="group-data-indeterminate:hidden" />
        <MinusIcon className="hidden group-data-indeterminate:block" />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
  if (!children) return box;
  return (
    <label className={cn("inline-flex min-h-hit cursor-pointer items-center gap-2 font-control text-body text-foreground has-data-disabled:cursor-not-allowed [&:has([data-disabled])>span:last-child]:disabled-dim", className)}>
      {box}
      <span>{children}</span>
    </label>
  );
}
