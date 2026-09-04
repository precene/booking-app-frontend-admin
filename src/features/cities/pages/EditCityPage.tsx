import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

import {
  CityForm,
  getCityFormValues,
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

const formId = "edit-city-form";

export default function EditCityPage() {
  const { cityId } = useParams({ from: "/_protected/cities/$cityId_/edit" });
  const [cityForm, setCityForm] = useState<CityFormValues>(initialCityFormValues);
  const [errors, setErrors] = useState<CityFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    void loadCity();
  }, [cityId]);

  async function loadCity() {
    setIsLoading(true);
    setFormError(null);

    try {
      const response = await citiesApi.get(cityId);
      setCityForm(getCityFormValues(response.data.city));
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to load city details."));
    } finally {
      setIsLoading(false);
    }
  }

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
      const response = await citiesApi.update(cityId, validation.data);
      const city = response.data.city;

      toast.success({ title: "City Updated." });
      void navigate({ params: { cityId: city.id }, to: "/cities/$cityId" });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to update city."));
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
          <p className="text-muted text-sm font-medium">Loading City Details...</p>
        </div>
      ) : (
        <CityForm
          cityForm={cityForm}
          description="Update City Routing And Availability Settings."
          errors={errors}
          formId={formId}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onUpdateField={updateField}
          submitLabel="Update City"
          submittingLabel="Updating..."
          title="Edit City"
        />
      )}
    </section>
  );
}
