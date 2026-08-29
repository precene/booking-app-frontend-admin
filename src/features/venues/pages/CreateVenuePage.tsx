import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Building2, Plus, Save, Trash2 } from "lucide-react";

import { citiesApi } from "#/features/cities/services/citiesApi";
import type { City } from "#/features/cities/types/cityTypes";
import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { Button } from "#/shared/components/ui/button";
import { Checkbox } from "#/shared/components/ui/checkbox";
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
import { Stepper, type StepperStep } from "#/shared/components/ui/stepper";
import { Textarea } from "#/shared/components/ui/textarea";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import { getFormValidationErrors } from "#/shared/utils/getFormValidationErrors";
import { SeatLayoutPreview } from "../components/SeatLayoutPreview";
import {
  getVenuePayload,
  initialVenueFormValues,
  type VenueFormErrors,
  type VenueFormValues,
} from "../components/VenueForm";
import { screensApi } from "../services/screensApi";
import { seatLayoutsApi } from "../services/seatLayoutsApi";
import { venuesApi } from "../services/venuesApi";
import type { ScreenType } from "../types/screenTypes";
import { generateSeatDefinitions } from "../utils/seatLayoutUtils";
import { venueSchema, venueScreensSetupSchema } from "../validations/venueValidation";

type ScreenSetupFormValues = {
  active: boolean;
  layoutName: string;
  name: string;
  rows: number;
  screenType: ScreenType;
  seatsPerRow: number;
  sortOrder: number;
};

const steps: Array<StepperStep> = [
  { description: "Location and contact", id: "venue", title: "Venue" },
  { description: "Screens and seats", id: "seating", title: "Seating" },
  { description: "Confirm setup", id: "review", title: "Review" },
];

const initialScreenSetup: ScreenSetupFormValues = {
  active: true,
  layoutName: "Default Layout",
  name: "Screen 1",
  rows: 8,
  screenType: "flat",
  seatsPerRow: 12,
  sortOrder: 0,
};

