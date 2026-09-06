import { DateTime } from "luxon";

export function formatOptionalVenueValue(value: null | string | undefined, fallback = "Not set") {
  if (!value?.trim()) {
    return fallback;
  }

  return value;
}

export function formatVenueDate(value: string) {
  const date = DateTime.fromISO(value);

  if (!date.isValid) {
    return "Invalid Date";
  }

  return date.toFormat("dd LLL yyyy");
}

export function formatVenueMoney(amountMinor: number) {
  return new Intl.NumberFormat("en-GB", {
    currency: "GBP",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(amountMinor / 100);
}
