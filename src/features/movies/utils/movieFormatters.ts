import { DateTime } from "luxon";

export function formatMovieDuration(durationMinutes: number) {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (!hours) {
    return `${minutes}m`;
  }

  if (!minutes) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function formatMovieDate(date: string | null) {
  if (!date) {
    return "Not set";
  }

  const parsedDate = DateTime.fromISO(date);

  if (!parsedDate.isValid) {
    return "Invalid date";
  }

  return parsedDate.toFormat("dd LLL yyyy");
}

export function formatOptionalMovieValue(value: string | null, fallback = "Not set") {
  return value?.trim() ? value : fallback;
}
