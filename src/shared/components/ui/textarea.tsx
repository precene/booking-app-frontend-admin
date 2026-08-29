import type { ComponentProps } from "react";

import { cn } from "#/shared/utils/cn";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "border-input bg-surface placeholder:text-muted focus-visible:border-ring focus-visible:ring-ring/25 aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive/25 flex min-h-24 w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
