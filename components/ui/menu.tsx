import { Menu as BaseMenu } from "@base-ui/react/menu";
import { cn, type WithClassName } from "../lib/cn";
import { floatingSurface, listItem } from "../lib/styles";

/**
 * A list of actions opened from a trigger. Put frequent actions on the page;
 * the menu holds secondary ones. Style the trigger by rendering a Button:
 * `<MenuTrigger render={<Button variant="outline" />}>`.
 */
export const Menu = BaseMenu.Root;
export const MenuTrigger = BaseMenu.Trigger;
export const MenuGroup = BaseMenu.Group;

export type MenuContentProps = WithClassName<BaseMenu.Popup.Props> & {
  /** Where the popup mounts. Pass an element inside the themed scope when the theme is not on <html>. */
  container?: BaseMenu.Portal.Props["container"];
};

export function MenuContent({ container, className, ...props }: MenuContentProps) {
  return (
    <BaseMenu.Portal container={container}>
      <BaseMenu.Positioner sideOffset={4} align="start" className="z-50 outline-none">
        <BaseMenu.Popup {...props} className={cn(floatingSurface, "min-w-48 p-1", className)} />
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export type MenuItemProps = WithClassName<BaseMenu.Item.Props> & { variant?: "default" | "destructive" };

export function MenuItem({ className, variant = "default", ...props }: MenuItemProps) {
  return (
    <BaseMenu.Item
      {...props}
      className={cn(listItem, variant === "destructive" && "text-destructive data-highlighted:text-destructive", className)}
    />
  );
}

export function MenuSeparator({ className, ...props }: WithClassName<BaseMenu.Separator.Props>) {
  return <BaseMenu.Separator {...props} className={cn("mx-1 my-1 h-px bg-border", className)} />;
}

export function MenuGroupLabel({ className, ...props }: WithClassName<BaseMenu.GroupLabel.Props>) {
  return <BaseMenu.GroupLabel {...props} className={cn("px-2.5 pt-2 pb-1 font-control text-caption text-reading-secondary", className)} />;
}
