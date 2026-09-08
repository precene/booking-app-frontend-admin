import { DateTime } from "luxon";

import type { PaymentStatus, RefundReason } from "../types/paymentTypes";

export const paymentStatusOptions: Array<{ label: string; value: PaymentStatus }> = [
  { label: "Pending", value: "pending" },
  { label: "Succeeded", value: "succeeded" },
  { label: "Failed", value: "failed" },
  // { label: "Refunded", value: "refunded" },
  // { label: "Partially Refunded", value: "partially_refunded" },
];

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  failed: "Failed",
  partially_refunded: "Partially Refunded",
  pending: "Pending",
  refunded: "Refunded",
  succeeded: "Succeeded",
};

export const refundReasonOptions: Array<{ label: string; value: RefundReason }> = [
  { label: "Requested By Customer", value: "requested" },
  { label: "Cancelled By Venue", value: "cancelled_by_venue" },
  { label: "Policy", value: "policy" },
  { label: "Duplicate", value: "duplicate" },
  { label: "Other", value: "other" },
];

export function formatPaymentDate(value: string | null) {
  if (!value) {
    return "Not Set";
  }

  const dateTime = DateTime.fromISO(value);

  return dateTime.isValid ? dateTime.toFormat("dd LLL yyyy, hh:mm a") : "Invalid Date";
}

export function formatPaymentMoney(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    currency: currency.toUpperCase(),
    style: "currency",
  }).format(amountMinor / 100);
}

export function formatCardDetails(cardBrand: string | null, cardLast4: string | null) {
  if (!cardBrand || !cardLast4) {
    return "Card not available";
  }

  return `${cardBrand.toUpperCase()} Ending ${cardLast4}`;
}

export function formatStatusText(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
