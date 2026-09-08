import { z } from "zod";

export const paymentFiltersSchema = z.object({
  query: z.string().trim().max(200, "Search must be 200 characters or less."),
});

export type PaymentFiltersFormValues = z.infer<typeof paymentFiltersSchema>;

export const createRefundSchema = z.object({
  bookingId: z.string().trim().uuid("Use a valid booking ID."),
  reason: z.enum(["requested", "cancelled_by_venue", "policy", "duplicate", "other"]),
});

export type CreateRefundFormValues = z.infer<typeof createRefundSchema>;
