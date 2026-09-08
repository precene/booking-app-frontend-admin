import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, Info, X, XCircle } from "lucide-react";
import { Children, isValidElement, useState, type ComponentProps, type ReactNode } from "react";

import { cn } from "#/shared/utils/cn";

const alertVariants = cva(
  "relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 pr-11 text-sm",
  {
    variants: {
      variant: {
        default: "bg-surface text-foreground",
        destructive: "border-destructive/30 bg-destructive/5 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const alertIcons = {
  default: Info,
  destructive: XCircle,
} as const;

type AlertProps = ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    dismissible?: boolean;
    onDismiss?: () => void;
  };

function Alert({
  children,
  className,
  dismissible = true,
  onDismiss,
  variant = "default",
  ...props
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = alertIcons[variant ?? "default"];

  if (!isVisible) {
    return null;
  }

  function handleDismiss() {
    setIsVisible(false);
    onDismiss?.();
  }

  return (
    <div
      className={cn(alertVariants({ className, variant }))}
      data-slot="alert"
      role="alert"
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">{removeLegacyAlertIcon(children)}</div>

      {dismissible ? (
        <button
          aria-label="Close Alert"
          className="hover:bg-surface-muted/70 focus-visible:ring-ring absolute top-3 right-3 rounded-md p-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          onClick={handleDismiss}
          type="button"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

function AlertTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mb-1 leading-none font-medium tracking-normal", className)}
      data-slot="alert-title"
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      data-slot="alert-description"
      {...props}
    />
  );
}

function removeLegacyAlertIcon(children: ReactNode) {
  return Children.toArray(children).filter((child) => {
    if (!isValidElement(child)) {
      return true;
    }

    return child.type !== AlertCircle;
  });
}

export { Alert, AlertDescription, AlertTitle };
