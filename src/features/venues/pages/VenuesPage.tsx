import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Eye, FilterX, Pencil, Plus, RefreshCcw, Search } from "lucide-react";

import { citiesApi } from "#/features/cities/services/citiesApi";
import type { City } from "#/features/cities/types/cityTypes";
import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { Button } from "#/shared/components/ui/button";
import { DataTable } from "#/shared/components/ui/data-table";
import { Input } from "#/shared/components/ui/input";
import { Label } from "#/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/shared/components/ui/select";
import type { ApiPaginated } from "#/shared/types";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import { venuesApi } from "../services/venuesApi";
import type { ListVenuesQuery, Venue } from "../types/venueTypes";
import { formatOptionalVenueValue } from "../utils/venueFormatters";
import { VenueStatusBadge } from "../components/VenueStatusBadge";

const allCitiesValue = "all";

const initialVenues: ApiPaginated<Venue> = {
  items: [],
  limit: 20,
  page: 1,
  total: 0,
};

export default function VenuesPage() {
  const [venues, setVenues] = useState<ApiPaginated<Venue>>(initialVenues);
  const [cities, setCities] = useState<Array<City>>([]);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [cityId, setCityId] = useState(allCitiesValue);
  const [submittedCityId, setSubmittedCityId] = useState(allCitiesValue);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [citiesErrorMessage, setCitiesErrorMessage] = useState<string | null>(null);

  const cityNameById = useMemo(() => new Map(cities.map((city) => [city.id, city.name])), [cities]);

  const columns = useMemo<Array<ColumnDef<Venue>>>(
    () => [
      {
        accessorKey: "name",
        header: "Venue",
        cell: ({ row }) => {
          const venue = row.original;

          return (
            <Link
              className="hover:text-primary min-w-0 font-medium transition-colors hover:underline"
              params={{ venueId: venue.id }}
              to="/venues/$venueId"
            >
              {venue.name}
            </Link>
          );
        },
      },
      {
        accessorKey: "cityId",
        header: "Location",
        cell: ({ row }) => {
          const venue = row.original;

          return (
            <div className="space-y-1 text-sm">
              <p>{cityNameById.get(venue.cityId) ?? "Unknown city"}</p>
              <p className="text-muted max-w-md truncate">
                {formatOptionalVenueValue(venue.address)}
              </p>
            </div>
          );
        },
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
        cell: ({ row }) => {
          const venue = row.original;

          return (
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link params={{ venueId: venue.id }} to="/venues/$venueId">
                  <Eye className="size-4" />
                  View
                </Link>
              </Button>

              <Button asChild size="sm" variant="outline">
                <Link params={{ venueId: venue.id }} to="/venues/$venueId/edit">
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
            </div>
          );
        },
      },
    ],
    [cityNameById],
  );

  useEffect(() => {
    void loadCities();
  }, []);

  useEffect(() => {
    void loadVenues();
  }, [limit, page, submittedCityId, submittedSearch]);

  async function loadCities() {
    setIsCitiesLoading(true);
    setCitiesErrorMessage(null);

    try {
      const response = await citiesApi.list({ limit: 100, page: 1 });
      setCities(response.data.items);
    } catch (error) {
      setCitiesErrorMessage(getApiErrorMessage(error, "Unable to load cities for filters."));
    } finally {
      setIsCitiesLoading(false);
    }
  }

  async function loadVenues() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const query = getVenuesQuery();
      const response = await venuesApi.list(query);
      setVenues(response.data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to load venues."));
    } finally {
      setIsLoading(false);
    }
  }

  function getVenuesQuery(): ListVenuesQuery {
    return {
      cityId: submittedCityId === allCitiesValue ? undefined : submittedCityId,
      limit,
      page,
      q: submittedSearch,
    };
  }

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedSearch(search);
    setSubmittedCityId(cityId);
    setPage(1);
  }

  function handleResetFilters() {
    setSearch("");
    setSubmittedSearch("");
    setCityId(allCitiesValue);
    setSubmittedCityId(allCitiesValue);
    setLimit(20);
    setPage(1);
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal">Venues</h2>
          <p className="text-muted mt-2 text-sm">
            Manage cinema venues, city assignment, contact details, and venue availability.
          </p>
        </div>

        <Button asChild>
          <Link to="/venues/new">
            <Plus className="size-4" />
            Add Venue
          </Link>
        </Button>
      </div>

      <form
        className="bg-surface grid gap-4 rounded-lg border p-4 shadow-sm xl:grid-cols-[20rem_18rem_auto] xl:items-end"
        onSubmit={handleSearch}
      >
        <div>
          <Label htmlFor="venue-search">Search venues</Label>

          <div className="relative">
            <Search className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              className="pl-9"
              disabled={isLoading}
              id="venue-search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name or address"
              type="search"
              value={search}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="venue-city">City</Label>
          <Select disabled={isLoading || isCitiesLoading} onValueChange={setCityId} value={cityId}>
            <SelectTrigger id="venue-city">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={allCitiesValue}>All cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button className="flex-1 lg:flex-none" disabled={isLoading} type="submit">
            Search
          </Button>
          <Button
            aria-label="Reset venue filters"
            disabled={isLoading}
            onClick={handleResetFilters}
            type="button"
            variant="outline"
          >
            <FilterX className="size-4" />
            Clear
          </Button>
          <Button disabled={isLoading} onClick={loadVenues} type="button" variant="outline">
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>
      </form>

      {citiesErrorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{citiesErrorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <DataTable
        columns={columns}
        data={venues.items}
        emptyMessage={isLoading ? "Loading venues..." : "No venues found."}
        loadingMessage="Loading venues..."
        pagination={{
          isLoading,
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
    </section>
  );
}
