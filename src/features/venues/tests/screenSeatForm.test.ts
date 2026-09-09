import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import { getScreenSeatFormValues } from "../utils/screenSeatFormUtils";
import type { Screen } from "../types/screenTypes";
import type { SeatLayout } from "../types/seatLayoutTypes";

const timestamp = DateTime.now().toUTC().toISO() ?? "";

describe("screen seat form helpers", () => {
  it("maps an existing screen and layout into editable form values", () => {
    const values = getScreenSeatFormValues(createScreen(), createLayout());

    expect(values).toMatchObject({
      active: false,
      columns: 5,
      layoutName: "Premium Layout",
      name: "Screen 2",
      rows: 4,
      screenType: "curved",
      sortOrder: 2,
    });
    expect(values.seats).toEqual([
      expect.objectContaining({
        categoryId: "11111111-1111-4111-8111-111111111111",
        positionX: 1,
        positionY: 1,
        status: "seat",
      }),
      expect.objectContaining({
        positionX: 2,
        positionY: 1,
        status: "disabled",
      }),
    ]);
  });

  it("falls back to a default layout name and generated cells when layout is missing", () => {
    const values = getScreenSeatFormValues(createScreen(), null);

    expect(values.layoutName).toBe("Default Layout");
    expect(values.rows).toBe(1);
    expect(values.columns).toBe(1);
    expect(values.seats).toEqual([{ positionX: 1, positionY: 1, status: "seat" }]);
  });
});

function createScreen(): Screen {
  return {
    active: false,
    createdAt: timestamp,
    id: "22222222-2222-4222-8222-222222222222",
    name: "Screen 2",
    screenType: "curved",
    sortOrder: 2,
    updatedAt: timestamp,
    venueId: "33333333-3333-4333-8333-333333333333",
  };
}

function createLayout(): SeatLayout {
  return {
    config: {
      columns: 5,
      disabledSeats: ["2:1"],
      rows: 4,
    },
    createdAt: timestamp,
    id: "44444444-4444-4444-8444-444444444444",
    isActive: true,
    name: "Premium Layout",
    screenId: "22222222-2222-4222-8222-222222222222",
    seatCount: 2,
    seatDefs: [
      {
        categoryId: "11111111-1111-4111-8111-111111111111",
        id: "55555555-5555-4555-8555-555555555555",
        isAccessible: true,
        isActive: true,
        isRestricted: false,
        positionX: 1,
        positionY: 1,
        rowLabel: "A",
        seatLabel: "A1",
        section: "Balcony",
      },
      {
        categoryId: null,
        id: "66666666-6666-4666-8666-666666666666",
        isAccessible: false,
        isActive: true,
        isRestricted: true,
        positionX: 2,
        positionY: 1,
        rowLabel: "A",
        seatLabel: "A2",
        section: null,
      },
    ],
    updatedAt: timestamp,
  };
}
