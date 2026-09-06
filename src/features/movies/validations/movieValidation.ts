import { DateTime } from "luxon";
import { z } from "zod";

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

const releaseDateUpdateSchema = z
  .string()
  .trim()
  .superRefine((value, context) => {
    if (!value) {
      context.addIssue({ code: "custom", message: "Release date is required" });
      return;
    }

    if (!DateTime.fromISO(value).isValid) {
      context.addIssue({ code: "custom", message: "Release date is invalid" });
    }
  });

const urlFieldSchema = (label: string) =>
  z
    .string()
    .trim()
    .superRefine((value, context) => {
      if (!value) {
        context.addIssue({ code: "custom", message: `${label} is required` });
        return;
      }

      if (value.length > 2048) {
        context.addIssue({
          code: "custom",
          message: `${label} must be at most 2048 characters`,
        });
        return;
      }

      if (!isValidUrl(value)) {
        context.addIssue({ code: "custom", message: `${label} must be a valid URL` });
      }
    });

const creditListSchema = z
  .array(z.string().trim().min(1, "Credit name is required").max(80, "Credit name is too long"))
  .max(30, "At most 30 names are allowed")
  .optional();

export const movieSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255, "Title is too long"),
  overview: z.string().trim().min(1, "Overview is required").max(5000, "Overview is too long"),
  posterUrl: urlFieldSchema("Poster URL"),
  coverImage: urlFieldSchema("Cover Image URL"),
  trailerUrl: urlFieldSchema("Trailer URL"),
  durationMinutes: z
    .number()
    .int()
    .min(1, "Duration must be at least 1 minute")
    .max(600, "Duration must be at most 600 minutes"),
  ageRating: z.string().trim().min(1, "Age rating is required").max(20, "Age rating is too long"),
  genre: z.string().trim().min(1, "Genre is required").max(50, "Genre is too long"),
  directors: creditListSchema,
  producers: creditListSchema,
  writers: creditListSchema,
  cast: creditListSchema,
  releaseDate: releaseDateSchema,
  active: z.boolean().optional(),
});

export const movieUpdateSchema = movieSchema.extend({
  releaseDate: releaseDateUpdateSchema,
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
