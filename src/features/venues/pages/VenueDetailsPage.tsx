import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Link, useParams } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CircleDollarSign,
  LayoutGrid,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { citiesApi } from "#/features/cities/services/citiesApi";
import type { City } from "#/features/cities/types/cityTypes";
import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { Button } from "#/shared/components/ui/button";
import { DataTable } from "#/shared/components/ui/data-table";
import { Input } from "#/shared/components/ui/input";
import { Label } from "#/shared/components/ui/label";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import { SeatDefinitionsPreview } from "../components/SeatDefinitionsPreview";
import { VenueStatusBadge } from "../components/VenueStatusBadge";
import { seatCategoriesApi } from "../services/seatCategoriesApi";
import { screensApi } from "../services/screensApi";
import { seatLayoutsApi } from "../services/seatLayoutsApi";
import { venuesApi } from "../services/venuesApi";
import type { Screen } from "../types/screenTypes";
import type { SeatCategory } from "../types/seatCategoryTypes";
import type { SeatLayout } from "../types/seatLayoutTypes";
import type { Venue } from "../types/venueTypes";
import { getSeatDefinitionsForDisplay } from "../utils/seatLayoutUtils";
import {
  formatOptionalVenueValue,
  formatVenueDate,
  formatVenueMoney,
} from "../utils/venueFormatters";

type VenueInfoItem = {
  label: string;
  value: string;
};

type ScreenRow = {
  layout: SeatLayout | null;
  screen: Screen;
};

