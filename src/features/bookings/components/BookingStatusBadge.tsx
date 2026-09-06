import type { BookingStatus } from "../types/bookingTypes";
import { bookingStatusLabels } from "../utils/bookingFormatters";

import { cn } from "#/shared/utils/cn";

type BookingStatusBadgeProps = {
  status: BookingStatus;
};

const statusStyles: Record<BookingStatus, string> = {
  cancelled: "bg-destructive/10 text-destructive ring-destructive/20",
  expired: "bg-surface-muted text-muted ring-border",
  failed: "bg-destructive/10 text-destructive ring-destructive/20",
  paid: "bg-teal-50 text-teal-700 ring-teal-200",
  pending: "bg-primary/10 text-primary ring-primary/20",
  refunded: "bg-secondary/10 text-secondary ring-secondary/20",
};

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        statusStyles[status],
      )}
    >
      {bookingStatusLabels[status]}
    </span>
  );
}
