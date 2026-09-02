import { Link } from "@tanstack/react-router";
import { DateTime } from "luxon";
import { ArrowLeft, CalendarRange, Percent, Save, TicketPercent } from "lucide-react";
import type { SubmitEvent } from "react";

import type { CouponPayload } from "../types/couponTypes";
import type { CouponDiscountType } from "../validations/couponValidation";

import { Button } from "#/shared/components/ui/button";
import { DatePicker } from "#/shared/components/ui/date-picker";
import { Form } from "#/shared/components/ui/form";
import { Input } from "#/shared/components/ui/input";
import { Label } from "#/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/shared/components/ui/select";
import { Textarea } from "#/shared/components/ui/textarea";
import type { FormValidationErrors } from "#/shared/utils/getFormValidationErrors";

export type CouponFormValues = {
  code: string;
  description: string;
  discountAmount: string;
  discountPercent: string;
  discountType: CouponDiscountType;
  maxUses: string;
  validFrom: string;
  validUntil: string;
};

export type CouponFormErrors = FormValidationErrors<CouponPayload>;

type CouponFormProps = {
  couponForm: CouponFormValues;
  description: string;
  errors: CouponFormErrors;
  formId: string;
  isSubmitting: boolean;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onUpdateField: <TField extends keyof CouponFormValues>(
    field: TField,
    value: CouponFormValues[TField],
  ) => void;
  submitLabel: string;
  submittingLabel: string;
  title: string;
};

export const initialCouponFormValues: CouponFormValues = {
  code: "",
  description: "",
  discountAmount: "",
  discountPercent: "",
  discountType: "percent",
  maxUses: "",
  validFrom: DateTime.now().toISODate() ?? "",
  validUntil: "",
};

export function CouponForm({
  couponForm,
  description,
  errors,
  formId,
  isSubmitting,
  onSubmit,
  onUpdateField,
  submitLabel,
  submittingLabel,
  title,
}: CouponFormProps) {
  const discountError =
    couponForm.discountType === "percent" ? errors.discountPercent : errors.discountAmountMinor;

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button asChild aria-label="Back to coupons" size="icon" variant="ghost">
              <Link to="/coupons">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>

            <h2 className="text-3xl font-semibold tracking-normal">{title}</h2>
          </div>

          <p className="text-muted mt-2 text-sm">{description}</p>
        </div>

        <Button disabled={isSubmitting} form={formId} type="submit">
          <Save className="size-4" />
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>

      <Form
        className="grid gap-6 xl:grid-cols-[1fr_22rem]"
        disabled={isSubmitting}
        id={formId}
        noValidate
        onSubmit={onSubmit}
      >
        <div className="space-y-6">
          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <TicketPercent className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">Coupon Details</h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  aria-describedby={errors.code ? "code-error" : undefined}
                  aria-invalid={Boolean(errors.code)}
                  id="code"
                  name="code"
                  onChange={(event) => onUpdateField("code", event.target.value)}
                  placeholder="DASHAIN25"
                  value={couponForm.code}
                />

                {errors.code ? (
                  <p className="text-destructive text-sm" id="code-error">
                    {errors.code}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUses">Max Uses</Label>
                <Input
                  aria-describedby={errors.maxUses ? "max-uses-error" : undefined}
                  aria-invalid={Boolean(errors.maxUses)}
                  id="maxUses"
                  min={1}
                  name="maxUses"
                  onChange={(event) => onUpdateField("maxUses", event.target.value)}
                  placeholder="100"
                  type="number"
                  value={couponForm.maxUses}
                />

                {errors.maxUses ? (
                  <p className="text-destructive text-sm" id="max-uses-error">
                    {errors.maxUses}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  aria-describedby={errors.description ? "description-error" : undefined}
                  aria-invalid={Boolean(errors.description)}
                  id="description"
                  name="description"
                  onChange={(event) => onUpdateField("description", event.target.value)}
                  placeholder="Short Internal Note About This Coupon"
                  value={couponForm.description}
                />

                {errors.description ? (
                  <p className="text-destructive text-sm" id="description-error">
                    {errors.description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Percent className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">Discount Rule</h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <Select
                  onValueChange={(value) =>
                    onUpdateField("discountType", value as CouponDiscountType)
                  }
                  value={couponForm.discountType}
                >
                  <SelectTrigger id="discountType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent</SelectItem>
                    <SelectItem value="amount">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  {couponForm.discountType === "percent" ? "Discount Percent" : "Discount Amount"}
                </Label>
                <Input
                  aria-describedby={discountError ? "discount-value-error" : undefined}
                  aria-invalid={Boolean(discountError)}
                  id="discountValue"
                  min={1}
                  name="discountValue"
                  onChange={(event) =>
                    onUpdateField(
                      couponForm.discountType === "percent" ? "discountPercent" : "discountAmount",
                      event.target.value,
                    )
                  }
                  placeholder={couponForm.discountType === "percent" ? "25" : "500"}
                  type="number"
                  value={
                    couponForm.discountType === "percent"
                      ? couponForm.discountPercent
                      : couponForm.discountAmount
                  }
                />

                {discountError ? (
                  <p className="text-destructive text-sm" id="discount-value-error">
                    {discountError}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <CalendarRange className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">Validity</h3>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Start Date</Label>
                <DatePicker
                  aria-describedby={errors.validFrom ? "valid-from-error" : undefined}
                  aria-invalid={Boolean(errors.validFrom)}
                  id="validFrom"
                  name="validFrom"
                  onValueChange={(value) => onUpdateField("validFrom", value)}
                  value={couponForm.validFrom}
                />

                {errors.validFrom ? (
                  <p className="text-destructive text-sm" id="valid-from-error">
                    {errors.validFrom}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="validUntil">End Date</Label>
                  <Button
                    disabled={!couponForm.validUntil}
                    onClick={() => onUpdateField("validUntil", "")}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Clear
                  </Button>
                </div>

                <DatePicker
                  aria-describedby={errors.validUntil ? "valid-until-error" : undefined}
                  aria-invalid={Boolean(errors.validUntil)}
                  id="validUntil"
                  min={couponForm.validFrom}
                  name="validUntil"
                  onValueChange={(value) => onUpdateField("validUntil", value)}
                  value={couponForm.validUntil}
                />

                {errors.validUntil ? (
                  <p className="text-destructive text-sm" id="valid-until-error">
                    {errors.validUntil}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </aside>
      </Form>
    </>
  );
}

export function getCouponPayload(formValues: CouponFormValues): CouponPayload {
  return {
    code: formValues.code.trim().toUpperCase(),
    description: toOptionalString(formValues.description),
    discountAmountMinor:
      formValues.discountType === "amount" ? toMinorAmount(formValues.discountAmount) : undefined,
    discountPercent:
      formValues.discountType === "percent" ? Number(formValues.discountPercent) : undefined,
    maxUses: formValues.maxUses ? Number(formValues.maxUses) : null,
    validFrom: toStartOfDayIso(formValues.validFrom),
    validUntil: formValues.validUntil ? toEndOfDayIso(formValues.validUntil) : null,
  };
}

function toOptionalString(value: string | undefined) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : undefined;
}

function toMinorAmount(value: string) {
  return Math.round(Number(value) * 100);
}

function toStartOfDayIso(value: string) {
  const date = DateTime.fromISO(value);

  return date.isValid ? (date.startOf("day").toUTC().toISO() ?? undefined) : undefined;
}

function toEndOfDayIso(value: string) {
  const date = DateTime.fromISO(value);

  return date.isValid ? (date.endOf("day").toUTC().toISO() ?? undefined) : undefined;
}
