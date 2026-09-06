import type { PaymentStatus } from "../types/paymentTypes";
import { paymentStatusLabels } from "../utils/paymentFormatters";

import { cn } from "#/shared/utils/cn";

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
};

const statusStyles: Record<PaymentStatus, string> = {
  failed: "bg-destructive/10 text-destructive ring-destructive/20",
  partially_refunded: "bg-secondary/10 text-secondary ring-secondary/20",
  pending: "bg-primary/10 text-primary ring-primary/20",
  refunded: "bg-surface-muted text-muted ring-border",
  succeeded: "bg-teal-50 text-teal-700 ring-teal-200",
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        statusStyles[status],
      )}
    >
      {paymentStatusLabels[status]}
    </span>
  );
}
