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
    return "Invalid date";
  }

  return date.toFormat("dd LLL yyyy");
}
