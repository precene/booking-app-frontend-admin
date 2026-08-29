import type { ComponentProps, ReactNode } from "react";

import { cn } from "#/shared/utils/cn";

function TooltipProvider({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

function Tooltip({ children }: { children?: ReactNode }) {
  return <span className="group/tooltip relative inline-flex">{children}</span>;
}

function TooltipTrigger({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("inline-flex", className)} {...props} />;
}

function TooltipContent({
  className,
  sideOffset,
  style,
  ...props
}: ComponentProps<"span"> & {
  sideOffset?: number;
}) {
  return (
    <span
      className={cn(
        "bg-secondary text-secondary-foreground pointer-events-none absolute bottom-full left-1/2 z-50 hidden -translate-x-1/2 rounded-md px-3 py-1.5 text-xs whitespace-nowrap shadow-md group-focus-within/tooltip:block group-hover/tooltip:block",
        className,
      )}
      role="tooltip"
      style={{ marginBottom: sideOffset ?? 8, ...style }}
      {...props}
    />
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
