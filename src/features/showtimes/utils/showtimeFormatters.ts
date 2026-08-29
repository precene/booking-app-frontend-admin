import { DateTime } from "luxon";

import type { ShowStatus } from "../types/showtimeTypes";

export const showtimeStatusOptions: Array<{ label: string; value: ShowStatus }> = [
  { label: "Scheduled", value: "scheduled" },
  { label: "Live", value: "live" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export function formatShowtimeDateTime(value: string, timezone?: string) {
  const date = timezone ? DateTime.fromISO(value).setZone(timezone) : DateTime.fromISO(value);

  if (!date.isValid) {
    return "Invalid date";
  }

  return date.toFormat("dd LLL yyyy, h:mm a");
}

export function formatShowtimeTime(value: string) {
  const date = DateTime.fromISO(value);

  if (!date.isValid) {
    return "Invalid time";
  }

  return date.toFormat("h:mm a");
}

export function getShowtimeDateRangeQuery(fromDate: string, toDate: string, timezone?: string) {
  const zone = timezone || undefined;
  const from = fromDate
    ? DateTime.fromISO(fromDate, { zone }).startOf("day").toUTC().toISO()
    : undefined;
  const to = toDate
    ? DateTime.fromISO(toDate, { zone }).plus({ days: 1 }).startOf("day").toUTC().toISO()
    : undefined;

  return { from, to };
}

export function combineShowtimeDateTime(date: string, time: string, timezone: string) {
  if (!date || !time) {
    return null;
  }

  const dateTime = DateTime.fromISO(`${date}T${time}`, { zone: timezone });

  if (!dateTime.isValid) {
    return null;
  }

  return dateTime.toUTC().toISO();
}
