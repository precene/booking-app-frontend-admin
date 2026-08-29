import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import { getFormValidationErrors } from "#/shared/utils/getFormValidationErrors";
import {
  getScreenSeatFormValues,
  initialScreenSeatFormValues,
  ScreenSeatForm,
  type ScreenSeatFormErrors,
  type ScreenSeatFormValues,
} from "../components/ScreenSeatForm";
import { screensApi } from "../services/screensApi";
import { seatLayoutsApi } from "../services/seatLayoutsApi";
import type { SeatLayout } from "../types/seatLayoutTypes";
import { generateSeatDefinitions } from "../utils/seatLayoutUtils";
import { venueScreenSetupSchema } from "../validations/venueValidation";

const formId = "edit-venue-screen-form";

export default function EditVenueScreenPage() {
  const { screenId, venueId } = useParams({
    from: "/_protected/venues/$venueId_/screens/$screenId_/edit",
  });
  const [formValues, setFormValues] = useState<ScreenSeatFormValues>(initialScreenSeatFormValues);
  const [layout, setLayout] = useState<SeatLayout | null>(null);
  const [errors, setErrors] = useState<ScreenSeatFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    void loadScreenSetup();
  }, [screenId]);

  async function loadScreenSetup() {
    setIsLoading(true);
    setFormError(null);

    try {
      const screenResponse = await screensApi.get(screenId);
      const screen = screenResponse.data.screen;
      const layoutsResponse = await seatLayoutsApi.list({ screenId });
      const layoutSummary =
        layoutsResponse.data.layouts.find((item) => item.isActive) ??
        layoutsResponse.data.layouts[0];
      const layoutResponse = layoutSummary ? await seatLayoutsApi.get(layoutSummary.id) : null;
      const nextLayout = layoutResponse?.data.layout ?? null;

      setLayout(nextLayout);
      setFormValues(getScreenSeatFormValues(screen, nextLayout));
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to load screen and seat layout."));
    } finally {
      setIsLoading(false);
    }
  }

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
      await screensApi.update(screenId, {
        active: screenSetup.active,
        name: screenSetup.name.trim(),
        screenType: screenSetup.screenType,
        sortOrder: screenSetup.sortOrder,
      });

      const layoutPayload = {
        config: {
          rows: screenSetup.rows,
          seatsPerRow: screenSetup.seatsPerRow,
        },
        isActive: true,
        name: screenSetup.layoutName.trim(),
        screenId,
        seatDefs: generateSeatDefinitions(screenSetup.rows, screenSetup.seatsPerRow),
      };

      if (layout) {
        await seatLayoutsApi.update(layout.id, layoutPayload);
      } else {
        await seatLayoutsApi.create(layoutPayload);
      }

      toast.success({ title: "Screen updated." });
      void navigate({ params: { venueId }, to: "/venues/$venueId" });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to update screen and seat layout."));
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
          <p className="text-muted text-sm font-medium">Loading screen and seat layout...</p>
        </div>
      ) : (
        <ScreenSeatForm
          description="Update screen metadata and its active seat layout."
          errors={errors}
          formId={formId}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onUpdateField={updateField}
          submitLabel="Update Screen"
          submittingLabel="Updating..."
          title="Edit Screen"
          values={formValues}
          venueId={venueId}
        />
      )}
    </section>
  );
}
