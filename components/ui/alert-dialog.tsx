import type { ReactNode } from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { cn, type WithClassName } from "../lib/cn";
import { buttonStyles, type ButtonVariant } from "./button";
import { backdropStyles, modalSurface } from "./dialog";

export { DialogFooter as AlertDialogFooter } from "./dialog";

/** Title and description group. No room is reserved on the right: there is no close mark. */
export function AlertDialogHeader({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex flex-col gap-1.5", className)}>{children}</div>;
}

/**
 * Confirmation that needs an explicit answer, such as a destructive action.
 * It cannot be dismissed by clicking outside. Name the action in the confirm
 * button ("削除する"), not "OK". Keep it open while the action is pending.
 */
export const AlertDialog = BaseAlertDialog.Root;
export const AlertDialogTrigger = BaseAlertDialog.Trigger;

export type AlertDialogContentProps = WithClassName<BaseAlertDialog.Popup.Props> & {
  /** Where the popup mounts. Pass an element inside the themed scope when the theme is not on <html>. */
  container?: BaseAlertDialog.Portal.Props["container"];
};

export function AlertDialogContent({ container, className, ...props }: AlertDialogContentProps) {
  return (
    <BaseAlertDialog.Portal container={container}>
      <BaseAlertDialog.Backdrop className={backdropStyles} />
      <BaseAlertDialog.Popup {...props} className={cn(modalSurface, "w-[min(28rem,calc(100vw-2*var(--space-4)))]", className)} />
    </BaseAlertDialog.Portal>
  );
}

export function AlertDialogTitle({ className, ...props }: WithClassName<BaseAlertDialog.Title.Props>) {
  return <BaseAlertDialog.Title {...props} className={cn("font-heading text-heading text-popover-foreground", className)} />;
}

export function AlertDialogDescription({ className, ...props }: WithClassName<BaseAlertDialog.Description.Props>) {
  return <BaseAlertDialog.Description {...props} className={cn("font-body text-body text-reading-secondary", className)} />;
}

export type AlertDialogCloseProps = WithClassName<BaseAlertDialog.Close.Props> & { variant?: ButtonVariant };

export function AlertDialogClose({ className, variant = "secondary", ...props }: AlertDialogCloseProps) {
  return <BaseAlertDialog.Close {...props} className={buttonStyles({ variant, className })} />;
}
