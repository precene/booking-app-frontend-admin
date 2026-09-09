import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import {
  showtimeFormSchema,
  showtimeSchema,
  showtimeStatusSchema,
  showtimeUpdateSchema,
} from "../validations/showtimeValidation";

const movieId = "movie-1";
const screenId = "screen-1";
const venueId = "venue-1";

describe("showtime validation", () => {
  it("accepts a showtime with movie, screen, start date, and seat category price overrides", () => {
    const startsAt = DateTime.now().plus({ days: 1 }).toUTC().toISO() ?? "";

    const validation = showtimeSchema.safeParse({
      movieId,
      priceOverrides: [
        {
          categoryId: "category-1",
          priceMinor: 1200,
        },
      ],
      screenId,
      startsAt,
    });

    expect(validation.success).toBe(true);
  });

  it("rejects missing movie", () => {
    const validation = showtimeSchema.safeParse({
      movieId: "",
      screenId,
      startsAt: DateTime.now().plus({ days: 1 }).toUTC().toISO() ?? "",
    });

    expectValidationMessage(validation, "Movie is required.");
  });

  it("rejects missing screen", () => {
    const validation = showtimeSchema.safeParse({
      movieId,
      screenId: "",
      startsAt: DateTime.now().plus({ days: 1 }).toUTC().toISO() ?? "",
    });

    expectValidationMessage(validation, "Screen is required.");
  });

  it("rejects missing start date and time", () => {
    const validation = showtimeSchema.safeParse({
      movieId,
      screenId,
      startsAt: "",
    });

    expectValidationMessage(validation, "Start date and time is required.");
  });

  it("rejects an invalid start date and time", () => {
    const validation = showtimeSchema.safeParse({
      movieId,
      screenId,
      startsAt: "tomorrow evening",
    });

    expectValidationMessage(validation, "Start date and time is invalid.");
  });

  it("rejects negative seat category price overrides", () => {
    const startsAt = DateTime.now().plus({ days: 1 }).toUTC().toISO() ?? "";

    const validation = showtimeSchema.safeParse({
      movieId,
      priceOverrides: [
        {
          categoryId: "category-1",
          priceMinor: -1,
        },
      ],
      screenId,
      startsAt,
    });

    expectValidationMessage(validation, "Price must be zero or greater.");
  });

  it("rejects missing category id in price overrides", () => {
    const startsAt = DateTime.now().plus({ days: 1 }).toUTC().toISO() ?? "";

    const validation = showtimeSchema.safeParse({
      movieId,
      priceOverrides: [
        {
          categoryId: "",
          priceMinor: 1200,
        },
      ],
      screenId,
      startsAt,
    });

    expectValidationMessage(validation, "Category is required.");
  });

  it("requires at least one field when updating a showtime", () => {
    const validation = showtimeUpdateSchema.safeParse({});

    expect(validation.success).toBe(false);
    if (validation.success) throw new Error("Expected showtime update validation to fail.");

    expect(validation.error.issues[0]?.message).toBe("At least one showtime field is required.");
  });

  it("accepts movie updates", () => {
    const validation = showtimeUpdateSchema.safeParse({
      movieId,
    });

    expect(validation.success).toBe(true);
  });

  it("accepts start date and time updates", () => {
    const validation = showtimeUpdateSchema.safeParse({
      startsAt: DateTime.now().plus({ days: 2 }).toUTC().toISO() ?? "",
    });

    expect(validation.success).toBe(true);
  });

  it("accepts scheduled, live, and completed statuses for updates", () => {
    ["scheduled", "live", "completed"].forEach((status) => {
      expect(showtimeUpdateSchema.safeParse({ status }).success).toBe(true);
    });
  });

  it("allows scheduled, live, completed, and cancelled statuses for filtering", () => {
    expect(showtimeStatusSchema.options).toEqual(["scheduled", "live", "completed", "cancelled"]);
  });

  it("does not allow cancelled status in update payloads", () => {
    const validation = showtimeUpdateSchema.safeParse({
      status: "cancelled",
    });

    expect(validation.success).toBe(false);
  });
});

describe("showtime form validation", () => {
  it("accepts valid form fields", () => {
    const validation = showtimeFormSchema.safeParse({
      date: DateTime.now().plus({ days: 1 }).toISODate() ?? "",
      movieId,
      priceOverrides: {},
      screenId,
      time: "19:30",
      venueId,
    });

    expect(validation.success).toBe(true);
  });

  it("rejects missing form movie", () => {
    const validation = showtimeFormSchema.safeParse({
      date: DateTime.now().plus({ days: 1 }).toISODate() ?? "",
      movieId: "",
      priceOverrides: {},
      screenId,
      time: "19:30",
      venueId,
    });

    expectValidationMessage(validation, "Movie is required.");
  });

  it("rejects missing form venue", () => {
    const validation = showtimeFormSchema.safeParse({
      date: DateTime.now().plus({ days: 1 }).toISODate() ?? "",
      movieId,
      priceOverrides: {},
      screenId,
      time: "19:30",
      venueId: "",
    });

    expectValidationMessage(validation, "Venue is required.");
  });

  it("rejects missing form screen", () => {
    const validation = showtimeFormSchema.safeParse({
      date: DateTime.now().plus({ days: 1 }).toISODate() ?? "",
      movieId,
      priceOverrides: {},
      screenId: "",
      time: "19:30",
      venueId,
    });

    expectValidationMessage(validation, "Screen is required.");
  });

  it("rejects missing form date", () => {
    const validation = showtimeFormSchema.safeParse({
      date: "",
      movieId,
      priceOverrides: {},
      screenId,
      time: "19:30",
      venueId,
    });

    expectValidationMessage(validation, "Date is required.");
  });

  it("rejects missing form start time", () => {
    const validation = showtimeFormSchema.safeParse({
      date: DateTime.now().plus({ days: 1 }).toISODate() ?? "",
      movieId,
      priceOverrides: {},
      screenId,
      time: "",
      venueId,
    });

    expectValidationMessage(validation, "Start time is required.");
  });
});

function expectValidationMessage(
  validation:
    | ReturnType<typeof showtimeFormSchema.safeParse>
    | ReturnType<typeof showtimeSchema.safeParse>
    | ReturnType<typeof showtimeUpdateSchema.safeParse>,
  message: string,
) {
  expect(validation.success).toBe(false);
  if (validation.success) throw new Error("Expected showtime validation to fail.");

  expect(validation.error.issues[0]?.message).toBe(message);
}
