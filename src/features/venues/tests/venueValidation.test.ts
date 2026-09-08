import { describe, expect, it } from "vitest";

import {
  venueScreenSetupSchema,
  venueScreensSetupSchema,
} from "../validations/venueValidation";

const categoryId = "11111111-1111-4111-8111-111111111111";

function createScreen(index: number) {
  return {
    active: true,
    columns: 4,
    layoutName: `Layout ${index}`,
    name: `Screen ${index}`,
    rows: 3,
    screenType: "flat" as const,
    seats: [
      {
        categoryId,
        positionX: 1,
        positionY: 1,
        status: "seat" as const,
      },
      {
        positionX: 2,
        positionY: 1,
        status: "disabled" as const,
      },
    ],
    sortOrder: index,
  };
}

describe("venue screen validation", () => {
  it("accepts multiple screens with different layouts and seat categories", () => {
    const validation = venueScreensSetupSchema.safeParse([
      createScreen(1),
      {
        ...createScreen(2),
        columns: 5,
        layoutName: "Premium Layout",
        screenType: "curved",
      },
    ]);

    expect(validation.success).toBe(true);
  });

  it("limits venue creation to ten screens at a time", () => {
    const validation = venueScreensSetupSchema.safeParse(
      Array.from({ length: 11 }, (_, index) => createScreen(index + 1)),
    );

    expect(validation.success).toBe(false);
    if (validation.success) throw new Error("Expected venue screens validation to fail.");

    expect(validation.error.issues[0]?.message).toBe(
      "A venue can be created with up to 10 screens at a time.",
    );
  });

  it("rejects seats outside the configured layout grid", () => {
    const validation = venueScreenSetupSchema.safeParse({
      ...createScreen(1),
      columns: 3,
      seats: [
        {
          positionX: 4,
          positionY: 1,
          status: "seat" as const,
        },
      ],
    });

    expect(validation.success).toBe(false);
    if (validation.success) throw new Error("Expected venue screen validation to fail.");

    expect(validation.error.issues[0]?.message).toBe("Seat column is outside the layout grid.");
  });

  it("requires at least one physical seat or disabled seat definition", () => {
    const validation = venueScreenSetupSchema.safeParse({
      ...createScreen(1),
      seats: [],
    });

    expect(validation.success).toBe(false);
    if (validation.success) throw new Error("Expected venue screen validation to fail.");

    expect(validation.error.issues[0]?.message).toBe("At least one seat is required.");
  });
});
