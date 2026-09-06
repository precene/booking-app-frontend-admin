import type { LucideIcon } from "lucide-react";

import type { DashboardMetric } from "../types/dashboardTypes";

import { cn } from "#/shared/utils/cn";

const toneClasses: Record<DashboardMetric["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

type DashboardMetricCardProps = {
  icon: LucideIcon;
  metric: DashboardMetric;
};

export function DashboardMetricCard({ icon: Icon, metric }: DashboardMetricCardProps) {
  return (
    <div className="bg-surface rounded-lg border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted text-sm font-medium">{metric.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-normal">{metric.value}</p>
        </div>

        <span className={cn("rounded-md p-2", toneClasses[metric.tone])}>
          <Icon className="size-5" />
        </span>
      </div>

      <p className="text-muted mt-4 text-sm">{metric.helperText}</p>
    </div>
  );
}
