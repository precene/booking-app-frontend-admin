import { useMemo, useRef, useState, type SubmitEvent } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Save, Trash2, X } from "lucide-react";

import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { Button } from "#/shared/components/ui/button";
import { DataTable } from "#/shared/components/ui/data-table";
import { Form } from "#/shared/components/ui/form";
import { Input } from "#/shared/components/ui/input";
import { Label } from "#/shared/components/ui/label";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import { seatCategoriesApi } from "../services/seatCategoriesApi";
import type { SeatCategory } from "../types/seatCategoryTypes";
import { getSeatCategoryFormData, isSeatCategoryAssigned } from "../utils/seatCategoryUtils";
import { formatVenueMoney } from "../utils/venueFormatters";

type SeatCategoryManagerProps = {
  assignedCategoryIds?: Array<string>;
  categories: Array<SeatCategory>;
  isLoading: boolean;
  onCategoriesChange: () => Promise<void>;
  screenId: string;
};

export function SeatCategoryManager({
  assignedCategoryIds = [],
  categories,
  isLoading,
  onCategoriesChange,
  screenId,
}: SeatCategoryManagerProps) {
  const [categoryName, setCategoryName] = useState("");
  const [categoryPrice, setCategoryPrice] = useState("");
  const [categoryColor, setCategoryColor] = useState("#10b981");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryActionId, setCategoryActionId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const editCategoryRef = useRef({
    color: "#10b981",
    name: "",
    price: "",
  });

  const columns = useMemo<Array<ColumnDef<SeatCategory>>>(
    () => [
      {
        accessorKey: "name",
        header: "Category",
        cell: ({ row }) => {
          const category = row.original;

          if (editingCategoryId === category.id) {
            return (
              <div className="flex min-w-56 items-center gap-2">
                <Input
                  defaultValue={editCategoryRef.current.name}
                  disabled={categoryActionId === category.id}
                  onChange={(event) => {
                    editCategoryRef.current.name = event.target.value;
                  }}
                />
                <Input
                  className="h-10 w-12 p-1"
                  defaultValue={editCategoryRef.current.color}
                  disabled={categoryActionId === category.id}
                  onChange={(event) => {
                    editCategoryRef.current.color = event.target.value;
                  }}
                  type="color"
                />
              </div>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <span
                className="size-3 rounded-sm border"
                style={{ backgroundColor: category.color }}
              />
              <span className="font-medium">{category.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "defaultPriceMinor",
        header: "Default Price",
        cell: ({ row }) => {
          const category = row.original;

          if (editingCategoryId === category.id) {
            return (
              <Input
                className="w-28"
                defaultValue={editCategoryRef.current.price}
                disabled={categoryActionId === category.id}
                min={1}
                onChange={(event) => {
                  editCategoryRef.current.price = event.target.value;
                }}
                step="0.01"
                type="number"
              />
            );
          }

          return formatVenueMoney(category.defaultPriceMinor);
        },
      },
      {
        accessorKey: "screenId",
        header: "Scope",
        cell: ({ row }) => getCategoryScope(row.original),
      },
      {
        accessorKey: "usageCount",
        header: "Usage",
        cell: ({ row }) => row.original.usageCount,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const category = row.original;
          const isEditing = editingCategoryId === category.id;
          const isBusy = categoryActionId === category.id;

          if (category.screenId !== screenId) {
            return <span className="text-muted text-sm">Inherited Category</span>;
          }

          if (isEditing) {
            return (
              <div className="flex gap-2">
                <Button
                  aria-label="Save Category"
                  disabled={isBusy}
                  onClick={() => handleUpdateCategory(category)}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <Save className="size-4" />
                </Button>
                <Button
                  aria-label="Cancel Category Edit"
                  disabled={isBusy}
                  onClick={cancelCategoryEdit}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X className="size-4" />
                </Button>
              </div>
            );
          }

          return (
            <div className="flex gap-2">
              <Button
                aria-label="Edit Category"
                className="shadow-none"
                disabled={isBusy}
                onClick={() => startCategoryEdit(category)}
                size="icon"
                type="button"
                variant="outline"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                aria-label="Delete Category"
                disabled={isBusy}
                onClick={() => handleDeleteCategory(category)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [assignedCategoryIds, categoryActionId, editingCategoryId, screenId],
  );

  async function handleCreateCategory(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const category = getSeatCategoryFormData(categoryName, categoryPrice);
    if (!category.success) {
      setFormError(category.error);
      return;
    }

    setCategoryActionId("new");

    try {
      await seatCategoriesApi.create({
        color: categoryColor,
        defaultPriceMinor: category.data.defaultPriceMinor,
        name: category.data.name,
        screenId,
      });

      setCategoryName("");
      setCategoryPrice("");
      setCategoryColor("#10b981");
      toast.success({ title: "Seat Category Created." });
      await onCategoriesChange();
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to create seat category."));
    } finally {
      setCategoryActionId(null);
    }
  }

  function startCategoryEdit(category: SeatCategory) {
    editCategoryRef.current = {
      color: category.color,
      name: category.name,
      price: String(category.defaultPriceMinor / 100),
    };
    setEditingCategoryId(category.id);
    setFormError(null);
  }

  function cancelCategoryEdit() {
    setEditingCategoryId(null);
    editCategoryRef.current = {
      color: "#10b981",
      name: "",
      price: "",
    };
  }

  async function handleUpdateCategory(category: SeatCategory) {
    setFormError(null);

    const nextCategory = getSeatCategoryFormData(
      editCategoryRef.current.name,
      editCategoryRef.current.price,
    );
    if (!nextCategory.success) {
      setFormError(nextCategory.error);
      return;
    }

    setCategoryActionId(category.id);

    try {
      await seatCategoriesApi.update(category.id, {
        color: editCategoryRef.current.color,
        defaultPriceMinor: nextCategory.data.defaultPriceMinor,
        name: nextCategory.data.name,
        screenId,
      });

      cancelCategoryEdit();
      toast.success({ title: "Seat Category Updated." });
      await onCategoriesChange();
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to update seat category."));
    } finally {
      setCategoryActionId(null);
    }
  }

  async function handleDeleteCategory(category: SeatCategory) {
    setFormError(null);

    if (isSeatCategoryAssigned(category, assignedCategoryIds)) {
      setFormError("Remove this category from all seats before deleting it.");
      return;
    }

    setCategoryActionId(category.id);

    try {
      await seatCategoriesApi.delete(category.id);
      toast.success({ title: "Seat Category Deleted." });
      await onCategoriesChange();
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to delete seat category."));
    } finally {
      setCategoryActionId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold tracking-normal">Seat Categories</h3>
        <p className="text-muted mt-1 text-sm">
          Manage screen-specific categories and pricing used by this screen's seat layout.
        </p>
      </div>

      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <Form
        className="bg-surface grid gap-4 rounded-lg border p-4 shadow-sm lg:grid-cols-[1fr_10rem_8rem_auto] lg:items-end"
        disabled={categoryActionId === "new"}
        noValidate
        onSubmit={handleCreateCategory}
      >
        <div className="space-y-2">
          <Label htmlFor="categoryName">Category Name</Label>
          <Input
            disabled={categoryActionId === "new"}
            id="categoryName"
            maxLength={160}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="Standard"
            value={categoryName}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryPrice">Default Price</Label>
          <Input
            disabled={categoryActionId === "new"}
            id="categoryPrice"
            min={1}
            onChange={(event) => setCategoryPrice(event.target.value)}
            placeholder="12.50"
            step="0.01"
            type="number"
            value={categoryPrice}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryColor">Color</Label>
          <Input
            className="h-10 p-1"
            disabled={categoryActionId === "new"}
            id="categoryColor"
            onChange={(event) => setCategoryColor(event.target.value)}
            type="color"
            value={categoryColor}
          />
        </div>

        <Button disabled={categoryActionId === "new"} type="submit">
          Add Category
        </Button>
      </Form>

      <DataTable
        columns={columns}
        data={categories}
        emptyMessage={isLoading ? "Loading Seat Categories..." : "No seat categories found."}
        loadingMessage="Loading Seat Categories..."
        resultLabel="seat categories"
      />
    </div>
  );
}

function getCategoryScope(category: SeatCategory) {
  if (category.screenId) return "Screen";
  if (category.venueId) return "Venue";

  return "Global";
}
