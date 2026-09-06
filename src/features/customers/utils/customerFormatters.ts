import { DateTime } from "luxon";

export function formatCustomerDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  const dateTime = DateTime.fromISO(value);

  return dateTime.isValid ? dateTime.toFormat("dd LLL yyyy, hh:mm a") : "Invalid date";
}

export function formatOptionalCustomerValue(value: string | null | undefined) {
  return value?.trim() ? value : "Not set";
}

export function formatShortCustomerId(id: string) {
  return id.slice(0, 8);
}
