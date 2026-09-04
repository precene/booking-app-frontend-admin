import { DateTime } from "luxon";
import { z } from "zod";

const releaseDateSchema = z
  .string()
  .trim()
  .superRefine((value, context) => {
    if (!value) {
      context.addIssue({ code: "custom", message: "Release Date Is Required" });
      return;
    }

    if (!isTodayOrFutureDate(value)) {
      context.addIssue({ code: "custom", message: "Release Date Cannot Be In The Past" });
    }
  });

const urlFieldSchema = (label: string) =>
  z
    .string()
    .trim()
    .superRefine((value, context) => {
      if (!value) {
        context.addIssue({ code: "custom", message: `${label} Is Required` });
        return;
      }

      if (value.length > 2048) {
        context.addIssue({
          code: "custom",
          message: `${label} Must Be At Most 2048 Characters`,
        });
        return;
      }

      if (!isValidUrl(value)) {
        context.addIssue({ code: "custom", message: `${label} Must Be A Valid URL` });
      }
    });

const creditListSchema = z
  .array(z.string().trim().min(1, "Credit Name Is Required").max(80, "Credit Name Is Too Long"))
  .max(30, "At Most 30 Names Are Allowed")
  .optional();

export const movieSchema = z.object({
  title: z.string().trim().min(1, "Title Is Required").max(255, "Title Is Too Long"),
  overview: z.string().trim().min(1, "Overview Is Required").max(5000, "Overview Is Too Long"),
  posterUrl: urlFieldSchema("Poster URL"),
  coverImage: urlFieldSchema("Cover Image URL"),
  trailerUrl: urlFieldSchema("Trailer URL"),
  durationMinutes: z
    .number()
    .int()
    .min(1, "Duration Must Be At Least 1 Minute")
    .max(600, "Duration Must Be At Most 600 Minutes"),
  ageRating: z.string().trim().min(1, "Age Rating Is Required").max(20, "Age Rating Is Too Long"),
  genre: z.string().trim().min(1, "Genre Is Required").max(50, "Genre Is Too Long"),
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
