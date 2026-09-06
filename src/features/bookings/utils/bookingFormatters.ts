import { DateTime } from "luxon";

import type { BookingStatus } from "../types/bookingTypes";

export const bookingStatusOptions: Array<{ label: string; value: BookingStatus }> = [
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Cancelled", value: "cancelled" },
  // { label: "Refunded", value: "refunded" },
  { label: "Failed", value: "failed" },
  { label: "Expired", value: "expired" },
];

export const bookingStatusLabels: Record<BookingStatus, string> = {
  cancelled: "Cancelled",
  expired: "Expired",
  failed: "Failed",
  paid: "Paid",
  pending: "Pending",
  refunded: "Refunded",
};

export function formatBookingDate(value: string | null) {
  if (!value) {
    return "Not Set";
  }

  const dateTime = DateTime.fromISO(value);

  return dateTime.isValid ? dateTime.toFormat("dd LLL yyyy, hh:mm a") : "Invalid Date";
}

export function formatBookingMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    currency: currency.toUpperCase(),
    style: "currency",
  }).format(amountMinor / 100);
}

export function formatShortId(id: string) {
  return id.slice(0, 8);
}
