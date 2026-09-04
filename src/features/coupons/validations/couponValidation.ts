import { DateTime } from "luxon";
import { z } from "zod";

export const couponDiscountTypes = ["percent", "amount"] as const;

export type CouponDiscountType = (typeof couponDiscountTypes)[number];

const couponDateSchema = z
  .string()
  .trim()
  .optional()
  .superRefine((value, context) => {
    if (!value) {
      return;
    }

    const date = DateTime.fromISO(value);

    if (!date.isValid) {
      context.addIssue({ code: "custom", message: "Use a valid date" });
    }
  });

export const couponSchema = z
  .object({
    code: z.string().trim().min(1, "Coupon code is required").max(50, "Coupon code is too long"),
    description: z.string().trim().max(200, "Description is too long").optional(),
    discountAmountMinor: z.number().int().min(1, "Discount amount is required").optional(),
    discountPercent: z
      .number()
      .int()
      .min(1, "Discount percent is required")
      .max(100, "Discount percent cannot exceed 100")
      .optional(),
    maxUses: z.number().int().min(1, "Max uses must be at least 1").nullable().optional(),
    validFrom: couponDateSchema,
    validUntil: couponDateSchema.nullable(),
  })
  .superRefine((value, context) => {
    const hasPercent = value.discountPercent !== undefined;
    const hasAmount = value.discountAmountMinor !== undefined;

    if (hasPercent === hasAmount) {
      context.addIssue({
        code: "custom",
        message: "Choose either percent or fixed amount discount",
        path: ["discountPercent"],
      });
    }

    if (!value.validFrom || !value.validUntil) {
      return;
    }

    const validFrom = DateTime.fromISO(value.validFrom);
    const validUntil = DateTime.fromISO(value.validUntil);

    if (validFrom.isValid && validUntil.isValid && validUntil < validFrom) {
      context.addIssue({
        code: "custom",
        message: "End date cannot be before start date",
        path: ["validUntil"],
      });
    }
  });

export const couponUpdateSchema = z.object({
  active: z.boolean().optional(),
  maxUses: z.number().int().min(1, "Max uses must be at least 1").nullable().optional(),
  validUntil: couponDateSchema.nullable(),
});
