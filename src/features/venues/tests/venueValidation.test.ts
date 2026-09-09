import { describe, expect, it } from "vitest";

import {
  venueSchema,
  venueScreenSetupSchema,
  venueScreensSetupSchema,
} from "../validations/venueValidation";

const categoryId = "11111111-1111-4111-8111-111111111111";
const cityId = "22222222-2222-4222-8222-222222222222";

function createVenue() {
  return {
    active: true,
    address: "221B Baker Street",
    cityId,
    contactEmail: "admin@977cinema.test",
    contactPhone: "020 7946 0000",
    name: "977Cinema London",
  };
}

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

describe("venue validation", () => {
  it("accepts valid required venue fields", () => {
    const validation = venueSchema.safeParse(createVenue());

    expect(validation.success).toBe(true);
  });

  it("rejects missing venue name", () => {
    const validation = venueSchema.safeParse({
      ...createVenue(),
      name: "",
    });

    expectValidationMessage(validation, "Venue name is required.");
  });

  it("rejects missing city", () => {
    const validation = venueSchema.safeParse({
      ...createVenue(),
      cityId: "",
    });

    expectValidationMessage(validation, "City is required.");
  });

  it("rejects missing address", () => {
    const validation = venueSchema.safeParse({
      ...createVenue(),
      address: "",
    });

    expectValidationMessage(validation, "Address is required.");
  });

  it("rejects missing contact phone", () => {
    const validation = venueSchema.safeParse({
      ...createVenue(),
      contactPhone: "",
    });

    expectValidationMessage(validation, "Contact phone is required.");
  });

  it("rejects invalid contact email", () => {
    const validation = venueSchema.safeParse({
      ...createVenue(),
      contactEmail: "not-an-email",
    });

    expectValidationMessage(validation, "Invalid contact email.");
  });

  it("trims text fields before returning validated venue data", () => {
    const validation = venueSchema.safeParse({
      ...createVenue(),
      address: "  221B Baker Street  ",
      contactEmail: "  admin@977cinema.test  ",
      contactPhone: "  020 7946 0000  ",
      name: "  977Cinema London  ",
    });

    expect(validation.success).toBe(true);
    if (!validation.success) throw new Error("Expected venue validation to pass.");

    expect(validation.data).toMatchObject({
      address: "221B Baker Street",
      contactEmail: "admin@977cinema.test",
      contactPhone: "020 7946 0000",
      name: "977Cinema London",
    });
  });
});

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

  it("rejects seats outside the configured layout rows", () => {
    const validation = venueScreenSetupSchema.safeParse({
      ...createScreen(1),
      rows: 3,
      seats: [
        {
          positionX: 1,
          positionY: 4,
          status: "seat" as const,
        },
      ],
    });

    expectValidationMessage(validation, "Seat row is outside the layout grid.");
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

  it("rejects missing screen name", () => {
    const validation = venueScreenSetupSchema.safeParse({
      ...createScreen(1),
      name: "",
    });

    expectValidationMessage(validation, "Screen name is required.");
  });

  it("rejects missing layout name", () => {
    const validation = venueScreenSetupSchema.safeParse({
      ...createScreen(1),
      layoutName: "",
    });

    expectValidationMessage(validation, "Layout name is required.");
  });

  it("rejects rows below the minimum", () => {
    const validation = venueScreenSetupSchema.safeParse({
      ...createScreen(1),
      rows: 0,
    });

    expectValidationMessage(validation, "Rows are required.");
  });

  it("rejects columns below the minimum", () => {
    const validation = venueScreenSetupSchema.safeParse({
      ...createScreen(1),
      columns: 0,
    });

    expectValidationMessage(validation, "Columns are required.");
  });

  it("rejects rows above the maximum grid size", () => {
    const validation = venueScreenSetupSchema.safeParse({
      ...createScreen(1),
      rows: 26,
    });

    expectValidationMessage(validation, "Rows cannot exceed 25.");
  });

  it("rejects columns above the maximum grid size", () => {
    const validation = venueScreenSetupSchema.safeParse({
      ...createScreen(1),
      columns: 26,
    });

    expectValidationMessage(validation, "Columns cannot exceed 25.");
  });
});

function expectValidationMessage(
  validation: ReturnType<typeof venueSchema.safeParse> | ReturnType<typeof venueScreenSetupSchema.safeParse>,
  message: string,
) {
  expect(validation.success).toBe(false);
  if (validation.success) throw new Error("Expected validation to fail.");

  expect(validation.error.issues[0]?.message).toBe(message);
}
