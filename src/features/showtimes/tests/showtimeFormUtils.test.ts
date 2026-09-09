import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import type { SeatCategory } from "#/features/venues/types/seatCategoryTypes";
import type { Venue } from "#/features/venues/types/venueTypes";
import {
  getShowtimePayload,
  initialShowtimeFormValues,
  type ShowtimeFormValues,
} from "../utils/showtimeFormUtils";

const timezone = "Europe/London";

describe("showtime form utilities", () => {
  it("builds a create showtime payload from form values", () => {
    const localDateTime = DateTime.now()
      .setZone(timezone)
      .plus({ days: 1 })
      .set({ hour: 19, millisecond: 0, minute: 30, second: 0 });

    const payload = getShowtimePayload(
      {
        ...initialShowtimeFormValues,
        date: localDateTime.toISODate() ?? "",
        movieId: "movie-1",
        screenId: "screen-1",
        time: "19:30",
        venueId: "venue-1",
      },
      createVenue(),
    );

    expect(payload).toEqual({
      movieId: "movie-1",
      screenId: "screen-1",
      startsAt: localDateTime.toUTC().toISO(),
    });
  });

  it("returns an empty start time when date and time cannot be combined", () => {
    const payload = getShowtimePayload(
      {
        ...initialShowtimeFormValues,
        date: "",
        movieId: "movie-1",
        screenId: "screen-1",
        time: "19:30",
        venueId: "venue-1",
      },
      createVenue(),
    );

    expect(payload.startsAt).toBe("");
  });

  it("converts changed category override values into minor units", () => {
    const payload = getShowtimePayload(createFormValues({ "category-1": "15.75" }), createVenue(), [
      createSeatCategory({ defaultPriceMinor: 1200, id: "category-1" }),
    ]);

    expect(payload.priceOverrides).toEqual([
      {
        categoryId: "category-1",
        priceMinor: 1575,
      },
    ]);
  });

  it("excludes unchanged category override values", () => {
    const payload = getShowtimePayload(createFormValues({ "category-1": "12" }), createVenue(), [
      createSeatCategory({ defaultPriceMinor: 1200, id: "category-1" }),
    ]);

    expect(payload).not.toHaveProperty("priceOverrides");
  });

  it("uses the default category price when override value is empty", () => {
    const payload = getShowtimePayload(createFormValues({ "category-1": "" }), createVenue(), [
      createSeatCategory({ defaultPriceMinor: 1200, id: "category-1" }),
    ]);

    expect(payload).not.toHaveProperty("priceOverrides");
  });

  it("preserves zero override when it differs from category default", () => {
    const payload = getShowtimePayload(createFormValues({ "category-1": "0" }), createVenue(), [
      createSeatCategory({ defaultPriceMinor: 1200, id: "category-1" }),
    ]);

    expect(payload.priceOverrides).toEqual([
      {
        categoryId: "category-1",
        priceMinor: 0,
      },
    ]);
  });
});

function createFormValues(priceOverrides: Record<string, string>): ShowtimeFormValues {
  const date = DateTime.now().setZone(timezone).plus({ days: 1 }).toISODate() ?? "";

  return {
    date,
    movieId: "movie-1",
    priceOverrides,
    screenId: "screen-1",
    time: "19:30",
    venueId: "venue-1",
  };
}

function createVenue(): Venue {
  const timestamp = DateTime.now().toUTC().toISO() ?? "";

  return {
    active: true,
    address: "221B Baker Street",
    cityId: "city-1",
    contactEmail: null,
    contactPhone: "020 7946 0000",
    createdAt: timestamp,
    id: "venue-1",
    name: "977Cinema London",
    timezone,
    updatedAt: timestamp,
  };
}

function createSeatCategory(overrides?: Partial<SeatCategory>): SeatCategory {
  const timestamp = DateTime.now().toUTC().toISO() ?? "";

  return {
    color: "#10b981",
    createdAt: timestamp,
    defaultPriceMinor: 1200,
    id: "category-1",
    name: "Standard",
    screenId: "screen-1",
    updatedAt: timestamp,
    usageCount: 0,
    venueId: null,
    ...overrides,
  };
}