export default function VenueDetailsPage() {
  const { venueId } = useParams({ from: "/_protected/venues/$venueId" });
  const [venue, setVenue] = useState<Venue | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const [categories, setCategories] = useState<Array<SeatCategory>>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryPrice, setCategoryPrice] = useState("");
  const [categoryColor, setCategoryColor] = useState("#10b981");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryPrice, setEditCategoryPrice] = useState("");
  const [editCategoryColor, setEditCategoryColor] = useState("#10b981");
  const [screens, setScreens] = useState<Array<Screen>>([]);
  const [layoutByScreenId, setLayoutByScreenId] = useState<Map<string, SeatLayout>>(new Map());
  const [isVenueLoading, setIsVenueLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [categoryActionId, setCategoryActionId] = useState<string | null>(null);
  const [isSetupLoading, setIsSetupLoading] = useState(true);
  const [venueErrorMessage, setVenueErrorMessage] = useState<string | null>(null);
  const [categoriesErrorMessage, setCategoriesErrorMessage] = useState<string | null>(null);
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);
  const [setupErrorMessage, setSetupErrorMessage] = useState<string | null>(null);

  const venueInfo: Array<VenueInfoItem> = venue
    ? [
        {
          label: "City",
          value: city?.name ?? "Unknown city",
        },
        {
          label: "Timezone",
          value: formatOptionalVenueValue(venue.timezone),
        },
        {
          label: "Created",
          value: formatVenueDate(venue.createdAt),
        },
        {
          label: "Last Updated",
          value: formatVenueDate(venue.updatedAt),
        },
      ]
    : [];

  const totalCapacity = useMemo(
    () => [...layoutByScreenId.values()].reduce((total, layout) => total + layout.seatCount, 0),
    [layoutByScreenId],
  );

  const screenRows = useMemo<Array<ScreenRow>>(
    () =>
      screens.map((screen) => ({
        layout: layoutByScreenId.get(screen.id) ?? null,
        screen,
      })),
    [layoutByScreenId, screens],
  );

  const screenColumns = useMemo<Array<ColumnDef<ScreenRow>>>(
    () => [
      {
        accessorKey: "screen.name",
        header: "Screen",
        cell: ({ row }) => {
          const { screen } = row.original;

          return (
            <div className="space-y-1">
              <p className="font-medium">{screen.name}</p>
              <p className="text-muted text-sm capitalize">{screen.screenType}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "layout.name",
        header: "Active Layout",
        cell: ({ row }) => row.original.layout?.name ?? "No Active Layout",
      },
      {
        accessorKey: "layout.seatCount",
        header: "Capacity",
        cell: ({ row }) => row.original.layout?.seatCount ?? 0,
      },
      {
        accessorKey: "screen.sortOrder",
        header: "Sort Order",
        cell: ({ row }) => row.original.screen.sortOrder,
      },
      {
        accessorKey: "screen.active",
        header: "Status",
        cell: ({ row }) => <VenueStatusBadge active={row.original.screen.active} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button asChild size="sm" variant="outline">
            <Link
              params={{ screenId: row.original.screen.id, venueId }}
              to="/venues/$venueId/screens/$screenId/edit"
            >
              <Pencil className="size-3" />
              Edit
            </Link>
          </Button>
        ),
      },
    ],
    [venueId],
  );

  const categoryColumns = useMemo<Array<ColumnDef<SeatCategory>>>(
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
                  disabled={categoryActionId === category.id}
                  onChange={(event) => setEditCategoryName(event.target.value)}
                  value={editCategoryName}
                />
                <Input
                  className="h-10 w-12 p-1"
                  disabled={categoryActionId === category.id}
                  onChange={(event) => setEditCategoryColor(event.target.value)}
                  type="color"
                  value={editCategoryColor}
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
                disabled={categoryActionId === category.id}
                min={0}
                onChange={(event) => setEditCategoryPrice(event.target.value)}
                step="0.01"
                type="number"
                value={editCategoryPrice}
              />
            );
          }

          return formatVenueMoney(category.defaultPriceMinor);
        },
      },
      {
        accessorKey: "venueId",
        header: "Scope",
        cell: ({ row }) => (row.original.venueId ? "Venue" : "Global"),
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

          if (!category.venueId) {
            return <span className="text-muted text-sm">Global Category</span>;
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
    [categoryActionId, editCategoryColor, editCategoryName, editCategoryPrice, editingCategoryId],
  );

  useEffect(() => {
    void loadVenue();
    void loadSeatCategories();
    void loadVenueSetup();
  }, [venueId]);

  async function loadVenue() {
    setIsVenueLoading(true);
    setVenueErrorMessage(null);

    try {
      const response = await venuesApi.get(venueId);
      const nextVenue = response.data.venue;
      setVenue(nextVenue);

      try {
        const cityResponse = await citiesApi.get(nextVenue.cityId);
        setCity(cityResponse.data.city);
      } catch {
        setCity(null);
      }
    } catch (error) {
      setVenueErrorMessage(getApiErrorMessage(error, "Unable to load venue details."));
      setVenue(null);
      setCity(null);
    } finally {
      setIsVenueLoading(false);
    }
  }

  async function loadVenueSetup() {
    setIsSetupLoading(true);
    setSetupErrorMessage(null);

    try {
      const screensResponse = await screensApi.list({ venueId });
      const nextScreens = screensResponse.data.screens;
      setScreens(nextScreens);

      const layoutEntries = await Promise.all(
        nextScreens.map(async (screen) => {
          const layoutsResponse = await seatLayoutsApi.list({ screenId: screen.id });
          const layoutSummary =
            layoutsResponse.data.layouts.find((layout) => layout.isActive) ??
            layoutsResponse.data.layouts[0];

          if (!layoutSummary) {
            return [screen.id, null] as const;
          }

          const layoutResponse = await seatLayoutsApi.get(layoutSummary.id);

          return [screen.id, layoutResponse.data.layout] as const;
        }),
      );

      setLayoutByScreenId(
        new Map(
          layoutEntries.flatMap(([screenId, layout]) => (layout ? [[screenId, layout]] : [])),
        ),
      );
    } catch (error) {
      setSetupErrorMessage(getApiErrorMessage(error, "Unable to load screens and seat layouts."));
      setScreens([]);
      setLayoutByScreenId(new Map());
    } finally {
      setIsSetupLoading(false);
    }
  }

  async function loadSeatCategories() {
    setIsCategoriesLoading(true);
    setCategoriesErrorMessage(null);

    try {
      const response = await seatCategoriesApi.list({ limit: 100, page: 1, venueId });
      setCategories(response.data.items);
    } catch (error) {
      setCategoriesErrorMessage(getApiErrorMessage(error, "Unable to load seat categories."));
      setCategories([]);
    } finally {
      setIsCategoriesLoading(false);
    }
  }

  async function handleCreateCategory(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setCategoryFormError(null);

    const trimmedName = categoryName.trim();
    const price = Number(categoryPrice);

    if (!trimmedName) {
      setCategoryFormError("Category Name is required.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setCategoryFormError("Default Price must be zero or more.");
      return;
    }

    setIsCategorySubmitting(true);

    try {
      await seatCategoriesApi.create({
        color: categoryColor,
        defaultPriceMinor: Math.round(price * 100),
        name: trimmedName,
        venueId,
      });

      setCategoryName("");
      setCategoryPrice("");
      setCategoryColor("#10b981");
      toast.success({ title: "Seat Category Created." });
      await loadSeatCategories();
    } catch (error) {
      setCategoryFormError(getApiErrorMessage(error, "Unable to create seat category."));
    } finally {
      setIsCategorySubmitting(false);
    }
  }

  function startCategoryEdit(category: SeatCategory) {
    setEditingCategoryId(category.id);
    setEditCategoryName(category.name);
    setEditCategoryPrice(String(category.defaultPriceMinor / 100));
    setEditCategoryColor(category.color);
    setCategoryFormError(null);
  }

  function cancelCategoryEdit() {
    setEditingCategoryId(null);
    setEditCategoryName("");
    setEditCategoryPrice("");
    setEditCategoryColor("#10b981");
  }

  async function handleUpdateCategory(category: SeatCategory) {
    setCategoryFormError(null);

    const trimmedName = editCategoryName.trim();
    const price = Number(editCategoryPrice);

    if (!trimmedName) {
      setCategoryFormError("Category Name is required.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setCategoryFormError("Default Price must be zero or more.");
      return;
    }

    setCategoryActionId(category.id);

    try {
      await seatCategoriesApi.update(category.id, {
        color: editCategoryColor,
        defaultPriceMinor: Math.round(price * 100),
        name: trimmedName,
        venueId: category.venueId,
      });

      cancelCategoryEdit();
      toast.success({ title: "Seat Category Updated." });
      await loadSeatCategories();
    } catch (error) {
      setCategoryFormError(getApiErrorMessage(error, "Unable to update seat category."));
    } finally {
      setCategoryActionId(null);
    }
  }

  async function handleDeleteCategory(category: SeatCategory) {
    setCategoryFormError(null);
    setCategoryActionId(category.id);

    try {
      await seatCategoriesApi.delete(category.id);
      toast.success({ title: "Seat Category Deleted." });
      await loadSeatCategories();
    } catch (error) {
      setCategoryFormError(getApiErrorMessage(error, "Unable to delete seat category."));
    } finally {
      setCategoryActionId(null);
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

            <h2 className="text-2xl font-semibold tracking-normal">View Venue</h2>
          </div>

          <p className="text-muted mt-2 text-sm">
            View venue details, screens, seat capacity, and active seating layouts.
          </p>
        </div>

        {venue ? (
          <Button asChild type="button">
            <Link params={{ venueId: venue.id }} to="/venues/$venueId/edit">
              <Pencil className="size-4" />
              Edit
            </Link>
          </Button>
        ) : null}
      </div>

      {venueErrorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{venueErrorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {isVenueLoading ? (
        <div className="bg-surface rounded-lg border p-6 shadow-sm">
          <p className="text-muted text-sm font-medium">Loading Venue Details...</p>
        </div>
      ) : null}

      {venue ? (
        <div className="grid items-start gap-6 xl:grid-cols-[22rem_1fr]">
          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-md">
                <Building2 className="size-6" />
              </div>

              <VenueStatusBadge active={venue.active} />
            </div>

            <h3 className="mt-5 text-xl font-semibold tracking-normal">{venue.name}</h3>
            <p className="text-muted mt-2 text-sm">{city?.name ?? "Unknown city"}</p>

            <div className="mt-5 rounded-md border p-4">
              <p className="text-muted text-xs font-medium uppercase">Total Capacity</p>
              <p className="mt-1 text-3xl font-semibold tracking-normal">{totalCapacity}</p>
              <p className="text-muted mt-1 text-sm">Seats across {screens.length} screens.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface rounded-lg border p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <MapPin className="text-primary size-5" />
                <h3 className="text-base font-semibold tracking-normal">Venue Information</h3>
              </div>

              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {venueInfo.map((item) => (
                  <div key={item.label}>
                    <dt className="text-muted text-xs font-medium uppercase">{item.label}</dt>
                    <dd className="mt-1 text-sm font-medium">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="bg-surface rounded-lg border p-6 shadow-sm">
              <h3 className="text-base font-semibold tracking-normal">Address</h3>
              <p className="text-muted mt-3 text-sm leading-6">
                {formatOptionalVenueValue(venue.address)}
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-surface rounded-lg border p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Mail className="text-primary size-5" />
                  <h3 className="text-base font-semibold tracking-normal">Email</h3>
                </div>
                <p className="text-sm font-medium">
                  {formatOptionalVenueValue(venue.contactEmail)}
                </p>
              </div>

              <div className="bg-surface rounded-lg border p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Phone className="text-primary size-5" />
                  <h3 className="text-base font-semibold tracking-normal">Phone</h3>
                </div>
                <p className="text-sm font-medium">
                  {formatOptionalVenueValue(venue.contactPhone)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold tracking-normal">Screens</h3>
            <p className="text-muted mt-1 text-sm">
              Screens and active seat layouts in this venue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild type="button">
              <Link params={{ venueId }} to="/venues/$venueId/screens/new">
                <Plus className="size-4" />
                Add Screen
              </Link>
            </Button>

            <Button
              disabled={isSetupLoading}
              onClick={loadVenueSetup}
              type="button"
              variant="outline"
            >
              <RefreshCcw className="size-4" />
              Refresh
            </Button>
          </div>
        </div>

        {setupErrorMessage ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{setupErrorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <DataTable
          columns={screenColumns}
          data={screenRows}
          emptyMessage={isSetupLoading ? "Loading Screens..." : "No screens found for this venue."}
          loadingMessage="Loading Screens..."
          resultLabel="screens"
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold tracking-normal">Seat Categories</h3>
          <p className="text-muted mt-1 text-sm">
            Manage venue-specific seat categories used by screen layouts.
          </p>
        </div>

        {categoriesErrorMessage ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{categoriesErrorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {categoryFormError ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{categoryFormError}</AlertDescription>
          </Alert>
        ) : null}

        <form
          className="bg-surface grid gap-4 rounded-lg border p-4 shadow-sm lg:grid-cols-[1fr_10rem_8rem_auto] lg:items-end"
          onSubmit={handleCreateCategory}
        >
          <div className="space-y-2">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              disabled={isCategorySubmitting}
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
              disabled={isCategorySubmitting}
              id="categoryPrice"
              min={0}
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
              disabled={isCategorySubmitting}
              id="categoryColor"
              onChange={(event) => setCategoryColor(event.target.value)}
              type="color"
              value={categoryColor}
            />
          </div>

          <Button disabled={isCategorySubmitting} type="submit">
            <CircleDollarSign className="size-4" />
            Add Category
          </Button>
        </form>

        <DataTable
          columns={categoryColumns}
          data={categories}
          emptyMessage={
            isCategoriesLoading ? "Loading Seat Categories..." : "No seat categories found."
          }
          loadingMessage="Loading Seat Categories..."
          resultLabel="seat categories"
        />
      </div>

      {screenRows.length ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold tracking-normal">Seat Layouts</h3>
            <p className="text-muted mt-1 text-sm">
              Active seat arrangement preview for each screen.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {screenRows.map(({ layout, screen }) => (
              <div className="bg-surface rounded-lg border p-6 shadow-sm" key={screen.id}>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="text-primary size-5" />
                      <h4 className="text-base font-semibold tracking-normal">{screen.name}</h4>
                    </div>
                    <p className="text-muted mt-1 text-sm">
                      {layout ? `${layout.name} · ${layout.seatCount} seats` : "No Active Layout"}
                    </p>
                  </div>

                  <VenueStatusBadge active={screen.active} />
                </div>

                <SeatDefinitionsPreview seats={getSeatDefinitionsForDisplay(layout)} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
