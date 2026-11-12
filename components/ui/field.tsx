import { Field as BaseField } from "@base-ui/react/field";
import { Input as BaseInput } from "@base-ui/react/input";
import { cn, type WithClassName } from "../lib/cn";

export type FieldProps = WithClassName<BaseField.Root.Props> & {
  /**
   * An error decided outside the browser's checks: a server response or a
   * cross-field rule ("このアドレスは既にメンバーです"). It marks the field
   * invalid and shows the message under it. Clear it when the value changes.
   */
  error?: string | null;
};

/**
 * Field connects one control with its label, description and error, so
 * ids, aria-describedby and aria-invalid never have to be wired by hand.
 */
export function Field({ className, error, invalid, children, ...props }: FieldProps) {
  return (
    <BaseField.Root {...props} invalid={invalid || Boolean(error) || undefined} className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      {children}
      {error && <FieldError match>{error}</FieldError>}
    </BaseField.Root>
  );
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
 * Message for one browser check, such as `match="valueMissing"` for a
 * required field. Say what is wrong and how to fix it. Always pass `match`:
 * without it the browser's own (often English) message appears. Errors from
 * elsewhere go through Field `error`.
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
  // The browser's own clear button in search fields ignores the theme; offer a
  // clear action in the screen instead when one is needed.
  return <BaseInput {...props} className={cn(fieldControlStyles, "h-control [&::-webkit-search-cancel-button]:appearance-none", className)} />;
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
