import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const citySchema = z.object({
  name: z.string().trim().min(1, "City Name Is Required").max(160, "City Name Is Too Long"),
  slug: z
    .string()
    .trim()
    .regex(slugPattern, "Use Lowercase Letters, Numbers, And Hyphens Only")
    .max(80, "Slug Is Too Long")
    .optional(),
  active: z.boolean().optional(),
});
