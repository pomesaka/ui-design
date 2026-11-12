import { Field as BaseField } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import { cn, type WithClassName } from "../lib/cn";

/**
 * Field connects one control with its label, description and error, so
 * ids, aria-describedby and aria-invalid never have to be wired by hand.
 * Set `invalid` for errors decided outside the browser (such as the server).
 */
export function Field({ className, ...props }: WithClassName<BaseField.Root.Props>) {
  return <BaseField.Root {...props} className={cn("flex min-w-0 flex-col gap-1.5", className)} />;
}

export function FieldLabel({ className, ...props }: WithClassName<BaseField.Label.Props>) {
  return (
    <BaseField.Label
      {...props}
      className={cn("font-control text-action text-foreground data-disabled:disabled-dim", className)}
    />
  );
}

/** Persistent help. Keep it short; it is read with the control. */
export function FieldDescription({ className, ...props }: WithClassName<BaseField.Description.Props>) {
  return (
    <BaseField.Description
      {...props}
      className={cn("font-control text-caption text-muted-foreground", className)}
    />
  );
}

/**
 * Shown while the field is invalid. Say what is wrong and how to fix it.
 * Use `match` for a specific validity state ("valueMissing" etc.). For an
 * error decided elsewhere, set Field `invalid` and render `<FieldError match>`
 * only while it applies: `match` true always shows the message.
 */
export function FieldError({ className, ...props }: WithClassName<BaseField.Error.Props>) {
  return (
    <BaseField.Error
      {...props}
      className={cn("font-control text-caption text-destructive", className)}
    />
  );
}

// 16px text avoids mobile zoom on focus; hover only hints when the field is editable.
export const fieldControlStyles = cn(
  "w-full min-w-0 rounded-field border border-input bg-card px-3 font-control text-detail text-card-foreground",
  "transition-[border-color] duration-(--duration-standard) ease-standard motion-reduce:transition-none",
  "placeholder:text-muted-foreground",
  "outline-none focus-visible:focus-ring",
  "hover:not-data-disabled:not-data-invalid:not-[[readonly]]:border-control-foreground",
  "data-invalid:border-destructive aria-invalid:border-destructive",
  // :read-only also matches buttons (Select trigger), so test the attribute.
  "[&[readonly]]:bg-muted [&[readonly]]:text-muted-foreground",
  "data-disabled:cursor-not-allowed data-disabled:disabled-dim",
);

export function Input({ className, ...props }: WithClassName<BaseInput.Props>) {
  return <BaseInput {...props} className={cn(fieldControlStyles, "h-control", className)} />;
}

export type TextareaProps = WithClassName<Omit<BaseField.Control.Props, "render">> & { rows?: number };

/** Multi-line text. Grows with its content up to the max height. */
export function Textarea({ className, rows = 3, ...props }: TextareaProps) {
  return (
    <BaseField.Control
      {...props}
      render={<textarea rows={rows} />}
      className={cn(fieldControlStyles, "min-h-24 max-h-80 resize-y py-2 field-sizing-content", className)}
    />
  );
}
