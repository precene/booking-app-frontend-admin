import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Eye, FilterX, Pencil, Plus, RefreshCcw, Search } from "lucide-react";

import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import type { ApiPaginated } from "#/shared/types";
import { CityStatusBadge } from "../components/CityStatusBadge";
import { citiesApi } from "../services/citiesApi";
import { formatOptionalCityValue } from "../utils/cityFormatters";
import type { City, ListCitiesQuery } from "../types/cityTypes";

import { Input } from "#/shared/components/ui/input";
import { Label } from "#/shared/components/ui/label";
import { Button } from "#/shared/components/ui/button";
import { DataTable } from "#/shared/components/ui/data-table";
import { Alert, AlertDescription } from "#/shared/components/ui/alert";

const initialCities: ApiPaginated<City> = {
  items: [],
  limit: 20,
  page: 1,
  total: 0,
};

export default function CitiesPage() {
  const [cities, setCities] = useState<ApiPaginated<City>>(initialCities);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const columns = useMemo<Array<ColumnDef<City>>>(
    () => [
      {
        accessorKey: "name",
        header: "City",
        cell: ({ row }) => {
          const city = row.original;

          return (
            <Link
              className="hover:text-primary min-w-0 font-medium transition-colors hover:underline"
              params={{ cityId: city.id }}
              to="/cities/$cityId"
            >
              {city.name}
            </Link>
          );
        },
      },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => formatOptionalCityValue(row.original.slug),
      },
      {
        accessorKey: "timezone",
        header: "Timezone",
        cell: ({ row }) => formatOptionalCityValue(row.original.timezone),
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => <CityStatusBadge active={row.original.active} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const city = row.original;

          return (
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link params={{ cityId: city.id }} to="/cities/$cityId">
                  <Eye className="size-4" />
                  View
                </Link>
              </Button>

              <Button asChild size="sm" variant="outline">
                <Link params={{ cityId: city.id }} to="/cities/$cityId/edit">
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  useEffect(() => {
    void loadCities();
  }, [limit, page, submittedSearch]);

  async function loadCities() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const query = getCitiesQuery();
      const response = await citiesApi.list(query);
      setCities(response.data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to load cities."));
    } finally {
      setIsLoading(false);
    }
  }

  function getCitiesQuery(): ListCitiesQuery {
    return {
      limit,
      page,
      q: submittedSearch,
    };
  }

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedSearch(search);
    setPage(1);
  }

  function handleResetFilters() {
    setSearch("");
    setSubmittedSearch("");
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
          <h2 className="text-2xl font-semibold tracking-normal">Cities</h2>
          <p className="text-muted mt-2 text-sm">
            Manage service cities, slugs, resolved timezones, and catalog availability.
          </p>
        </div>

        <Button asChild>
          <Link to="/cities/new">
            <Plus className="size-4" />
            Add City
          </Link>
        </Button>
      </div>

      <form
        className="bg-surface grid gap-4 rounded-lg border p-4 shadow-sm lg:grid-cols-[20rem_auto] lg:items-end"
        onSubmit={handleSearch}
      >
        <div>
          <Label htmlFor="city-search">Search by name</Label>

          <div className="relative">
            <Search className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              className="pl-9"
              disabled={isLoading}
              id="city-search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="City name"
              type="search"
              value={search}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button className="flex-1 lg:flex-none" disabled={isLoading} type="submit">
            Search
          </Button>
          <Button
            aria-label="Reset city filters"
            disabled={isLoading}
            onClick={handleResetFilters}
            type="button"
            variant="outline"
          >
            <FilterX className="size-4" />
            Clear
          </Button>
          <Button disabled={isLoading} onClick={loadCities} type="button" variant="outline">
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>
      </form>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <DataTable
        columns={columns}
        data={cities.items}
        emptyMessage={isLoading ? "Loading cities..." : "No cities found."}
        loadingMessage="Loading cities..."
        pagination={{
          isLoading,
          limit: cities.limit,
          onPageChange: handlePageChange,
          page: cities.page,
          rowsPerPage: {
            onLimitChange: handleLimitChange,
          },
          total: cities.total,
        }}
        resultLabel="cities"
      />
    </section>
  );
}
