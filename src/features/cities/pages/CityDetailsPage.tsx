import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, ArrowLeft, Building2, Eye, MapPin, Pencil, RefreshCcw } from "lucide-react";

import { CityStatusBadge } from "../components/CityStatusBadge";
import { citiesApi } from "../services/citiesApi";
import type { City } from "../types/cityTypes";
import { formatCityDate, formatOptionalCityValue } from "../utils/cityFormatters";

import { VenueStatusBadge } from "#/features/venues/components/VenueStatusBadge";
import { venuesApi } from "#/features/venues/services/venuesApi";
import type { ListVenuesQuery, Venue } from "#/features/venues/types/venueTypes";
import { formatOptionalVenueValue } from "#/features/venues/utils/venueFormatters";

import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { Button } from "#/shared/components/ui/button";
import { DataTable } from "#/shared/components/ui/data-table";
import type { ApiPaginated } from "#/shared/types";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

type CityInfoItem = {
  label: string;
  value: string;
};

const initialVenues: ApiPaginated<Venue> = {
  items: [],
  limit: 10,
  page: 1,
  total: 0,
};

export default function CityDetailsPage() {
  const { cityId } = useParams({ from: "/_protected/cities/$cityId" });
  const [city, setCity] = useState<City | null>(null);
  const [venues, setVenues] = useState<ApiPaginated<Venue>>(initialVenues);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCityLoading, setIsCityLoading] = useState(true);
  const [isVenuesLoading, setIsVenuesLoading] = useState(true);
  const [cityErrorMessage, setCityErrorMessage] = useState<string | null>(null);
  const [venuesErrorMessage, setVenuesErrorMessage] = useState<string | null>(null);

  const cityInfo: Array<CityInfoItem> = city
    ? [
        {
          label: "Slug",
          value: formatOptionalCityValue(city.slug),
        },
        {
          label: "Timezone",
          value: formatOptionalCityValue(city.timezone),
        },
        {
          label: "Created",
          value: formatCityDate(city.createdAt),
        },
        {
          label: "Last Updated",
          value: formatCityDate(city.updatedAt),
        },
      ]
    : [];

  const venueColumns = useMemo<Array<ColumnDef<Venue>>>(
    () => [
      {
        accessorKey: "name",
        header: "Venue",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => (
          <span className="text-muted block max-w-md truncate">
            {formatOptionalVenueValue(row.original.address)}
          </span>
        ),
      },
      {
        accessorKey: "contactEmail",
        header: "Contact",
        cell: ({ row }) => {
          const venue = row.original;

          return (
            <div className="space-y-1 text-sm">
              <p>{formatOptionalVenueValue(venue.contactEmail)}</p>
              <p className="text-muted">{formatOptionalVenueValue(venue.contactPhone)}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => <VenueStatusBadge active={row.original.active} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button asChild size="sm" variant="outline">
            <Link params={{ venueId: row.original.id }} to="/venues/$venueId">
              <Eye className="size-4" />
              View
            </Link>
          </Button>
        ),
      },
    ],
    [],
  );

  useEffect(() => {
    void loadCity();
  }, [cityId]);

  useEffect(() => {
    void loadVenues();
  }, [cityId, limit, page]);

  async function loadCity() {
    setIsCityLoading(true);
    setCityErrorMessage(null);

    try {
      const response = await citiesApi.get(cityId);
      setCity(response.data.city);
    } catch (error) {
      setCityErrorMessage(getApiErrorMessage(error, "Unable to load city details."));
      setCity(null);
    } finally {
      setIsCityLoading(false);
    }
  }

  async function loadVenues() {
    setIsVenuesLoading(true);
    setVenuesErrorMessage(null);

    try {
      const query = getVenuesQuery();
      const response = await venuesApi.list(query);
      setVenues(response.data);
    } catch (error) {
      setVenuesErrorMessage(getApiErrorMessage(error, "Unable to load city venues."));
      setVenues(initialVenues);
    } finally {
      setIsVenuesLoading(false);
    }
  }

  function getVenuesQuery(): ListVenuesQuery {
    return {
      cityId,
      limit,
      page,
    };
  }

  function handleLimitChange(nextLimit: number) {
    setLimit(nextLimit);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button asChild aria-label="Back to cities" size="icon" variant="ghost">
              <Link to="/cities">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>

            <h2 className="text-2xl font-semibold tracking-normal">View City</h2>
          </div>

          <p className="text-muted mt-2 text-sm">
            View City Metadata, Availability, And Venues Connected To This Service Area.
          </p>
        </div>

        {city ? (
          <Button asChild type="button">
            <Link params={{ cityId: city.id }} to="/cities/$cityId/edit">
              <Pencil className="size-4" />
              Edit
            </Link>
          </Button>
        ) : null}
      </div>

      {cityErrorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{cityErrorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {isCityLoading ? (
        <div className="bg-surface rounded-lg border p-6 shadow-sm">
          <p className="text-muted text-sm font-medium">Loading City Details...</p>
        </div>
      ) : null}

      {city ? (
        <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-md">
                <MapPin className="size-6" />
              </div>

              <CityStatusBadge active={city.active} />
            </div>

            <h3 className="mt-5 text-xl font-semibold tracking-normal">{city.name}</h3>
            <p className="text-muted mt-2 text-sm">{formatOptionalCityValue(city.slug)}</p>
          </div>

          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Building2 className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">City Information</h3>
            </div>

            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {cityInfo.map((item) => (
                <div key={item.label}>
                  <dt className="text-muted text-xs font-medium uppercase">{item.label}</dt>
                  <dd className="mt-1 text-sm font-medium">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold tracking-normal">Venues</h3>
            <p className="text-muted mt-1 text-sm">Venues Assigned To This City.</p>
          </div>

          <Button disabled={isVenuesLoading} onClick={loadVenues} type="button" variant="outline">
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>

        {venuesErrorMessage ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{venuesErrorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <DataTable
          columns={venueColumns}
          data={venues.items}
          emptyMessage={isVenuesLoading ? "Loading Venues..." : "No Venues Found For This City."}
          loadingMessage="Loading Venues..."
          pagination={{
            isLoading: isVenuesLoading,
            limit: venues.limit,
            onPageChange: handlePageChange,
            page: venues.page,
            rowsPerPage: {
              onLimitChange: handleLimitChange,
            },
            total: venues.total,
          }}
          resultLabel="venues"
        />
      </div>
    </section>
  );
}
