import { Link } from "@tanstack/react-router";
import { ArrowLeft, LayoutGrid, Save } from "lucide-react";
import type { SubmitEvent } from "react";

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
import type { FormValidationErrors } from "#/shared/utils/getFormValidationErrors";
import { SeatLayoutDesigner } from "./SeatLayoutDesigner";
import type { Screen, ScreenType } from "../types/screenTypes";
import type { SeatCategory } from "../types/seatCategoryTypes";
import type { SeatLayout, SeatLayoutCell } from "../types/seatLayoutTypes";
import {
  createSeatLayoutCells,
  getLayoutColumns,
  getLayoutRows,
  getSeatCellsFromLayout,
} from "../utils/seatLayoutUtils";

export type ScreenSeatFormValues = {
  active: boolean;
  columns: number;
  defaultCategoryId?: string;
  layoutName: string;
  name: string;
  rows: number;
  screenType: ScreenType;
  seats: Array<SeatLayoutCell>;
  sortOrder: number;
};

export type ScreenSeatFormErrors = FormValidationErrors<ScreenSeatFormValues>;

type ScreenSeatFormProps = {
  categories: Array<SeatCategory>;
  categoriesErrorMessage?: null | string;
  isCategoriesLoading?: boolean;
  description: string;
  errors: ScreenSeatFormErrors;
  formId: string;
  isSubmitting: boolean;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onUpdateField: <TField extends keyof ScreenSeatFormValues>(
    field: TField,
    value: ScreenSeatFormValues[TField],
  ) => void;
  submitLabel: string;
  submittingLabel: string;
  title: string;
  values: ScreenSeatFormValues;
  venueId: string;
};

export const initialScreenSeatFormValues: ScreenSeatFormValues = {
  active: true,
  columns: 12,
  defaultCategoryId: undefined,
  layoutName: "Default Layout",
  name: "Screen 1",
  rows: 8,
  screenType: "flat",
  seats: createSeatLayoutCells(8, 12),
  sortOrder: 0,
};

export function ScreenSeatForm({
  categories,
  categoriesErrorMessage,
  description,
  errors,
  formId,
  isCategoriesLoading = false,
  isSubmitting,
  onSubmit,
  onUpdateField,
  submitLabel,
  submittingLabel,
  title,
  values,
  venueId,
}: ScreenSeatFormProps) {
  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button asChild aria-label="Back to venue" size="icon" variant="ghost">
              <Link params={{ venueId }} to="/venues/$venueId">
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
        className="space-y-6"
        disabled={isSubmitting}
        id={formId}
        noValidate
        onSubmit={onSubmit}
      >
        <div className="grid gap-6 xl:grid-cols-[20rem_1fr]">
          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <LayoutGrid className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">Screen & Layout</h3>
            </div>

            <div className="grid gap-4">
              <FieldErrorInput
                error={errors.name}
                id="name"
                label="Screen Name"
                onChange={(value) => onUpdateField("name", value)}
                placeholder="Screen 1"
                value={values.name}
              />

              <div className="space-y-2">
                <Label htmlFor="screenType">Screen Type</Label>
                <Select
                  onValueChange={(value) => onUpdateField("screenType", value as ScreenType)}
                  value={values.screenType}
                >
                  <SelectTrigger id="screenType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="curved">Curved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <FieldErrorInput
                error={errors.layoutName}
                id="layoutName"
                label="Layout Name"
                onChange={(value) => onUpdateField("layoutName", value)}
                placeholder="Default Layout"
                value={values.layoutName}
              />

              <FieldErrorInput
                error={errors.sortOrder}
                id="sortOrder"
                label="Sort Order"
                max={32767}
                min={0}
                onChange={(value) => onUpdateField("sortOrder", Number(value))}
                type="number"
                value={values.sortOrder}
              />

              <div className="space-y-2">
                <Label htmlFor="defaultCategoryId">Default Seat Category</Label>
                <Select
                  disabled={isCategoriesLoading}
                  onValueChange={(value) =>
                    onUpdateField("defaultCategoryId", value === "none" ? undefined : value)
                  }
                  value={values.defaultCategoryId ?? "none"}
                >
                  <SelectTrigger
                    aria-describedby={
                      errors.defaultCategoryId || categoriesErrorMessage
                        ? "default-category-id-error"
                        : undefined
                    }
                    aria-invalid={Boolean(errors.defaultCategoryId)}
                    id="defaultCategoryId"
                  >
                    <SelectValue
                      placeholder={
                        isCategoriesLoading ? "Loading Categories..." : "Select Category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.defaultCategoryId || categoriesErrorMessage ? (
                  <p className="text-destructive text-sm" id="default-category-id-error">
                    {errors.defaultCategoryId ?? categoriesErrorMessage}
                  </p>
                ) : null}
              </div>
            </div>

            <label className="mt-5 flex items-start gap-3">
              <Checkbox
                checked={values.active}
                id="active"
                onCheckedChange={(checked) => onUpdateField("active", checked === true)}
              />

              <span>
                <span className="block text-sm font-medium">Active Screen</span>
                <span className="text-muted mt-1 block text-sm">
                  Active screens can be used for show scheduling.
                </span>
              </span>
            </label>
          </div>

          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-base font-semibold tracking-normal">Seat Layout</h3>
            </div>

            <SeatLayoutDesigner
              columns={values.columns}
              disabled={isSubmitting}
              onColumnsChange={(columns) => onUpdateField("columns", columns)}
              onRowsChange={(rows) => onUpdateField("rows", rows)}
              onSeatsChange={(seats) => onUpdateField("seats", seats)}
              rows={values.rows}
              seats={values.seats}
            />

            {errors.seats ? (
              <p className="text-destructive mt-3 text-sm" id="seats-error">
                {errors.seats}
              </p>
            ) : null}
          </div>
        </div>
      </Form>
    </>
  );
}

export function getScreenSeatFormValues(screen: Screen, layout: SeatLayout | null) {
  const seats = getSeatCellsFromLayout(layout);
  const uniqueCategoryIds = new Set(
    seats
      .map((seat) => seat.categoryId)
      .filter((categoryId): categoryId is string => Boolean(categoryId)),
  );

  return {
    active: screen.active,
    defaultCategoryId: uniqueCategoryIds.size === 1 ? [...uniqueCategoryIds][0] : undefined,
    layoutName: layout?.name ?? "Default Layout",
    name: screen.name,
    rows: getLayoutRows(layout),
    columns: getLayoutColumns(layout),
    screenType: screen.screenType,
    seats,
    sortOrder: screen.sortOrder,
  };
}

type FieldErrorInputProps = {
  error?: string;
  id: keyof ScreenSeatFormValues;
  label: string;
  max?: number;
  min?: number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "number" | "text";
  value: number | string;
};

function FieldErrorInput({
  error,
  id,
  label,
  max,
  min,
  onChange,
  placeholder,
  type = "text",
  value,
}: FieldErrorInputProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        id={id}
        max={max}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />

      {error ? (
        <p className="text-destructive text-sm" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
