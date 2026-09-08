import { z } from "zod";

export const bookingFiltersSchema = z.object({
  userId: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.union([z.string().uuid("Use a valid user ID."), z.literal("")]),
  ),
});

export type BookingFiltersFormValues = z.infer<typeof bookingFiltersSchema>;
