import { CheckCircle2, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "#/shared/utils/cn";

type ToastVariant = "destructive" | "success";

type ToastItem = {
  description?: string;
  id: string;
  title: string;
  variant: ToastVariant;
};

type ToastInput = {
  description?: string;
  title: string;
};

const toastListeners = new Set<(toasts: Array<ToastItem>) => void>();
const toastTimers = new Map<string, ReturnType<typeof setTimeout>>();
let toasts: Array<ToastItem> = [];

export const toast = {
  destructive: (input: ToastInput) => addToast({ ...input, variant: "destructive" }),
  success: (input: ToastInput) => addToast({ ...input, variant: "success" }),
};

export function Toaster() {
  const [visibleToasts, setVisibleToasts] = useState<Array<ToastItem>>(toasts);

  useEffect(() => {
    toastListeners.add(setVisibleToasts);

    return () => {
      toastListeners.delete(setVisibleToasts);
    };
  }, []);

  if (!visibleToasts.length) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
      {visibleToasts.map((item) => (
        <ToastCard item={item} key={item.id} />
      ))}
    </div>
  );
}

function ToastCard({ item }: { item: ToastItem }) {
  const Icon = item.variant === "success" ? CheckCircle2 : XCircle;

  return (
    <div
      className={cn(
        "bg-surface animate-in slide-in-from-bottom-2 fade-in-0 flex items-start gap-3 rounded-lg border p-4 shadow-lg",
        item.variant === "success" && "border-primary/30",
        item.variant === "destructive" && "border-destructive/30",
      )}
      role="status"
    >
      <Icon
        className={cn(
          "mt-0.5 size-5 shrink-0",
          item.variant === "success" && "text-primary",
          item.variant === "destructive" && "text-destructive",
        )}
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{item.title}</p>
        {item.description ? <p className="text-muted mt-1 text-sm">{item.description}</p> : null}
      </div>

      <button
        aria-label="Close notification"
        className="text-muted hover:text-foreground rounded-sm p-0.5 transition-colors"
        onClick={() => removeToast(item.id)}
        type="button"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function addToast(input: ToastInput & { variant: ToastVariant }) {
  const id = crypto.randomUUID();
  const item: ToastItem = {
    description: input.description,
    id,
    title: input.title,
    variant: input.variant,
  };

  toasts = [item, ...toasts].slice(0, 4);
  emitToasts();

  toastTimers.set(
    id,
    setTimeout(() => removeToast(id), 4000),
  );
}

function removeToast(id: string) {
  const timer = toastTimers.get(id);

  if (timer) {
    clearTimeout(timer);
    toastTimers.delete(id);
  }

  toasts = toasts.filter((toastItem) => toastItem.id !== id);
  emitToasts();
}

function emitToasts() {
  toastListeners.forEach((listener) => listener(toasts));
}
