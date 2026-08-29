import type { ShowStatus } from "../types/showtimeTypes";

import { cn } from "#/shared/utils/cn";

type ShowtimeStatusBadgeProps = {
  status: ShowStatus;
};

const statusStyles: Record<ShowStatus, string> = {
  cancelled: "bg-destructive/10 text-destructive ring-destructive/20",
  completed: "bg-surface-muted text-muted ring-border",
  live: "bg-teal-50 text-teal-700 ring-teal-200",
  scheduled: "bg-primary/10 text-primary ring-primary/20",
};

const statusLabels: Record<ShowStatus, string> = {
  cancelled: "Cancelled",
  completed: "Completed",
  live: "Live",
  scheduled: "Scheduled",
};

export function ShowtimeStatusBadge({ status }: ShowtimeStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