export default function CreateVenuePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [venueForm, setVenueForm] = useState<VenueFormValues>(initialVenueFormValues);
  const [screens, setScreens] = useState<Array<ScreenSetupFormValues>>([initialScreenSetup]);
  const [cities, setCities] = useState<Array<City>>([]);
  const [errors, setErrors] = useState<VenueFormErrors>({});
  const [screenError, setScreenError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [citiesErrorMessage, setCitiesErrorMessage] = useState<string | null>(null);
  const [isCitiesLoading, setIsCitiesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const cityName = useMemo(
    () => cities.find((city) => city.id === venueForm.cityId)?.name ?? "Not selected",
    [cities, venueForm.cityId],
  );

  const totalCapacity = useMemo(
    () => screens.reduce((total, screen) => total + screen.rows * screen.seatsPerRow, 0),
    [screens],
  );

  useEffect(() => {
    void loadCities();
  }, []);

  async function loadCities() {
    setIsCitiesLoading(true);
    setCitiesErrorMessage(null);

    try {
      const response = await citiesApi.list({ active: "true", limit: 100, page: 1 });
      setCities(response.data.items);
    } catch (error) {
      setCitiesErrorMessage(getApiErrorMessage(error, "Unable to load cities."));
    } finally {
      setIsCitiesLoading(false);
    }
  }

  function updateVenueField<TField extends keyof VenueFormValues>(
    field: TField,
    value: VenueFormValues[TField],
  ) {
    setVenueForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function updateScreenField<TField extends keyof ScreenSetupFormValues>(
    index: number,
    field: TField,
    value: ScreenSetupFormValues[TField],
  ) {
    setScreens((currentScreens) =>
      currentScreens.map((screen, screenIndex) =>
        screenIndex === index ? { ...screen, [field]: value } : screen,
      ),
    );
  }

  function addScreen() {
    setScreens((currentScreens) => [
      ...currentScreens,
      {
        ...initialScreenSetup,
        name: `Screen ${currentScreens.length + 1}`,
        sortOrder: currentScreens.length,
      },
    ]);
  }

  function removeScreen(index: number) {
    setScreens((currentScreens) =>
      currentScreens.filter((_screen, screenIndex) => screenIndex !== index),
    );
  }

  function handlePreviousStep() {
    setCurrentStep((step) => Math.max(0, step - 1));
  }

  function handleNextStep() {
    setFormError(null);

    if (currentStep === 0 && !validateVenueDetails()) return;
    if (currentStep === 1 && !validateScreens()) return;

    setCurrentStep((step) => Math.min(steps.length - 1, step + 1));
  }

  function handleStepChange(stepIndex: number) {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  }

  function validateVenueDetails() {
    const validation = venueSchema.safeParse(getVenuePayload(venueForm));

    if (!validation.success) {
      setErrors(getFormValidationErrors(validation.error));
      return false;
    }

    if (!isActiveCitySelected(validation.data.cityId)) {
      setErrors({ cityId: "Select an active city" });
      return false;
    }

    setErrors({});
    return true;
  }

  function isActiveCitySelected(cityId: string) {
    return cities.some((city) => city.id === cityId && city.active);
  }

  function validateScreens() {
    const validation = venueScreensSetupSchema.safeParse(screens);

    if (!validation.success) {
      setScreenError(validation.error.issues[0]?.message ?? "Check screen and seat details.");
      return false;
    }

    setScreenError(null);
    return true;
  }

  async function handleSave() {
    setFormError(null);

    const venueValidation = venueSchema.safeParse(getVenuePayload(venueForm));
    const screensValidation = venueScreensSetupSchema.safeParse(screens);

    if (!venueValidation.success) {
      setErrors(getFormValidationErrors(venueValidation.error));
      setCurrentStep(0);
      return;
    }

    if (!isActiveCitySelected(venueValidation.data.cityId)) {
      setErrors({ cityId: "Select an active city" });
      setCurrentStep(0);
      return;
    }

    if (!screensValidation.success) {
      setScreenError(
        screensValidation.error.issues[0]?.message ?? "Check screen and seat details.",
      );
      setCurrentStep(1);
      return;
    }

    setErrors({});
    setScreenError(null);
    setIsSubmitting(true);

    try {
      const venueResponse = await venuesApi.create(venueValidation.data);
      const venue = venueResponse.data.venue;

      for (const [index, screenSetup] of screensValidation.data.entries()) {
        const screenResponse = await screensApi.create({
          active: screenSetup.active,
          name: screenSetup.name.trim(),
          screenType: screenSetup.screenType,
          sortOrder: screenSetup.sortOrder,
          venueId: venue.id,
        });
        const screen = screenResponse.data.screen;

        await seatLayoutsApi.create({
          config: {
            rows: screenSetup.rows,
            seatsPerRow: screenSetup.seatsPerRow,
          },
          isActive: true,
          name: screenSetup.layoutName.trim() || `Layout ${index + 1}`,
          screenId: screen.id,
          seatDefs: generateSeatDefinitions(screenSetup.rows, screenSetup.seatsPerRow),
        });
      }

      toast.success({ title: "Venue created." });
      void navigate({ to: "/venues" });
    } catch (error) {
      setFormError(
        getApiErrorMessage(
          error,
          "Unable to create venue setup. Some records may have been created.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button asChild aria-label="Back to venues" size="icon" variant="ghost">
              <Link to="/venues">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>

            <h2 className="text-3xl font-semibold tracking-normal">Add Venue</h2>
          </div>

          <p className="text-muted mt-2 text-sm">
            Create a cinema venue with screens, seat capacity, and an active seat layout.
          </p>
        </div>
      </div>

      <Stepper currentStep={currentStep} onStepChange={handleStepChange} steps={steps} />

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

      <Form disabled={isSubmitting} noValidate onSubmit={(event) => event.preventDefault()}>
        {currentStep === 0 ? renderVenueDetailsStep() : null}
        {currentStep === 1 ? renderSeatingStep() : null}
        {currentStep === 2 ? renderReviewStep() : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            disabled={isSubmitting || currentStep === 0}
            onClick={handlePreviousStep}
            type="button"
            variant="outline"
          >
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              disabled={isSubmitting || isCitiesLoading}
              onClick={handleNextStep}
              type="button"
            >
              Next
            </Button>
          ) : (
            <Button disabled={isSubmitting || isCitiesLoading} onClick={handleSave} type="button">
              <Save className="size-4" />
              {isSubmitting ? "Saving..." : "Save Venue"}
            </Button>
          )}
        </div>
      </Form>
    </section>
  );

  function renderVenueDetailsStep() {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="bg-surface rounded-lg border p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="text-primary size-5" />
            <h3 className="text-base font-semibold tracking-normal">Venue Details</h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Venue name</Label>
              <Input
                aria-describedby={errors.name ? "name-error" : undefined}
                aria-invalid={Boolean(errors.name)}
                id="name"
                name="name"
                onChange={(event) => updateVenueField("name", event.target.value)}
                placeholder="977Cinema City Center"
                value={venueForm.name}
              />

              {errors.name ? (
                <p className="text-destructive text-sm" id="name-error">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cityId">City</Label>
              <Select
                disabled={isCitiesLoading}
                name="cityId"
                onValueChange={(value) => updateVenueField("cityId", value)}
                value={venueForm.cityId}
              >
                <SelectTrigger
                  aria-describedby={errors.cityId ? "city-id-error" : undefined}
                  aria-invalid={Boolean(errors.cityId)}
                  id="cityId"
                >
                  <SelectValue
                    placeholder={isCitiesLoading ? "Loading cities..." : "Select city"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.cityId ? (
                <p className="text-destructive text-sm" id="city-id-error">
                  {errors.cityId}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                aria-describedby={errors.address ? "address-error" : undefined}
                aria-invalid={Boolean(errors.address)}
                id="address"
                name="address"
                onChange={(event) => updateVenueField("address", event.target.value)}
                placeholder="Street, landmark, building, or mall address"
                value={venueForm.address}
              />

              {errors.address ? (
                <p className="text-destructive text-sm" id="address-error">
                  {errors.address}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact email</Label>
              <Input
                aria-describedby={errors.contactEmail ? "contact-email-error" : undefined}
                aria-invalid={Boolean(errors.contactEmail)}
                id="contactEmail"
                name="contactEmail"
                onChange={(event) => updateVenueField("contactEmail", event.target.value)}
                placeholder="venue@example.com"
                type="email"
                value={venueForm.contactEmail}
              />

              {errors.contactEmail ? (
                <p className="text-destructive text-sm" id="contact-email-error">
                  {errors.contactEmail}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact phone</Label>
              <Input
                aria-describedby={errors.contactPhone ? "contact-phone-error" : undefined}
                aria-invalid={Boolean(errors.contactPhone)}
                id="contactPhone"
                name="contactPhone"
                onChange={(event) => updateVenueField("contactPhone", event.target.value)}
                placeholder="+977 1 5555555"
                value={venueForm.contactPhone}
              />

              {errors.contactPhone ? (
                <p className="text-destructive text-sm" id="contact-phone-error">
                  {errors.contactPhone}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <aside className="bg-surface rounded-lg border p-6 shadow-sm">
          <h3 className="text-base font-semibold tracking-normal">Availability</h3>

          <label className="mt-4 flex items-start gap-3">
            <Checkbox
              checked={venueForm.active}
              id="active"
              onCheckedChange={(checked) => updateVenueField("active", checked === true)}
            />

            <span>
              <span className="block text-sm font-medium">Active venue</span>
              <span className="text-muted mt-1 block text-sm">
                Active venues can host screens, layouts, and show schedules.
              </span>
            </span>
          </label>
        </aside>
      </div>
    );
  }

  function renderSeatingStep() {
    return (
      <div className="space-y-6">
        {screenError ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{screenError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold tracking-normal">Screens & Seating</h3>
            <p className="text-muted mt-1 text-sm">
              Add theatre screens and generate their active seat layouts.
            </p>
          </div>

          <Button onClick={addScreen} type="button" variant="secondary">
            <Plus className="size-4" />
            Add Screen
          </Button>
        </div>

        {screens.map((screen, index) => (
          <div
            className="bg-surface grid gap-6 rounded-lg border p-6 shadow-sm xl:grid-cols-[1fr_28rem]"
            key={index}
          >
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <h4 className="text-base font-semibold tracking-normal">
                  {screen.name || `Screen ${index + 1}`}
                </h4>

                <Button
                  aria-label="Remove screen"
                  disabled={screens.length === 1}
                  onClick={() => removeScreen(index)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`screen-${index}-name`}>Screen name</Label>
                  <Input
                    id={`screen-${index}-name`}
                    onChange={(event) => updateScreenField(index, "name", event.target.value)}
                    placeholder="Screen 1"
                    value={screen.name}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`screen-${index}-type`}>Screen type</Label>
                  <Select
                    onValueChange={(value) =>
                      updateScreenField(index, "screenType", value as ScreenType)
                    }
                    value={screen.screenType}
                  >
                    <SelectTrigger id={`screen-${index}-type`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="curved">Curved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`screen-${index}-rows`}>Rows</Label>
                  <Input
                    id={`screen-${index}-rows`}
                    max={40}
                    min={1}
                    onChange={(event) =>
                      updateScreenField(index, "rows", Number(event.target.value))
                    }
                    type="number"
                    value={screen.rows}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`screen-${index}-seats`}>Seats per row</Label>
                  <Input
                    id={`screen-${index}-seats`}
                    max={50}
                    min={1}
                    onChange={(event) =>
                      updateScreenField(index, "seatsPerRow", Number(event.target.value))
                    }
                    type="number"
                    value={screen.seatsPerRow}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`screen-${index}-layout`}>Layout name</Label>
                  <Input
                    id={`screen-${index}-layout`}
                    onChange={(event) => updateScreenField(index, "layoutName", event.target.value)}
                    placeholder="Default Layout"
                    value={screen.layoutName}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`screen-${index}-sort`}>Sort order</Label>
                  <Input
                    id={`screen-${index}-sort`}
                    max={32767}
                    min={0}
                    onChange={(event) =>
                      updateScreenField(index, "sortOrder", Number(event.target.value))
                    }
                    type="number"
                    value={screen.sortOrder}
                  />
                </div>
              </div>

              <label className="flex items-start gap-3">
                <Checkbox
                  checked={screen.active}
                  id={`screen-${index}-active`}
                  onCheckedChange={(checked) =>
                    updateScreenField(index, "active", checked === true)
                  }
                />

                <span>
                  <span className="block text-sm font-medium">Active screen</span>
                  <span className="text-muted mt-1 block text-sm">
                    Active screens can be used for show scheduling.
                  </span>
                </span>
              </label>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h5 className="text-sm font-semibold tracking-normal">Seat Preview</h5>
                <span className="text-muted text-sm font-medium">
                  {screen.rows * screen.seatsPerRow} seats
                </span>
              </div>

              <SeatLayoutPreview rows={screen.rows} seatsPerRow={screen.seatsPerRow} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderReviewStep() {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="bg-surface rounded-lg border p-6 shadow-sm">
          <h3 className="text-base font-semibold tracking-normal">Review Venue</h3>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-muted text-xs font-medium uppercase">Venue</dt>
              <dd className="mt-1 text-sm font-medium">{venueForm.name || "Not set"}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs font-medium uppercase">City</dt>
              <dd className="mt-1 text-sm font-medium">{cityName}</dd>
            </div>
            <div>
              <dt className="text-muted text-xs font-medium uppercase">Status</dt>
              <dd className="mt-1 text-sm font-medium">
                {venueForm.active ? "Active" : "Inactive"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted text-xs font-medium uppercase">Address</dt>
              <dd className="mt-1 text-sm font-medium">{venueForm.address || "Not set"}</dd>
            </div>
          </dl>
        </div>

        <aside className="bg-surface rounded-lg border p-6 shadow-sm">
          <h3 className="text-base font-semibold tracking-normal">Capacity</h3>
          <p className="mt-4 text-3xl font-semibold tracking-normal">{totalCapacity}</p>
          <p className="text-muted mt-1 text-sm">Total seats across {screens.length} screens.</p>

          <div className="mt-5 space-y-3">
            {screens.map((screen, index) => (
              <div
                className="border-t pt-3 first:border-t-0 first:pt-0"
                key={`${screen.name}-${index}`}
              >
                <p className="text-sm font-medium">{screen.name || `Screen ${index + 1}`}</p>
                <p className="text-muted mt-1 text-sm">
                  {screen.rows} rows x {screen.seatsPerRow} seats ={" "}
                  {screen.rows * screen.seatsPerRow} seats
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    );
  }
}
