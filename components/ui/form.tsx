import type { ReactNode } from "react";
import { Form as BaseForm } from "@base-ui/react/form";
import { cn, type WithClassName } from "../lib/cn";

/**
 * Form validates its Fields on submit (native constraints such as `required`
 * plus Field `validate`), shows each FieldError next to its field and moves
 * focus to the first invalid one. `onFormSubmit` runs only when all are valid.
 * Errors from the server or from rules across fields go to that Field's
 * `error` prop (then focus that field, as the browser checks do); a failure
 * of the whole submission goes in a Banner above the fields. Keep entered values on failure; never clear the form to report it.
 */
export function Form({ className, ...props }: WithClassName<BaseForm.Props>) {
  return <BaseForm {...props} className={cn("flex flex-col gap-6", className)} />;
}

/**
 * Submit and secondary actions at the end of a page form: left-aligned with
 * the fields, primary first. (In a Dialog, use DialogFooter instead.)
 */
export function FormActions({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex flex-wrap items-center gap-3", className)}>{children}</div>;
}
