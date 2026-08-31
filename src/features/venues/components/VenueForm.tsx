import { Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, Globe2, Mail, Save } from "lucide-react";
import type { SubmitEvent } from "react";

import type { City } from "#/features/cities/types/cityTypes";
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
import { Textarea } from "#/shared/components/ui/textarea";
import type { FormValidationErrors } from "#/shared/utils/getFormValidationErrors";
import type { Venue, VenuePayload } from "../types/venueTypes";

export type VenueFormValues = {
  active: boolean;
  address: string;
  cityId: string;
  contactEmail: string;
  contactPhone: string;
  name: string;
};

export type VenueFormErrors = FormValidationErrors<VenuePayload>;

type VenueFormProps = {
  cities: Array<City>;
  isCitiesLoading: boolean;
  description: string;
  errors: VenueFormErrors;
  formId: string;
  isSubmitting: boolean;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onUpdateField: <TField extends keyof VenueFormValues>(
    field: TField,
    value: VenueFormValues[TField],
  ) => void;
  submitLabel: string;
  submittingLabel: string;
  title: string;
  venueForm: VenueFormValues;
};

export const initialVenueFormValues: VenueFormValues = {
  active: true,
  address: "",
  cityId: "",
  contactEmail: "",
  contactPhone: "",
  name: "",
};

export function VenueForm({
  cities,
  description,
  errors,
  formId,
  isCitiesLoading,
  isSubmitting,
  onSubmit,
  onUpdateField,
  submitLabel,
  submittingLabel,
  title,
  venueForm,
}: VenueFormProps) {
  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button asChild aria-label="Back to venues" size="icon" variant="ghost">
              <Link to="/venues">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>

            <h2 className="text-3xl font-semibold tracking-normal">{title}</h2>
          </div>

          <p className="text-muted mt-2 text-sm">{description}</p>
        </div>

        <Button disabled={isSubmitting || isCitiesLoading} form={formId} type="submit">
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
                  onChange={(event) => onUpdateField("name", event.target.value)}
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
                  onValueChange={(value) => onUpdateField("cityId", value)}
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
                  onChange={(event) => onUpdateField("address", event.target.value)}
                  placeholder="Street, landmark, building, or mall address"
                  value={venueForm.address}
                />

                {errors.address ? (
                  <p className="text-destructive text-sm" id="address-error">
                    {errors.address}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Mail className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">Contact</h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact email</Label>
                <Input
                  aria-describedby={errors.contactEmail ? "contact-email-error" : undefined}
                  aria-invalid={Boolean(errors.contactEmail)}
                  id="contactEmail"
                  name="contactEmail"
                  onChange={(event) => onUpdateField("contactEmail", event.target.value)}
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
                  onChange={(event) => onUpdateField("contactPhone", event.target.value)}
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
        </div>

        <aside className="space-y-6">
          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Globe2 className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">Availability</h3>
            </div>

            <label className="flex items-start gap-3">
              <Checkbox
                checked={venueForm.active}
                id="active"
                onCheckedChange={(checked) => onUpdateField("active", checked === true)}
              />

              <span>
                <span className="block text-sm font-medium">Active venue</span>
                <span className="text-muted mt-1 block text-sm">
                  Active venues can host screens, layouts, and show schedules.
                </span>
              </span>
            </label>
          </div>
        </aside>
      </Form>
    </>
  );
}

export function getVenuePayload(formValues: VenueFormValues): VenuePayload {
  return {
    active: formValues.active,
    address: formValues.address.trim(),
    cityId: formValues.cityId,
    contactEmail: toOptionalString(formValues.contactEmail),
    contactPhone: formValues.contactPhone.trim(),
    name: formValues.name.trim(),
  };
}

export function getVenueFormValues(venue: Venue): VenueFormValues {
  return {
    active: venue.active,
    address: venue.address,
    cityId: venue.cityId,
    contactEmail: venue.contactEmail ?? "",
    contactPhone: venue.contactPhone ?? "",
    name: venue.name,
  };
}

function toOptionalString(value: string | undefined) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : undefined;
}
