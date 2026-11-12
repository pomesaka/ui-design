import type { ReactNode } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cn, type WithClassName } from "../lib/cn";
import { XIcon } from "../lib/icons";
import { buttonStyles, type ButtonVariant } from "./button";

// Shared by Dialog and AlertDialog: a modal layer that blocks the page.
// Prefer an inline panel when the background must stay usable.
export const backdropStyles = cn(
  "fixed inset-0 z-50 bg-material-shadow/40",
  "transition-opacity duration-(--duration-expand) ease-standard motion-reduce:transition-none",
  "data-starting-style:opacity-0 data-ending-style:opacity-0",
);

export const modalSurface = cn(
  "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2*var(--space-4))] w-[min(32rem,calc(100vw-2*var(--space-4)))] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto",
  "rounded-dialog border border-border bg-popover p-6 text-popover-foreground shadow-lg outline-none",
  "transition-[scale,opacity] duration-(--duration-expand) ease-standard motion-reduce:transition-none",
  "data-starting-style:scale-98 data-starting-style:opacity-0 data-ending-style:scale-98 data-ending-style:opacity-0",
);

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;

export type DialogContentProps = WithClassName<BaseDialog.Popup.Props> & {
  /** Accessible name of the corner close button. */
  closeLabel?: string;
  /** Where the popup mounts. Pass an element inside the themed scope when the theme is not on <html>. */
  container?: BaseDialog.Portal.Props["container"];
};

export function DialogContent({ container, className, children, closeLabel = "閉じる", ...props }: DialogContentProps) {
  return (
    <BaseDialog.Portal container={container}>
      <BaseDialog.Backdrop className={backdropStyles} />
      <BaseDialog.Popup {...props} className={cn(modalSurface, className)}>
        {children}
        <BaseDialog.Close aria-label={closeLabel} className={buttonStyles({ variant: "ghost", size: "icon", className: "absolute top-3 right-3" })}>
          <XIcon />
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

/** Title and description group; every dialog needs a title. */
export function DialogHeader({ className, children }: { className?: string; children: ReactNode }) {
  // Leaves room for the corner close button of DialogContent.
  return <div className={cn("flex flex-col gap-1.5 pr-8", className)}>{children}</div>;
}

export function DialogTitle({ className, ...props }: WithClassName<BaseDialog.Title.Props>) {
  return <BaseDialog.Title {...props} className={cn("font-heading text-heading text-popover-foreground", className)} />;
}

export function DialogDescription({ className, ...props }: WithClassName<BaseDialog.Description.Props>) {
  return <BaseDialog.Description {...props} className={cn("font-body text-body text-reading-secondary", className)} />;
}

/** Actions, primary last. On narrow screens they stack with the primary on top. */
export function DialogFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end max-sm:*:w-full", className)}>
      {children}
    </div>
  );
}

export type DialogCloseProps = WithClassName<BaseDialog.Close.Props> & { variant?: ButtonVariant };

export function DialogClose({ className, variant = "outline", ...props }: DialogCloseProps) {
  return <BaseDialog.Close {...props} className={buttonStyles({ variant, className })} />;
}
