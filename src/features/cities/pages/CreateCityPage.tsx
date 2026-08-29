import { useState, type SubmitEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

import {
  CityForm,
  getCityPayload,
  initialCityFormValues,
  type CityFormErrors,
  type CityFormValues,
} from "../components/CityForm";
import { citiesApi } from "../services/citiesApi";
import { citySchema } from "../validations/cityValidation";

import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import { getFormValidationErrors } from "#/shared/utils/getFormValidationErrors";

const formId = "create-city-form";

export default function CreateCityPage() {
  const [cityForm, setCityForm] = useState<CityFormValues>(initialCityFormValues);
  const [errors, setErrors] = useState<CityFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  function updateField<TField extends keyof CityFormValues>(
    field: TField,
    value: CityFormValues[TField],
  ) {
    setCityForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError(null);

    const payload = getCityPayload(cityForm);
    const validation = citySchema.safeParse(payload);

    if (!validation.success) {
      setErrors(getFormValidationErrors(validation.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await citiesApi.create(validation.data);
      toast.success({ title: "City created." });
      void navigate({ to: "/cities" });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to create city."));
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

      <CityForm
        cityForm={cityForm}
        description="Create a service city with routing and availability settings."
        errors={errors}
        formId={formId}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onUpdateField={updateField}
        submitLabel="Save City"
        submittingLabel="Saving..."
        title="Add City"
      />
    </section>
  );
}
