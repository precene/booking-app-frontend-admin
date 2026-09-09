import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import {
  combineShowtimeDateTime,
  formatShowtimeDateTime,
  formatShowtimeTime,
  getShowtimeDateRangeQuery,
} from "../utils/showtimeFormatters";

const timezone = "Europe/London";

describe("showtime formatters", () => {
  it("formats showtime date and time in the selected timezone", () => {
    const londonDate = DateTime.now()
      .setZone(timezone)
      .plus({ days: 1 })
      .set({ hour: 18, millisecond: 0, minute: 30, second: 0 });
    const startsAt = londonDate.toUTC().toISO() ?? "";

    expect(formatShowtimeDateTime(startsAt, timezone)).toBe(
      londonDate.toFormat("dd LLL yyyy, h:mm a"),
    );
  });

  it("formats only the showtime time", () => {
    const startsAt = DateTime.now()
      .plus({ days: 1 })
      .set({ hour: 20, millisecond: 0, minute: 15, second: 0 })
      .toISO() ?? "";

    expect(formatShowtimeTime(startsAt)).toBe(DateTime.fromISO(startsAt).toFormat("h:mm a"));
  });

  it("returns invalid labels for invalid date values", () => {
    expect(formatShowtimeDateTime("invalid-date", timezone)).toBe("Invalid Date");
    expect(formatShowtimeTime("invalid-date")).toBe("Invalid Time");
  });

  it("creates an exclusive UTC date range for listing showtimes", () => {
    const fromDate = DateTime.now().setZone(timezone).plus({ days: 1 }).toISODate() ?? "";
    const toDate = DateTime.now().setZone(timezone).plus({ days: 3 }).toISODate() ?? "";

    const range = getShowtimeDateRangeQuery(fromDate, toDate, timezone);

    expect(range).toEqual({
      from: DateTime.fromISO(fromDate, { zone: timezone }).startOf("day").toUTC().toISO(),
      to: DateTime.fromISO(toDate, { zone: timezone })
        .plus({ days: 1 })
        .startOf("day")
        .toUTC()
        .toISO(),
    });
  });

  it("combines local showtime date and time into a UTC ISO value", () => {
    const localDateTime = DateTime.now()
      .setZone(timezone)
      .plus({ days: 1 })
      .set({ hour: 19, millisecond: 0, minute: 45, second: 0 });

    const startsAt = combineShowtimeDateTime(localDateTime.toISODate() ?? "", "19:45", timezone);

    expect(startsAt).toBe(localDateTime.toUTC().toISO());
  });

  it("returns null when date or time cannot be combined", () => {
    expect(combineShowtimeDateTime("", "19:45", timezone)).toBeNull();
    expect(combineShowtimeDateTime(DateTime.now().toISODate() ?? "", "", timezone)).toBeNull();
    expect(combineShowtimeDateTime("not-a-date", "19:45", timezone)).toBeNull();
  });
});
