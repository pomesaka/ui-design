import type { ReactNode } from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { cn } from "../lib/cn";
import { XIcon } from "../lib/icons";
import { buttonStyles } from "./button";
import { toneIcon, toneStyles, type Tone } from "./notice";

/**
 * Brief, non-blocking result of an action ("保存しました"). Not for errors
 * the user must act on before continuing; keep those next to the cause.
 * Mount ToastProvider once near the root, then call `useToast().add(...)`
 * with `type` set to info | success | warning | error.
 */
export type ToastProviderProps = {
  children: ReactNode;
  closeLabel?: string;
  /** Where toasts mount. Pass an element inside the themed scope when the theme is not on <html>. */
  container?: BaseToast.Portal.Props["container"];
};

export function ToastProvider({ children, closeLabel = "閉じる", container }: ToastProviderProps) {
  return (
    <BaseToast.Provider>
      {children}
      <BaseToast.Portal container={container}>
        <BaseToast.Viewport className="fixed right-4 bottom-4 left-4 z-50 flex flex-col-reverse gap-2 outline-none sm:left-auto sm:w-90">
          <ToastList closeLabel={closeLabel} />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}

export const useToast = BaseToast.useToastManager;

function isTone(value: unknown): value is Tone {
  return value === "info" || value === "success" || value === "warning" || value === "error";
}

function ToastList({ closeLabel }: { closeLabel: string }) {
  const { toasts } = BaseToast.useToastManager();
  return toasts.map((toast) => {
    const tone = isTone(toast.type) ? toast.type : "info";
    const Icon = toneIcon[tone];
    return (
      <BaseToast.Root
        key={toast.id}
        toast={toast}
        className={cn(
          "rounded-card border border-border bg-popover text-popover-foreground shadow-lg",
          "transition-[translate,opacity] duration-(--duration-expand) ease-standard motion-reduce:transition-none",
          "data-starting-style:translate-y-2 data-starting-style:opacity-0 data-ending-style:opacity-0 data-limited:hidden",
        )}
      >
        <BaseToast.Content className="flex items-start gap-3 p-3">
          <Icon className={cn("mt-0.5 size-4 shrink-0", toneStyles[tone].text)} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <BaseToast.Title className="font-control text-action" />
            <BaseToast.Description className="font-body text-body text-reading-secondary" />
          </div>
          <BaseToast.Close aria-label={closeLabel} className={buttonStyles({ variant: "ghost", size: "icon", className: "-my-2 -mr-2" })}>
            <XIcon />
          </BaseToast.Close>
        </BaseToast.Content>
      </BaseToast.Root>
    );
  });
}
