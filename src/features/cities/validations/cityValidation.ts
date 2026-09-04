import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const citySchema = z.object({
  name: z.string().trim().min(1, "City Name Is Required").max(160, "City Name Is Too Long"),
  slug: z
    .string()
    .trim()
    .regex(slugPattern, "Use lowercase letters, numbers, and hyphens only")
    .max(80, "Slug is too long")
    .optional(),
  active: z.boolean().optional(),
});
