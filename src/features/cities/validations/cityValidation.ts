import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const citySchema = z.object({
  name: z.string().trim().min(1, "City name is required").max(160, "City name is too long"),
  slug: z
    .string()
    .trim()
    .regex(slugPattern, "Use lowercase letters, numbers, and hyphens only")
    .max(80, "Slug is too long")
    .optional(),
  active: z.boolean().optional(),
});
