import { Select as BaseSelect } from "@base-ui/react/select";
import { cn, type WithClassName } from "../lib/cn";
import { CheckIcon, ChevronsUpDownIcon } from "../lib/icons";
import { floatingSurface, listItem } from "../lib/styles";
import { fieldControlStyles } from "./field";

/**
 * Choose one value from a list too long for radios. Pass `items` so the
 * trigger can show the selected label before the popup has opened.
 */
export const Select = BaseSelect.Root;

/** Visible name of the select. Use it instead of FieldLabel for a Select. */
export function SelectLabel({ className, ...props }: WithClassName<BaseSelect.Label.Props>) {
  return <BaseSelect.Label {...props} className={cn("w-fit font-control text-action text-foreground", className)} />;
}

export type SelectTriggerProps = WithClassName<BaseSelect.Trigger.Props> & { placeholder?: string };

export function SelectTrigger({ className, placeholder, ...props }: SelectTriggerProps) {
  return (
    <BaseSelect.Trigger
      {...props}
      className={cn(
        fieldControlStyles,
        "flex h-control cursor-pointer items-center justify-between gap-2 text-left data-popup-open:border-control-foreground",
        className,
      )}
    >
      <BaseSelect.Value placeholder={placeholder} className="truncate data-placeholder:text-muted-foreground" />
      <BaseSelect.Icon className="flex shrink-0 text-control-foreground">
        <ChevronsUpDownIcon />
      </BaseSelect.Icon>
    </BaseSelect.Trigger>
  );
}

export type SelectContentProps = WithClassName<BaseSelect.Popup.Props> & {
  /** Where the popup mounts. Pass an element inside the themed scope when the theme is not on <html>. */
  container?: BaseSelect.Portal.Props["container"];
};

export function SelectContent({ container, className, children, ...props }: SelectContentProps) {
  return (
    <BaseSelect.Portal container={container}>
      <BaseSelect.Positioner sideOffset={4} className="z-50 outline-none">
        <BaseSelect.Popup {...props} className={cn(floatingSurface, "min-w-(--anchor-width)", className)}>
          <BaseSelect.List className="max-h-(--available-height) overflow-y-auto p-1">{children}</BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

export function SelectItem({ className, children, ...props }: WithClassName<BaseSelect.Item.Props>) {
  return (
    <BaseSelect.Item {...props} className={cn(listItem, "grid grid-cols-[1rem_1fr] pl-2", className)}>
      <BaseSelect.ItemIndicator className="col-start-1 flex">
        <CheckIcon />
      </BaseSelect.ItemIndicator>
      <BaseSelect.ItemText className="col-start-2">{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  );
}
