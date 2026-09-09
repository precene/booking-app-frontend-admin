import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import type { SeatLayout, SeatLayoutCell } from "../types/seatLayoutTypes";
import {
  createSeatLayoutCells,
  getLayoutColumns,
  getLayoutRows,
  getSeatCellsFromLayout,
  getSeatDefinitions,
  getSeatDefinitionsForDisplay,
  getSeatKey,
  getSeatLabel,
  getSeatLayoutConfig,
  getRowLabel,
} from "../utils/seatLayoutUtils";

const categoryId = "11111111-1111-4111-8111-111111111111";

describe("seat layout utilities", () => {
  it("creates one editable seat cell for each row and column", () => {
    const seats = createSeatLayoutCells(2, 3);

    expect(seats).toEqual([
      { positionX: 1, positionY: 1, status: "seat" },
      { positionX: 2, positionY: 1, status: "seat" },
      { positionX: 3, positionY: 1, status: "seat" },
      { positionX: 1, positionY: 2, status: "seat" },
      { positionX: 2, positionY: 2, status: "seat" },
      { positionX: 3, positionY: 2, status: "seat" },
    ]);
  });

  it("creates row labels beyond Z", () => {
    expect([0, 1, 25, 26, 27].map(getRowLabel)).toEqual(["A", "B", "Z", "AA", "AB"]);
  });

  it("keeps gaps out of seat definitions and renumbers remaining seats by row", () => {
    const seats: Array<SeatLayoutCell> = [
      { positionX: 1, positionY: 1, status: "seat" },
      { positionX: 4, positionY: 1, status: "seat" },
      { positionX: 5, positionY: 1, status: "disabled" },
      { positionX: 1, positionY: 2, status: "seat" },
    ];

    const definitions = getSeatDefinitions(seats);

    expect(definitions.map((seat) => seat.seatLabel)).toEqual(["A1", "A2", "A3", "B1"]);
    expect(definitions.map((seat) => seat.positionX)).toEqual([1, 4, 5, 1]);
    expect(definitions[2]).toMatchObject({
      isActive: false,
      positionX: 5,
      positionY: 1,
      rowLabel: "A",
      seatLabel: "A3",
    });
  });

  it("preserves category assignment and seat flags in generated definitions", () => {
    const definitions = getSeatDefinitions([
      {
        categoryId,
        isAccessible: true,
        isRestricted: true,
        positionX: 2,
        positionY: 1,
        section: "Balcony",
        status: "seat",
      },
    ]);

    expect(definitions[0]).toMatchObject({
      categoryId,
      isAccessible: true,
      isRestricted: true,
      section: "Balcony",
    });
  });

  it("keeps optional empty section values out of generated definitions", () => {
    const definitions = getSeatDefinitions([
      {
        positionX: 1,
        positionY: 1,
        section: "   ",
        status: "seat",
      },
    ]);

    expect(definitions[0]?.section).toBeUndefined();
  });

  it("derives editable cells and dimensions from an existing layout", () => {
    const layout = createLayout({
      config: { columns: 6, disabledSeats: ["2:1"], rows: 4 },
    });

    expect(getLayoutRows(layout)).toBe(4);
    expect(getLayoutColumns(layout)).toBe(6);
    expect(getSeatCellsFromLayout(layout)).toEqual([
      expect.objectContaining({ positionX: 1, positionY: 1, status: "seat" }),
      expect.objectContaining({ positionX: 2, positionY: 1, status: "disabled" }),
    ]);
  });

  it("falls back to maximum seat positions when layout config has no dimensions", () => {
    const layout = createLayout({
      config: {},
      seatDefs: [
        {
          categoryId: null,
          id: "66666666-6666-4666-8666-666666666666",
          isAccessible: false,
          isActive: true,
          isRestricted: false,
          positionX: 7,
          positionY: 5,
          rowLabel: "E",
          seatLabel: "E1",
          section: null,
        },
      ],
    });

    expect(getLayoutRows(layout)).toBe(5);
    expect(getLayoutColumns(layout)).toBe(7);
  });

  it("marks disabled seats inactive for display when legacy disabled-seat config exists", () => {
    const layout = createLayout({
      config: { disabledSeats: ["2:1"] },
    });

    expect(getSeatDefinitionsForDisplay(layout)).toEqual([
      expect.objectContaining({ isActive: true, positionX: 1 }),
      expect.objectContaining({ isActive: false, positionX: 2 }),
    ]);
  });

  it("returns stable keys and labels for custom layout positions", () => {
    const seats = [
      { positionX: 1, positionY: 1, status: "seat" as const },
      { positionX: 4, positionY: 1, status: "seat" as const },
    ];

    expect(getSeatKey(4, 1)).toBe("4:1");
    expect(getSeatLabel(seats, 4, 1)).toBe("A2");
    expect(getSeatLayoutConfig(8, 12, seats)).toEqual({ columns: 12, rows: 8 });
  });
});

function createLayout(overrides?: Partial<SeatLayout>): SeatLayout {
  const timestamp = DateTime.now().toUTC().toISO();

  return {
    config: {},
    createdAt: timestamp,
    id: "22222222-2222-4222-8222-222222222222",
    isActive: true,
    name: "Default Layout",
    screenId: "33333333-3333-4333-8333-333333333333",
    seatCount: 2,
    seatDefs: [
      {
        categoryId: categoryId,
        id: "44444444-4444-4444-8444-444444444444",
        isAccessible: false,
        isActive: true,
        isRestricted: false,
        positionX: 1,
        positionY: 1,
        rowLabel: "A",
        seatLabel: "A1",
        section: null,
      },
      {
        categoryId: null,
        id: "55555555-5555-4555-8555-555555555555",
        isAccessible: false,
        isActive: true,
        isRestricted: false,
        positionX: 2,
        positionY: 1,
        rowLabel: "A",
        seatLabel: "A2",
        section: null,
      },
    ],
    updatedAt: timestamp,
    ...overrides,
  };
}
