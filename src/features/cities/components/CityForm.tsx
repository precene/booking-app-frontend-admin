import { Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, Globe2, Save } from "lucide-react";
import type { SubmitEvent } from "react";

import type { City, CityPayload } from "../types/cityTypes";

import { Button } from "#/shared/components/ui/button";
import { Checkbox } from "#/shared/components/ui/checkbox";
import { Form } from "#/shared/components/ui/form";
import { Input } from "#/shared/components/ui/input";
import { Label } from "#/shared/components/ui/label";
import type { FormValidationErrors } from "#/shared/utils/getFormValidationErrors";

export type CityFormValues = {
  active: boolean;
  name: string;
  slug: string;
};

export type CityFormErrors = FormValidationErrors<CityPayload>;

type CityFormProps = {
  cityForm: CityFormValues;
  description: string;
  errors: CityFormErrors;
  formId: string;
  isSubmitting: boolean;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onUpdateField: <TField extends keyof CityFormValues>(
    field: TField,
    value: CityFormValues[TField],
  ) => void;
  submitLabel: string;
  submittingLabel: string;
  title: string;
};

export const initialCityFormValues: CityFormValues = {
  active: true,
  name: "",
  slug: "",
};

export function CityForm({
  cityForm,
  description,
  errors,
  formId,
  isSubmitting,
  onSubmit,
  onUpdateField,
  submitLabel,
  submittingLabel,
  title,
}: CityFormProps) {
  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button asChild aria-label="Back To Cities" size="icon" variant="ghost">
              <Link to="/cities">
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
        <div className="bg-surface rounded-lg border p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="text-primary size-5" />
            <h3 className="text-base font-semibold tracking-normal">City Details</h3>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">City Name</Label>
              <Input
                aria-describedby={errors.name ? "name-error" : undefined}
                aria-invalid={Boolean(errors.name)}
                id="name"
                name="name"
                onChange={(event) => onUpdateField("name", event.target.value)}
                placeholder="Kathmandu"
                value={cityForm.name}
              />

              {errors.name ? (
                <p className="text-destructive text-sm" id="name-error">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                aria-describedby={errors.slug ? "slug-error" : undefined}
                aria-invalid={Boolean(errors.slug)}
                id="slug"
                name="slug"
                onChange={(event) => onUpdateField("slug", event.target.value)}
                placeholder="kathmandu"
                value={cityForm.slug}
              />

              {errors.slug ? (
                <p className="text-destructive text-sm" id="slug-error">
                  {errors.slug}
                </p>
              ) : null}
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
                checked={cityForm.active}
                id="active"
                onCheckedChange={(checked) => onUpdateField("active", checked === true)}
              />

              <span>
                <span className="block text-sm font-medium">Active City</span>
                <span className="text-muted mt-1 block text-sm">
                  Active Cities Can Be Assigned To Venues And Used In The Catalog.
                </span>
              </span>
            </label>
          </div>
        </aside>
      </Form>
    </>
  );
}

export function getCityPayload(formValues: CityFormValues): CityPayload {
  return {
    active: formValues.active,
    name: formValues.name.trim(),
    slug: toOptionalString(formValues.slug),
  };
}

export function getCityFormValues(city: City): CityFormValues {
  return {
    active: city.active,
    name: city.name,
    slug: city.slug,
  };
}

function toOptionalString(value: string | undefined) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : undefined;
}
