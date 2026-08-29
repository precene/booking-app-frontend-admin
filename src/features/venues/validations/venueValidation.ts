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
  contactPhone: z.string().trim().max(64, "Contact phone is too long").optional(),
  name: z.string().trim().min(1, "Venue name is required").max(160, "Venue name is too long"),
});

export const venueUpdateSchema = venueSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one venue field is required",
  });

export const venueScreenSetupSchema = z
  .object({
    active: z.boolean(),
    layoutName: z
      .string()
      .trim()
      .min(1, "Layout name is required")
      .max(120, "Layout name is too long"),
    name: z.string().trim().min(1, "Screen name is required").max(80, "Screen name is too long"),
    rows: z.number().int().min(1, "Rows are required").max(40, "Rows cannot exceed 40"),
    screenType: z.enum(["flat", "curved"]),
    seatsPerRow: z
      .number()
      .int()
      .min(1, "Seats per row are required")
      .max(50, "Seats per row cannot exceed 50"),
    sortOrder: z.number().int().min(0).max(32767),
  })
  .refine((screen) => screen.rows * screen.seatsPerRow <= 2000, {
    message: "A layout cannot contain more than 2000 seats",
    path: ["seatsPerRow"],
  });

export const venueScreensSetupSchema = z
  .array(venueScreenSetupSchema)
  .min(1, "At least one screen is required")
  .max(10, "A venue can be created with up to 10 screens at a time");

export type VenueFormValidationValues = z.infer<typeof venueSchema>;
