type CouponStatusBadgeProps = {
  active: boolean;
};

export function CouponStatusBadge({ active }: CouponStatusBadgeProps) {
  return (
    <span
      className={
        active
          ? "inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 ring-1 ring-teal-200"
          : "bg-surface-muted text-muted ring-border inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1"
      }
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
