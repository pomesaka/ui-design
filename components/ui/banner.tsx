import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { XIcon } from "../lib/icons";
import { buttonStyles } from "./button";
import { toneIcon, toneStyles, type Tone } from "./notice";

export type BannerProps = {
  tone?: Tone;
  title: ReactNode;
  /** What happened and how to recover or continue. */
  children?: ReactNode;
  /** Recovery or follow-up, such as a retry or "詳細を見る" Button. */
  action?: ReactNode;
  /**
   * Show a close button. Omit it while the situation still applies (an
   * unresolved error, an expiring session); the banner then stays until resolved.
   */
  onDismiss?: () => void;
  dismissLabel?: string;
  className?: string;
};

/**
 * Persistent message at the top of the page, a section or a dialog body, for
 * results that are not evident from the UI, failures and system state. It never
 * disappears on a timer. Messages about one control belong next to it (Notice,
 * FieldError). Visual only: pair a newly shown banner with announce().
 */
export function Banner({ tone = "info", title, children, action, onDismiss, dismissLabel = "閉じる", className }: BannerProps) {
  const Icon = toneIcon[tone];
  const style = toneStyles[tone];
  return (
    <div className={cn("flex w-full flex-wrap items-start gap-x-3 gap-y-2 rounded-card border bg-card px-4 py-3 text-card-foreground", style.edge, className)}>
      <div className="flex min-w-0 flex-[1_1_16rem] gap-3">
        <Icon className={cn("mt-0.5 size-4 shrink-0", style.text)} />
        <div className="flex min-w-0 flex-col gap-1">
          <p className={cn("font-control text-action", style.text)}>{title}</p>
          {children && <div className="font-body text-body">{children}</div>}
        </div>
      </div>
      {(action || onDismiss) && (
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {action}
          {onDismiss && (
            <button type="button" aria-label={dismissLabel} onClick={onDismiss} className={buttonStyles({ variant: "ghost", size: "icon", className: "-my-2 -mr-2" })}>
              <XIcon />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
