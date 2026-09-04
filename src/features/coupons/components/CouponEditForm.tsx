import { Link } from "@tanstack/react-router";
import { DateTime } from "luxon";
import { ArrowLeft, CalendarRange, Percent, Save, TicketPercent } from "lucide-react";
import type { SubmitEvent } from "react";

import type { Coupon, CouponUpdatePayload } from "../types/couponTypes";
import { formatCouponDiscount, formatCouponUsage } from "../utils/couponFormatters";

import { Button } from "#/shared/components/ui/button";
import { Checkbox } from "#/shared/components/ui/checkbox";
import { DatePicker } from "#/shared/components/ui/date-picker";
import { Form } from "#/shared/components/ui/form";
import { Input } from "#/shared/components/ui/input";
import { Label } from "#/shared/components/ui/label";
import type { FormValidationErrors } from "#/shared/utils/getFormValidationErrors";

export type CouponEditFormValues = {
  active: boolean;
  maxUses: string;
  validUntil: string;
};

export type CouponEditFormErrors = FormValidationErrors<CouponUpdatePayload>;

type CouponEditFormProps = {
  coupon: Coupon;
  couponForm: CouponEditFormValues;
  description: string;
  errors: CouponEditFormErrors;
  formId: string;
  isSubmitting: boolean;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onUpdateField: <TField extends keyof CouponEditFormValues>(
    field: TField,
    value: CouponEditFormValues[TField],
  ) => void;
  submitLabel: string;
  submittingLabel: string;
  title: string;
};

export function CouponEditForm({
  coupon,
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
}: CouponEditFormProps) {
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

            <dl className="grid gap-5 sm:grid-cols-2">
              <InfoItem label="Coupon Code" value={coupon.code} />
              <InfoItem label="Usage" value={formatCouponUsage(coupon)} />
              <InfoItem label="Description" value={coupon.description ?? "Not Set"} />
            </dl>
          </div>

          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Percent className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">Discount Rule</h3>
            </div>

            <dl className="grid gap-5 sm:grid-cols-2">
              <InfoItem
                label="Discount Type"
                value={coupon.discountPercent !== null ? "Percent" : "Fixed Amount"}
              />
              <InfoItem label="Discount" value={formatCouponDiscount(coupon)} />
            </dl>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <CalendarRange className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">Availability</h3>
            </div>

            <div className="space-y-5">
              <label className="flex items-start gap-3">
                <Checkbox
                  checked={couponForm.active}
                  id="active"
                  onCheckedChange={(checked) => onUpdateField("active", checked === true)}
                />

                <span>
                  <span className="block text-sm font-medium">Active Coupon</span>
                  <span className="text-muted mt-1 block text-sm">
                    Active Coupons Can Be Validated And Applied During Booking.
                  </span>
                </span>
              </label>

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

export function getCouponEditFormValues(coupon: Coupon): CouponEditFormValues {
  return {
    active: coupon.active,
    maxUses: coupon.maxUses === null ? "" : String(coupon.maxUses),
    validUntil: coupon.validUntil ? (DateTime.fromISO(coupon.validUntil).toISODate() ?? "") : "",
  };
}

export function getCouponUpdatePayload(formValues: CouponEditFormValues): CouponUpdatePayload {
  return {
    active: formValues.active,
    maxUses: formValues.maxUses ? Number(formValues.maxUses) : null,
    validUntil: formValues.validUntil ? toEndOfDayIso(formValues.validUntil) : null,
  };
}

type InfoItemProps = {
  label: string;
  value: string;
};

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <dt className="text-muted text-xs font-medium uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

function toEndOfDayIso(value: string) {
  const date = DateTime.fromISO(value);

  return date.isValid ? (date.endOf("day").toUTC().toISO() ?? undefined) : undefined;
}
