import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const citySchema = z.object({
  active: z.boolean().optional(),
  name: z.string().trim().min(1, "City name is required").max(160, "City name is too long"),
  slug: z
    .string()
    .trim()
    .regex(slugPattern, "Use lowercase letters, numbers, and hyphens only")
    .max(80, "Slug is too long")
    .optional(),
});

export const cityUpdateSchema = citySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one city field is required",
  });

export type CityFormValues = z.infer<typeof citySchema>;
