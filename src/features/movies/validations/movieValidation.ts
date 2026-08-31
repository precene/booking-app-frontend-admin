import { z } from "zod";
import { DateTime } from "luxon";

const releaseDateSchema = z
  .string()
  .trim()
  .superRefine((value, context) => {
    if (!value) {
      context.addIssue({ code: "custom", message: "Release date is required" });
      return;
    }

    if (!isTodayOrFutureDate(value)) {
      context.addIssue({ code: "custom", message: "Release date cannot be in the past" });
    }
  });

const trailerUrlSchema = z
  .string()
  .trim()
  .superRefine((value, context) => {
    if (!value) {
      context.addIssue({ code: "custom", message: "Trailer URL is required" });
      return;
    }

    if (value.length > 2048) {
      context.addIssue({
        code: "custom",
        message: "Trailer URL must be at most 2048 characters",
      });
      return;
    }

    if (!isValidUrl(value)) {
      context.addIssue({ code: "custom", message: "Trailer URL must be a valid URL" });
    }
  });

const creditListSchema = z
  .array(z.string().trim().min(1, "Credit name is required").max(80))
  .max(30, "At most 30 names are allowed")
  .optional();

export const movieSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  overview: z.string().trim().min(1, "Overview is required").max(5000),
  posterUrl: z.string().trim().min(1, "Poster URL is required").max(2048),
  coverImage: z.string().trim().min(1, "Cover image URL is required").max(2048),
  trailerUrl: trailerUrlSchema,
  durationMinutes: z
    .number()
    .int()
    .min(1, "Duration must be at least 1 minute")
    .max(600, "Duration must be at most 600 minutes"),
  ageRating: z.string().trim().min(1, "Age rating is required").max(20),
  genre: z.string().trim().min(1, "Genre is required").max(50),
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

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
