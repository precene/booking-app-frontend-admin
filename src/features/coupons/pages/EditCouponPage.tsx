import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

import {
  CouponEditForm,
  getCouponEditFormValues,
  getCouponUpdatePayload,
  type CouponEditFormErrors,
  type CouponEditFormValues,
} from "../components/CouponEditForm";
import { couponsApi } from "../services/couponsApi";
import type { Coupon } from "../types/couponTypes";
import { couponUpdateSchema } from "../validations/couponValidation";

import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import { getFormValidationErrors } from "#/shared/utils/getFormValidationErrors";

const formId = "edit-coupon-form";

const initialCouponEditFormValues: CouponEditFormValues = {
  active: true,
  maxUses: "",
  validUntil: "",
};

export default function EditCouponPage() {
  const { couponId } = useParams({ from: "/_protected/coupons/$couponId_/edit" });
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState<CouponEditFormValues>(initialCouponEditFormValues);
  const [errors, setErrors] = useState<CouponEditFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    void loadCoupon();
  }, [couponId]);

  async function loadCoupon() {
    setIsLoading(true);
    setFormError(null);

    try {
      const response = await couponsApi.get(couponId);
      const nextCoupon = response.data.promo;
      setCoupon(nextCoupon);
      setCouponForm(getCouponEditFormValues(nextCoupon));
    } catch (error) {
      setCoupon(null);
      setFormError(getApiErrorMessage(error, "Unable to load coupon details."));
    } finally {
      setIsLoading(false);
    }
  }

  function updateField<TField extends keyof CouponEditFormValues>(
    field: TField,
    value: CouponEditFormValues[TField],
  ) {
    setCouponForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError(null);

    const payload = getCouponUpdatePayload(couponForm);
    const validation = couponUpdateSchema.safeParse(payload);

    if (!validation.success) {
      setErrors(getFormValidationErrors(validation.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await couponsApi.update(couponId, validation.data);
      const updatedCoupon = response.data.promo;

      toast.success({ title: "Coupon Updated." });
      void navigate({ params: { couponId: updatedCoupon.id }, to: "/coupons/$couponId" });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to update coupon."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      {formError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="bg-surface rounded-lg border p-6 shadow-sm">
          <p className="text-muted text-sm font-medium">Loading Coupon Details...</p>
        </div>
      ) : null}

      {coupon ? (
        <CouponEditForm
          coupon={coupon}
          couponForm={couponForm}
          description="Update Coupon Availability, Expiry, And Usage Limits."
          errors={errors}
          formId={formId}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onUpdateField={updateField}
          submitLabel="Update Coupon"
          submittingLabel="Updating..."
          title="Edit Coupon"
        />
      ) : null}
    </section>
  );
}
