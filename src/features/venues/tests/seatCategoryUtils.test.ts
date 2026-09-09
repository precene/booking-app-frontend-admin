import { describe, expect, it } from "vitest";

import type { SeatLayoutCell } from "../types/seatLayoutTypes";
import {
  assignSeatCategory,
  getSeatCategoryFormData,
  isSeatCategoryAssigned,
} from "../utils/seatCategoryUtils";

const categoryId = "11111111-1111-4111-8111-111111111111";
const nextCategoryId = "22222222-2222-4222-8222-222222222222";

describe("seat category utilities", () => {
  it("accepts a valid category name and default price", () => {
    expect(getSeatCategoryFormData("  VIP  ", "12.50")).toEqual({
      data: {
        defaultPriceMinor: 1250,
        name: "VIP",
      },
      success: true,
    });
  });

  it("rejects a missing category name", () => {
    expect(getSeatCategoryFormData("   ", "12.50")).toEqual({
      error: "Category name is required.",
      success: false,
    });
  });

  it("rejects an invalid default price", () => {
    expect(getSeatCategoryFormData("VIP", "free")).toEqual({
      error: "Default price must be at least £1.",
      success: false,
    });
  });

  it("rejects default price below one pound", () => {
    expect(getSeatCategoryFormData("VIP", "0.99")).toEqual({
      error: "Default price must be at least £1.",
      success: false,
    });
  });

  it("assigns a selected category to a seat", () => {
    const seats = createSeats();

    expect(assignSeatCategory(seats, 1, 1, categoryId)[0]).toMatchObject({
      categoryId,
      positionX: 1,
      positionY: 1,
    });
  });

  it("clears a category when clicking the same categorized seat again", () => {
    const seats = createSeats([{ categoryId }]);

    expect(assignSeatCategory(seats, 1, 1, categoryId)[0]).toMatchObject({
      categoryId: null,
      positionX: 1,
      positionY: 1,
    });
  });

  it("replaces the previous category when assigning another category", () => {
    const seats = createSeats([{ categoryId }]);

    expect(assignSeatCategory(seats, 1, 1, nextCategoryId)[0]).toMatchObject({
      categoryId: nextCategoryId,
      positionX: 1,
      positionY: 1,
    });
  });

  it("does not apply the selected category to unrelated seats", () => {
    const seats = createSeats();

    expect(assignSeatCategory(seats, 1, 1, categoryId)[1]).toEqual(seats[1]);
  });

  it("blocks category deletion when the backend reports usage", () => {
    expect(isSeatCategoryAssigned({ id: categoryId, usageCount: 1 }, [])).toBe(true);
  });

  it("blocks category deletion when local seats still reference it", () => {
    expect(isSeatCategoryAssigned({ id: categoryId, usageCount: 0 }, [categoryId])).toBe(true);
  });

  it("allows category deletion when no backend or local seats reference it", () => {
    expect(isSeatCategoryAssigned({ id: categoryId, usageCount: 0 }, [])).toBe(false);
  });
});

function createSeats(overrides: Array<Partial<SeatLayoutCell>> = []) {
  return [
    {
      positionX: 1,
      positionY: 1,
      status: "seat",
      ...overrides[0],
    },
    {
      positionX: 2,
      positionY: 1,
      status: "seat",
      ...overrides[1],
    },
  ] satisfies Array<SeatLayoutCell>;
}
