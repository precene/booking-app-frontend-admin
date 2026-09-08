import { z } from "zod";

export const citySchema = z
  .object({
    name: z.string().trim().min(1, "City name is required.").max(160, "City name is too long."),
    active: z.boolean().optional(),
  })
  .superRefine((value, context) => {
    if (!value.name || slugifyCityName(value.name).length) {
      return;
    }

    context.addIssue({
      code: "custom",
      message: "City name must produce a valid URL slug.",
      path: ["name"],
    });
  });

function slugifyCityName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
