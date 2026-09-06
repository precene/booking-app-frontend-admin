import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

import { citiesApi } from "#/features/cities/services/citiesApi";
import type { City } from "#/features/cities/types/cityTypes";
import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import { getFormValidationErrors } from "#/shared/utils/getFormValidationErrors";
import {
  getVenueFormValues,
  getVenuePayload,
  initialVenueFormValues,
  VenueForm,
  type VenueFormErrors,
  type VenueFormValues,
} from "../components/VenueForm";
import { venuesApi } from "../services/venuesApi";
import { venueSchema } from "../validations/venueValidation";

const formId = "edit-venue-form";

export default function EditVenuePage() {
  const { venueId } = useParams({ from: "/_protected/venues/$venueId_/edit" });
  const [venueForm, setVenueForm] = useState<VenueFormValues>(initialVenueFormValues);
  const [cities, setCities] = useState<Array<City>>([]);
  const [originalCityId, setOriginalCityId] = useState<string | null>(null);
  const [errors, setErrors] = useState<VenueFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [citiesErrorMessage, setCitiesErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCitiesLoading, setIsCitiesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    void loadVenue();
    void loadCities();
  }, [venueId]);

  async function loadVenue() {
    setIsLoading(true);
    setFormError(null);

    try {
      const response = await venuesApi.get(venueId);
      const venue = response.data.venue;
      setOriginalCityId(venue.cityId);
      setVenueForm(getVenueFormValues(venue));

      try {
        const cityResponse = await citiesApi.get(venue.cityId);
        setCities((currentCities) => mergeCities(currentCities, cityResponse.data.city));
      } catch {
        // The venue can still be edited; the selected city field will show a validation state.
      }
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to load venue details."));
    } finally {
      setIsLoading(false);
    }
  }

  async function loadCities() {
    setIsCitiesLoading(true);
    setCitiesErrorMessage(null);

    try {
      const response = await citiesApi.list({ active: "true", limit: 100, page: 1 });
      setCities((currentCities) =>
        response.data.items
          .filter((city) => city.active || city.id === originalCityId)
          .reduce(mergeCities, currentCities),
      );
    } catch (error) {
      setCitiesErrorMessage(getApiErrorMessage(error, "Unable to load cities."));
    } finally {
      setIsCitiesLoading(false);
    }
  }

  function updateField<TField extends keyof VenueFormValues>(
    field: TField,
    value: VenueFormValues[TField],
  ) {
    setVenueForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError(null);

    const payload = getVenuePayload(venueForm);
    const validation = venueSchema.safeParse(payload);

    if (!validation.success) {
      setErrors(getFormValidationErrors(validation.error));
      return;
    }

    if (
      validation.data.cityId !== originalCityId &&
      !cities.some((city) => city.id === validation.data.cityId && city.active)
    ) {
      setErrors({ cityId: "Select an active city" });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await venuesApi.update(venueId, validation.data);
      const venue = response.data.venue;

      toast.success({ title: "Venue Updated." });
      void navigate({ params: { venueId: venue.id }, to: "/venues/$venueId" });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to update venue."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      {citiesErrorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{citiesErrorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {formError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="bg-surface rounded-lg border p-6 shadow-sm">
          <p className="text-muted text-sm font-medium">Loading Venue Details...</p>
        </div>
      ) : (
        <VenueForm
          cities={cities}
          description="Update venue city assignment, contact details, and availability."
          errors={errors}
          formId={formId}
          isCitiesLoading={isCitiesLoading}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onUpdateField={updateField}
          submitLabel="Update Venue"
          submittingLabel="Updating..."
          title="Edit Venue"
          venueForm={venueForm}
        />
      )}
    </section>
  );
}

function mergeCities(cities: Array<City>, city: City) {
  if (cities.some((currentCity) => currentCity.id === city.id)) return cities;

  return [...cities, city];
}
