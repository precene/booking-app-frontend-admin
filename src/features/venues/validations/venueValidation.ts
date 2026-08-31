import { z } from "zod";

export const venueSchema = z.object({
  active: z.boolean().optional(),
  address: z.string().trim().min(1, "Address is required").max(500, "Address is too long"),
  cityId: z.string().uuid("City is required"),
  contactEmail: z
    .string()
    .trim()
    .email("Invalid contact email")
    .max(254, "Contact email is too long")
    .optional(),
  contactPhone: z
    .string()
    .trim()
    .min(1, "Contact phone is required")
    .max(64, "Contact phone is too long"),
  name: z.string().trim().min(1, "Venue name is required").max(160, "Venue name is too long"),
});

export const venueScreenSetupSchema = z
  .object({
    active: z.boolean(),
    columns: z.number().int().min(1, "Columns are required").max(50, "Columns cannot exceed 50"),
    layoutName: z
      .string()
      .trim()
      .min(1, "Layout name is required")
      .max(120, "Layout name is too long"),
    name: z.string().trim().min(1, "Screen name is required").max(80, "Screen name is too long"),
    rows: z.number().int().min(1, "Rows are required").max(40, "Rows cannot exceed 40"),
    screenType: z.enum(["flat", "curved"]),
    seats: z
      .array(
        z.object({
          positionX: z.number().int().min(1).max(32767),
          positionY: z.number().int().min(1).max(32767),
          status: z.enum(["seat", "disabled"]),
        }),
      )
      .min(1, "At least one seat is required")
      .max(2000, "A layout cannot contain more than 2000 seats"),
    sortOrder: z.number().int().min(0).max(32767),
  })
  .refine((screen) => screen.seats.every((seat) => seat.positionY <= screen.rows), {
    message: "Seat row is outside the layout grid",
    path: ["seats"],
  })
  .refine((screen) => screen.seats.every((seat) => seat.positionX <= screen.columns), {
    message: "Seat column is outside the layout grid",
    path: ["seats"],
  });

export const venueScreensSetupSchema = z
  .array(venueScreenSetupSchema)
  .min(1, "At least one screen is required")
  .max(10, "A venue can be created with up to 10 screens at a time");
