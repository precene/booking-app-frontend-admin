import { z } from "zod";
import { DateTime } from "luxon";

const releaseDateSchema = z
  .string()
  .refine((value) => !value || isTodayOrFutureDate(value), "Release date cannot be in the past")
  .optional();

const creditListSchema = z
  .array(z.string().trim().min(1, "Credit name is required").max(80))
  .max(30, "At most 30 names are allowed")
  .optional();

export const movieSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  overview: z.string().trim().max(5000).optional(),
  posterUrl: z.string().trim().max(2048).optional(),
  coverImage: z.string().trim().max(2048).optional(),
  trailerUrl: z.string().trim().url("Trailer URL must be a valid URL").max(2048).optional(),
  durationMinutes: z
    .number()
    .int()
    .min(1, "Duration must be at least 1 minute")
    .max(600, "Duration must be at most 600 minutes"),
  ageRating: z.string().trim().max(20).optional(),
  genre: z.string().trim().max(50).optional(),
  directors: creditListSchema,
  producers: creditListSchema,
  writers: creditListSchema,
  cast: creditListSchema,
  releaseDate: releaseDateSchema,
  active: z.boolean().optional(),
});

function isTodayOrFutureDate(value: string) {
  const selectedDate = DateTime.fromISO(value);

  if (!selectedDate.isValid) {
    return false;
  }

  return selectedDate.startOf("day") >= DateTime.now().startOf("day");
}
