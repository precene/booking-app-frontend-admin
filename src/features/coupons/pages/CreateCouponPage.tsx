import { useState, type SubmitEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

import {
  CouponForm,
  getCouponPayload,
  initialCouponFormValues,
  type CouponFormErrors,
  type CouponFormValues,
} from "../components/CouponForm";
import { couponsApi } from "../services/couponsApi";
import { couponSchema } from "../validations/couponValidation";

import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import { getFormValidationErrors } from "#/shared/utils/getFormValidationErrors";

const formId = "create-coupon-form";

export default function CreateCouponPage() {
  const [couponForm, setCouponForm] = useState<CouponFormValues>(initialCouponFormValues);
  const [errors, setErrors] = useState<CouponFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  function updateField<TField extends keyof CouponFormValues>(
    field: TField,
    value: CouponFormValues[TField],
  ) {
    setCouponForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError(null);

    const payload = getCouponPayload(couponForm);
    const validation = couponSchema.safeParse(payload);

    if (!validation.success) {
      setErrors(getFormValidationErrors(validation.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await couponsApi.create(validation.data);
      toast.success({ title: "Coupon Created." });
      void navigate({ to: "/coupons" });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to create coupon."));
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

      <CouponForm
        couponForm={couponForm}
        description="Create a coupon code that customers can apply during ticket booking."
        errors={errors}
        formId={formId}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onUpdateField={updateField}
        submitLabel="Save Coupon"
        submittingLabel="Saving..."
        title="Add Coupon"
      />
    </section>
  );
}
