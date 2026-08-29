import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronRight, Circle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "#/shared/utils/cn";

function DropdownMenu(props: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root {...props} />;
}

function DropdownMenuTrigger(props: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger {...props} />;
}

function DropdownMenuPortal(props: ComponentProps<typeof PopoverPrimitive.Portal>) {
  return <PopoverPrimitive.Portal {...props} />;
}

function DropdownMenuGroup({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("py-1", className)} role="group" {...props} />;
}

function DropdownMenuSub({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuRadioGroup({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("py-1", className)} role="group" {...props} />;
}

function DropdownMenuSubTrigger({
  children,
  className,
  inset,
  ...props
}: ComponentProps<"button"> & {
  inset?: boolean;
}) {
  return (
    <button
      className={cn(
        "hover:bg-surface-muted focus:bg-surface-muted flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none select-none",
        inset && "pl-8",
        className,
      )}
      type="button"
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto size-4" />
    </button>
  );
}

function DropdownMenuSubContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-surface text-foreground z-50 min-w-32 overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      role="menu"
      {...props}
    />
  );
}

function DropdownMenuContent({
  align = "end",
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        className={cn(
          "bg-surface text-foreground data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50 min-w-36 overflow-hidden rounded-md border p-1 shadow-lg outline-none",
          className,
        )}
        role="menu"
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: ComponentProps<"button"> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <button
      className={cn(
        "hover:bg-surface-muted focus:bg-surface-muted relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        variant === "destructive" &&
          "text-destructive hover:bg-destructive/10 focus:bg-destructive/10",
        inset && "pl-8",
        className,
      )}
      role="menuitem"
      type="button"
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  checked,
  children,
  className,
  ...props
}: ComponentProps<"button"> & {
  checked?: boolean;
}) {
  return (
    <button
      aria-checked={checked}
      className={cn(
        "hover:bg-surface-muted focus:bg-surface-muted relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-left text-sm outline-none select-none disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      role="menuitemcheckbox"
      type="button"
      {...props}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        {checked ? <Check className="size-4" /> : null}
      </span>
      {children}
    </button>
  );
}

function DropdownMenuRadioItem({
  checked,
  children,
  className,
  ...props
}: ComponentProps<"button"> & {
  checked?: boolean;
}) {
  return (
    <button
      aria-checked={checked}
      className={cn(
        "hover:bg-surface-muted focus:bg-surface-muted relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-left text-sm outline-none select-none disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      role="menuitemradio"
      type="button"
      {...props}
    >
      <span className="absolute left-2 flex size-4 items-center justify-center">
        {checked ? <Circle className="size-2 fill-current" /> : null}
      </span>
      {children}
    </button>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: ComponentProps<"div"> & {
  inset?: boolean;
}) {
  return (
    <div className={cn("px-2 py-1.5 text-sm font-medium", inset && "pl-8", className)} {...props} />
  );
}

function DropdownMenuSeparator({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("bg-border -mx-1 my-1 h-px", className)} role="separator" {...props} />;
}

function DropdownMenuShortcut({ className, ...props }: ComponentProps<"span">) {
  return (
    <span className={cn("text-muted ml-auto text-xs tracking-normal", className)} {...props} />
  );
}

function DropdownMenuClose(props: ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close {...props} />;
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuClose,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
