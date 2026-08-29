import { DateTime } from "luxon";
import { z } from "zod";

export const showtimeStatusSchema = z.enum(["scheduled", "live", "completed", "cancelled"]);

export const showtimeFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  movieId: z.string().min(1, "Movie is required"),
  screenId: z.string().min(1, "Screen is required"),
  time: z.string().min(1, "Start time is required"),
  venueId: z.string().min(1, "Venue is required"),
});

export const showtimeSchema = z.object({
  movieId: z.string().min(1, "Movie is required"),
  screenId: z.string().min(1, "Screen is required"),
  startsAt: z
    .string()
    .min(1, "Start date and time is required")
    .refine((value) => DateTime.fromISO(value).isValid, "Start date and time is invalid"),
});

export const showtimeUpdateSchema = showtimeSchema
  .extend({
    status: z.enum(["scheduled", "live", "completed"]).optional(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one showtime field is required",
  });
