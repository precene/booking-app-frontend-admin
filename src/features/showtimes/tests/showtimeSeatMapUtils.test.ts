import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import type { ShowSeat, ShowSeatStatus } from "../types/showtimeTypes";
import {
  getAssignedSeatCategories,
  getSeatMapDimensions,
  getShowSeatByPosition,
  getShowSeatCount,
  groupSeatsByRow,
  hasSeatPositions,
  mergeSeatSnapshot,
} from "../utils/showtimeSeatMapUtils";

describe("showtime seat map utilities", () => {
  it("calculates rows and columns from max seat positions", () => {
    expect(getSeatMapDimensions([createSeat({ positionX: 7, positionY: 5 })])).toEqual({
      columns: 7,
      rows: 5,
    });
  });

  it("groups seats by row and sorts seats naturally", () => {
    const groups = groupSeatsByRow([
      createSeat({ rowLabel: "B", seatLabel: "B10" }),
      createSeat({ rowLabel: "A", seatLabel: "A2" }),
      createSeat({ rowLabel: "A", seatLabel: "A1" }),
    ]);

    expect(groups).toEqual([
      {
        rowLabel: "A",
        seats: [
          expect.objectContaining({ seatLabel: "A1" }),
          expect.objectContaining({ seatLabel: "A2" }),
        ],
      },
      {
        rowLabel: "B",
        seats: [expect.objectContaining({ seatLabel: "B10" })],
      },
    ]);
  });

  it("indexes seats by grid position", () => {
    const seat = createSeat({ positionX: 3, positionY: 2 });

    expect(getShowSeatByPosition([seat]).get("3:2")).toBe(seat);
  });

  it("detects whether every seat has a valid grid position", () => {
    expect(hasSeatPositions([createSeat({ positionX: 1, positionY: 1 })])).toBe(true);
    expect(hasSeatPositions([createSeat({ positionX: 0, positionY: 1 })])).toBe(false);
  });

  it("preserves unique assigned category labels and colors", () => {
    const categories = getAssignedSeatCategories([
      createSeat({
        categoryColor: "#ef4444",
        categoryId: "vip",
        categoryName: "VIP",
      }),
      createSeat({
        categoryColor: "#ef4444",
        categoryId: "vip",
        categoryName: "VIP",
      }),
      createSeat({
        categoryColor: "#10b981",
        categoryId: "standard",
        categoryName: "Standard",
      }),
      createSeat({
        categoryColor: null,
        categoryId: null,
        categoryName: null,
      }),
    ]);

    expect(categories).toEqual([
      { color: "#10b981", id: "standard", name: "Standard" },
      { color: "#ef4444", id: "vip", name: "VIP" },
    ]);
  });

  it("counts seats by booking status", () => {
    const counts = getShowSeatCount([
      createSeat({ status: "available" }),
      createSeat({ status: "available" }),
      createSeat({ status: "held" }),
      createSeat({ status: "booked" }),
      createSeat({ status: "cancelled" }),
      createSeat({ status: "unavailable" }),
    ]);

    expect(counts).toEqual({
      available: 2,
      booked: 1,
      cancelled: 1,
      held: 1,
      unavailable: 1,
    });
  });

  it("merges realtime snapshot seats onto existing seat details", () => {
    const currentSeat = createSeat({
      blockedReason: "Cleaning",
      categoryColor: "#10b981",
      id: "seat-1",
      status: "available",
    });
    const snapshotSeat = createSeat({
      blockedReason: null,
      categoryColor: "#ef4444",
      id: "seat-1",
      status: "held",
    });

    expect(mergeSeatSnapshot([currentSeat], [snapshotSeat])).toEqual([
      expect.objectContaining({
        blockedReason: null,
        categoryColor: "#ef4444",
        id: "seat-1",
        status: "held",
      }),
    ]);
  });
});

function createSeat(overrides?: Partial<ShowSeat>): ShowSeat {
  const id = `seat-${overrides?.positionX ?? 1}-${overrides?.positionY ?? 1}-${overrides?.status ?? "available"}`;

  return {
    blockedReason: null,
    categoryColor: "#10b981",
    categoryId: "category-1",
    categoryName: "Standard",
    id,
    isAccessible: false,
    isRestricted: false,
    positionX: 1,
    positionY: 1,
    priceMinor: 1200,
    rowLabel: "A",
    section: null,
    seatLabel: "A1",
    status: "available" satisfies ShowSeatStatus,
    ...overrides,
  };
}
