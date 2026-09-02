import { DateTime } from "luxon";

import type { Coupon } from "../types/couponTypes";

export function formatCouponDiscount(
  coupon: Pick<Coupon, "discountAmountMinor" | "discountPercent">,
) {
  if (coupon.discountPercent !== null) {
    return `${coupon.discountPercent}%`;
  }

  if (coupon.discountAmountMinor !== null) {
    return formatMinorCurrency(coupon.discountAmountMinor);
  }

  return "Not Set";
}

export function formatCouponValidity(coupon: Pick<Coupon, "validFrom" | "validUntil">) {
  const from = formatCouponDate(coupon.validFrom);
  const until = coupon.validUntil ? formatCouponDate(coupon.validUntil) : "No Expiry";

  return `${from} - ${until}`;
}

export function formatCouponUsage(coupon: Pick<Coupon, "currentUses" | "maxUses">) {
  return coupon.maxUses === null
    ? `${coupon.currentUses} Used`
    : `${coupon.currentUses}/${coupon.maxUses}`;
}

export function formatCouponDate(value: string) {
  const date = DateTime.fromISO(value);

  if (!date.isValid) {
    return "Invalid Date";
  }

  return date.toFormat("dd LLL yyyy");
}

export function formatMinorCurrency(value: number) {
  return new Intl.NumberFormat("en-NP", {
    currency: "NPR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(value / 100);
}
