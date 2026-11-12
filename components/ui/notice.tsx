import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from "../lib/icons";

export type Tone = "info" | "success" | "warning" | "error";

export const toneIcon = { info: InfoIcon, success: SuccessIcon, warning: WarningIcon, error: ErrorIcon } satisfies Record<Tone, unknown>;

// Full class names so Tailwind can see them. The tone colors the edge, icon
// and title; body text stays on the readable foreground.
export const toneStyles: Record<Tone, { edge: string; text: string }> = {
  info: { edge: "border-info", text: "text-info" },
  success: { edge: "border-success", text: "text-success" },
  warning: { edge: "border-warning", text: "text-warning" },
  error: { edge: "border-destructive", text: "text-destructive" },
};

export type NoticeProps = {
  tone?: Tone;
  title: ReactNode;
  /** Detail and next step. Say how to recover, not only what failed. */
  children?: ReactNode;
  /** Recovery or follow-up, such as a retry Button. */
  action?: ReactNode;
  className?: string;
};

/**
 * Inline message tied to a place on the page. It is static: when it appears
 * as the result of an action, render it inside a live region (role="status",
 * or role="alert" for errors that block the task) or use a toast.
 */
export function Notice({ tone = "info", title, children, action, className }: NoticeProps) {
  const Icon = toneIcon[tone];
  const style = toneStyles[tone];
  return (
    <div className={cn("flex gap-3 rounded-card border bg-card p-3 text-card-foreground", style.edge, className)}>
      <Icon className={cn("mt-0.5 size-4 shrink-0", style.text)} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className={cn("font-control text-action", style.text)}>{title}</p>
        {children && <div className="font-body text-body">{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}
