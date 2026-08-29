import { cn } from "#/shared/utils/cn";

type MovieStatusBadgeProps = {
  active: boolean;
};

export function MovieStatusBadge({ active }: MovieStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium",
        active ? "bg-success/10 text-success" : "bg-muted/10 text-muted",
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
