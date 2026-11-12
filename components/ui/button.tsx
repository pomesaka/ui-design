import { Button as BaseButton } from "@base-ui/react/button";
import { cn, type WithClassName } from "../lib/cn";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "md" | "sm" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:not-data-disabled:bg-primary-hover active:not-data-disabled:bg-primary-pressed",
  secondary: "bg-secondary text-secondary-foreground hover:not-data-disabled:bg-secondary-hover active:not-data-disabled:bg-secondary-pressed",
  destructive: "bg-destructive text-destructive-foreground hover:not-data-disabled:bg-destructive-hover active:not-data-disabled:bg-destructive-pressed",
  outline: "border-input bg-transparent text-control-foreground hover:not-data-disabled:bg-accent hover:not-data-disabled:text-accent-foreground active:not-data-disabled:bg-accent",
  ghost: "bg-transparent text-control-foreground hover:not-data-disabled:bg-accent hover:not-data-disabled:text-accent-foreground active:not-data-disabled:bg-accent",
};

const sizes: Record<ButtonSize, string> = {
  // md keeps the 44px hit size; sm is for dense desktop toolbars only.
  md: "h-control px-4",
  sm: "h-8 px-3",
  icon: "size-control p-0 text-[length:var(--icon-size-action)]",
};

/**
 * Button look for elements that are not buttons, such as a link styled as a
 * call to action. Navigation must stay an `<a>`; do not render it via Button.
 */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    "inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-field border border-transparent font-control text-action no-underline",
    "transition-[background-color,border-color,color,translate] duration-(--duration-release) ease-release motion-reduce:transition-none",
    "outline-none focus-visible:focus-ring",
    "active:not-data-disabled:translate-y-(--press-depth) active:not-data-disabled:duration-(--duration-press)",
    // Pending keeps its role and color; only a truly disabled button dims.
    "data-disabled:cursor-not-allowed data-disabled:not-aria-busy:disabled-dim aria-busy:cursor-progress",
    variants[variant],
    sizes[size],
    className,
  );
}

export type ButtonProps = WithClassName<BaseButton.Props> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * The action is running. The button stays focusable and keeps its label,
   * shows progress, and ignores further presses until the caller clears it.
   */
  pending?: boolean;
};

export function Button({ variant, size, pending = false, disabled, className, children, ...props }: ButtonProps) {
  return (
    <BaseButton
      {...props}
      disabled={disabled || pending}
      focusableWhenDisabled={pending || props.focusableWhenDisabled}
      aria-busy={pending || undefined}
      className={buttonStyles({ variant, size, className })}
    >
      {pending && <Spinner />}
      {children}
    </BaseButton>
  );
}
