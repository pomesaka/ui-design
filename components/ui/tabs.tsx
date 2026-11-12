import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cn, type WithClassName } from "../lib/cn";

/**
 * Switch between views of the same subject. Tabs are not navigation between
 * pages; use links for that. Keep labels short and parallel.
 */
export function Tabs({ className, ...props }: WithClassName<BaseTabs.Root.Props>) {
  return <BaseTabs.Root {...props} className={cn("flex min-w-0 flex-col", className)} />;
}

export function TabsList({ className, children, ...props }: WithClassName<BaseTabs.List.Props>) {
  return (
    <BaseTabs.List {...props} className={cn("relative z-0 flex gap-1 overflow-x-auto border-b border-border", className)}>
      {children}
      <BaseTabs.Indicator
        className={cn(
          "absolute bottom-0 left-0 -z-10 h-0.5 w-(--active-tab-width) translate-x-(--active-tab-left) bg-primary",
          "transition-[translate,width] duration-(--duration-standard) ease-standard motion-reduce:transition-none",
        )}
      />
    </BaseTabs.List>
  );
}

export function TabsTab({ className, ...props }: WithClassName<BaseTabs.Tab.Props>) {
  return (
    <BaseTabs.Tab
      {...props}
      className={cn(
        "inline-flex h-control shrink-0 cursor-pointer select-none items-center whitespace-nowrap px-3 font-control text-action text-reading-secondary",
        "outline-none focus-visible:focus-ring focus-visible:outline-offset-[calc(-1*var(--focus-outline-width))]",
        "hover:not-data-disabled:text-foreground data-active:text-foreground",
        "data-disabled:cursor-not-allowed data-disabled:disabled-dim",
        className,
      )}
    />
  );
}

export function TabsPanel({ className, ...props }: WithClassName<BaseTabs.Panel.Props>) {
  return <BaseTabs.Panel {...props} className={cn("pt-4 outline-none focus-visible:focus-ring", className)} />;
}
