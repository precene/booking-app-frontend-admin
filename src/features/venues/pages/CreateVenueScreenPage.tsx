import { useState, type SubmitEvent } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import { getFormValidationErrors } from "#/shared/utils/getFormValidationErrors";
import {
  initialScreenSeatFormValues,
  ScreenSeatForm,
  type ScreenSeatFormErrors,
  type ScreenSeatFormValues,
} from "../components/ScreenSeatForm";
import { screensApi } from "../services/screensApi";
import { seatLayoutsApi } from "../services/seatLayoutsApi";
import { generateSeatDefinitions } from "../utils/seatLayoutUtils";
import { venueScreenSetupSchema } from "../validations/venueValidation";

const formId = "create-venue-screen-form";

export default function CreateVenueScreenPage() {
  const { venueId } = useParams({ from: "/_protected/venues/$venueId_/screens/new" });
  const [formValues, setFormValues] = useState<ScreenSeatFormValues>(initialScreenSeatFormValues);
  const [errors, setErrors] = useState<ScreenSeatFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  function updateField<TField extends keyof ScreenSeatFormValues>(
    field: TField,
    value: ScreenSeatFormValues[TField],
  ) {
    setFormValues((currentValues) => ({ ...currentValues, [field]: value }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const validation = venueScreenSetupSchema.safeParse(formValues);

    if (!validation.success) {
      setErrors(getFormValidationErrors(validation.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const screenSetup = validation.data;
      const screenResponse = await screensApi.create({
        active: screenSetup.active,
        name: screenSetup.name.trim(),
        screenType: screenSetup.screenType,
        sortOrder: screenSetup.sortOrder,
        venueId,
      });
      const screen = screenResponse.data.screen;

      await seatLayoutsApi.create({
        config: {
          rows: screenSetup.rows,
          seatsPerRow: screenSetup.seatsPerRow,
        },
        isActive: true,
        name: screenSetup.layoutName.trim(),
        screenId: screen.id,
        seatDefs: generateSeatDefinitions(screenSetup.rows, screenSetup.seatsPerRow),
      });

      toast.success({ title: "Screen created." });
      void navigate({ params: { venueId }, to: "/venues/$venueId" });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to create screen and seat layout."));
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

      <ScreenSeatForm
        description="Create a theatre screen and generate its active seat layout."
        errors={errors}
        formId={formId}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onUpdateField={updateField}
        submitLabel="Save Screen"
        submittingLabel="Saving..."
        title="Add Screen"
        values={formValues}
        venueId={venueId}
      />
    </section>
  );
}
