import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  LayoutGrid,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCcw,
} from "lucide-react";

import { citiesApi } from "#/features/cities/services/citiesApi";
import type { City } from "#/features/cities/types/cityTypes";
import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { Button } from "#/shared/components/ui/button";
import { DataTable } from "#/shared/components/ui/data-table";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import { SeatDefinitionsPreview } from "../components/SeatDefinitionsPreview";
import { VenueStatusBadge } from "../components/VenueStatusBadge";
import { screensApi } from "../services/screensApi";
import { seatLayoutsApi } from "../services/seatLayoutsApi";
import { venuesApi } from "../services/venuesApi";
import type { Screen } from "../types/screenTypes";
import type { SeatLayout } from "../types/seatLayoutTypes";
import type { Venue } from "../types/venueTypes";
import { formatOptionalVenueValue, formatVenueDate } from "../utils/venueFormatters";

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
  const [screens, setScreens] = useState<Array<Screen>>([]);
  const [layoutByScreenId, setLayoutByScreenId] = useState<Map<string, SeatLayout>>(new Map());
  const [isVenueLoading, setIsVenueLoading] = useState(true);
  const [isSetupLoading, setIsSetupLoading] = useState(true);
  const [venueErrorMessage, setVenueErrorMessage] = useState<string | null>(null);
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
          label: "Last updated",
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
        header: "Active layout",
        cell: ({ row }) => row.original.layout?.name ?? "No active layout",
      },
      {
        accessorKey: "layout.seatCount",
        header: "Capacity",
        cell: ({ row }) => row.original.layout?.seatCount ?? 0,
      },
      {
        accessorKey: "screen.sortOrder",
        header: "Sort order",
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

  useEffect(() => {
    void loadVenue();
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
          <p className="text-muted text-sm font-medium">Loading venue details...</p>
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
              <p className="text-muted text-xs font-medium uppercase">Total capacity</p>
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
          emptyMessage={isSetupLoading ? "Loading screens..." : "No screens found for this venue."}
          loadingMessage="Loading screens..."
          resultLabel="screens"
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
                      {layout ? `${layout.name} · ${layout.seatCount} seats` : "No active layout"}
                    </p>
                  </div>

                  <VenueStatusBadge active={screen.active} />
                </div>

                <SeatDefinitionsPreview seats={layout?.seatDefs ?? []} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
