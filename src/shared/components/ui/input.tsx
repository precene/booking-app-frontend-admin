import type { ComponentProps } from "react";

import { cn } from "#/shared/utils/cn";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "border-input bg-surface placeholder:text-muted focus-visible:border-ring focus-visible:ring-ring/25 aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive/25 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-sm shadow-sm transition-colors outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      type={type}
      {...props}
    />
  );
}

export { Input };
