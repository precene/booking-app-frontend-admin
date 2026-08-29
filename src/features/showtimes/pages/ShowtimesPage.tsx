import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, CalendarClock, Eye, FilterX, Plus, RefreshCcw } from "lucide-react";

import { citiesApi } from "#/features/cities/services/citiesApi";
import { moviesApi } from "#/features/movies/services/moviesApi";
import type { Movie } from "#/features/movies/types/movieTypes";
import { screensApi } from "#/features/venues/services/screensApi";
import { venuesApi } from "#/features/venues/services/venuesApi";
import type { Screen } from "#/features/venues/types/screenTypes";
import type { Venue } from "#/features/venues/types/venueTypes";
import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { Button } from "#/shared/components/ui/button";
import { DataTable } from "#/shared/components/ui/data-table";
import { DatePicker } from "#/shared/components/ui/date-picker";
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
import { ShowtimeStatusBadge } from "../components/ShowtimeStatusBadge";
import { showtimesApi } from "../services/showtimesApi";
import type { ListShowtimesQuery, ShowStatus, ShowtimeListItem } from "../types/showtimeTypes";
import {
  formatShowtimeDateTime,
  formatShowtimeTime,
  getShowtimeDateRangeQuery,
  showtimeStatusOptions,
} from "../utils/showtimeFormatters";

const allValue = "all";

const initialShowtimes: ApiPaginated<ShowtimeListItem> = {
  items: [],
  limit: 20,
  page: 1,
  total: 0,
};

export default function ShowtimesPage() {
  const [showtimes, setShowtimes] = useState<ApiPaginated<ShowtimeListItem>>(initialShowtimes);
  const [movies, setMovies] = useState<Array<Movie>>([]);
  const [venues, setVenues] = useState<Array<Venue>>([]);
  const [screens, setScreens] = useState<Array<Screen>>([]);
  const [movieId, setMovieId] = useState(allValue);
  const [venueId, setVenueId] = useState(allValue);
  const [screenId, setScreenId] = useState(allValue);
  const [status, setStatus] = useState<ShowStatus | typeof allValue>(allValue);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [submittedFilters, setSubmittedFilters] = useState({
    fromDate: "",
    movieId: allValue,
    screenId: allValue,
    status: allValue as ShowStatus | typeof allValue,
    toDate: "",
    venueId: allValue,
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltersLoading, setIsFiltersLoading] = useState(false);
  const [isScreensLoading, setIsScreensLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filtersErrorMessage, setFiltersErrorMessage] = useState<string | null>(null);

  const selectedVenue = useMemo(
    () => venues.find((venue) => venue.id === submittedFilters.venueId),
    [submittedFilters.venueId, venues],
  );

  const columns = useMemo<Array<ColumnDef<ShowtimeListItem>>>(
    () => [
      {
        accessorKey: "movie",
        header: "Movie",
        cell: ({ row }) => <div className="min-w-56 font-medium">{row.original.movie.title}</div>,
      },
      {
        accessorKey: "venue",
        header: "Venue / Screen",
        cell: ({ row }) => (
          <div className="space-y-1 text-sm">
            <p>{row.original.venue.name}</p>
            <p className="text-muted">{row.original.screen.name}</p>
          </div>
        ),
      },
      {
        accessorKey: "startsAt",
        header: "Schedule",
        cell: ({ row }) => (
          <div className="space-y-1 text-sm">
            <p>{formatShowtimeDateTime(row.original.startsAt)}</p>
            <p className="text-muted">Ends {formatShowtimeTime(row.original.endsAt)}</p>
          </div>
        ),
      },
      {
        accessorKey: "seatSummary",
        header: "Seats",
        cell: ({ row }) => {
          const { available, total } = row.original.seatSummary;

          return (
            <span className="text-sm font-medium">
              {available} / {total} available
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <ShowtimeStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button asChild size="sm" variant="outline">
            <Link params={{ showId: row.original.id }} to="/showtimes/$showId">
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
    void loadFilterOptions();
  }, []);

  useEffect(() => {
    void loadScreens(venueId);
  }, [venueId]);

  useEffect(() => {
    void loadShowtimes();
  }, [limit, page, submittedFilters]);

  async function loadFilterOptions() {
    setIsFiltersLoading(true);
    setFiltersErrorMessage(null);

    try {
      const [citiesResponse, moviesResponse, venuesResponse] = await Promise.all([
        citiesApi.list({ active: "true", limit: 100, page: 1 }),
        moviesApi.list({ active: "true", limit: 100, page: 1 }),
        venuesApi.list({ active: "true", limit: 100, page: 1 }),
      ]);
      const activeCityIds = new Set(citiesResponse.data.items.map((city) => city.id));

      setMovies(moviesResponse.data.items.filter((movie) => movie.active));
      setVenues(
        venuesResponse.data.items.filter(
          (venue) => venue.active && activeCityIds.has(venue.cityId),
        ),
      );
    } catch (error) {
      setFiltersErrorMessage(getApiErrorMessage(error, "Unable to load showtime filter options."));
    } finally {
      setIsFiltersLoading(false);
    }
  }

  async function loadScreens(nextVenueId: string) {
    setScreenId(allValue);

    if (nextVenueId === allValue) {
      setScreens([]);
      return;
    }

    setIsScreensLoading(true);

    try {
      const response = await screensApi.list({ active: "true", venueId: nextVenueId });
      setScreens(response.data.screens.filter((screen) => screen.active));
    } catch (error) {
      setFiltersErrorMessage(getApiErrorMessage(error, "Unable to load screens for venue."));
      setScreens([]);
    } finally {
      setIsScreensLoading(false);
    }
  }

  async function loadShowtimes() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await showtimesApi.list(getShowtimesQuery());
      setShowtimes(response.data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to load showtimes."));
    } finally {
      setIsLoading(false);
    }
  }

  function getShowtimesQuery(): ListShowtimesQuery {
    const dateRange = getShowtimeDateRangeQuery(
      submittedFilters.fromDate,
      submittedFilters.toDate,
      selectedVenue?.timezone,
    );

    return {
      from: dateRange.from,
      limit,
      movieId: submittedFilters.movieId === allValue ? undefined : submittedFilters.movieId,
      page,
      screenId: submittedFilters.screenId === allValue ? undefined : submittedFilters.screenId,
      status: submittedFilters.status === allValue ? undefined : submittedFilters.status,
      to: dateRange.to,
      venueId: submittedFilters.venueId === allValue ? undefined : submittedFilters.venueId,
    };
  }

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedFilters({ fromDate, movieId, screenId, status, toDate, venueId });
    setPage(1);
  }

  function handleResetFilters() {
    setMovieId(allValue);
    setVenueId(allValue);
    setScreenId(allValue);
    setStatus(allValue);
    setFromDate("");
    setToDate("");
    setSubmittedFilters({
      fromDate: "",
      movieId: allValue,
      screenId: allValue,
      status: allValue,
      toDate: "",
      venueId: allValue,
    });
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="text-primary size-6" />
            <h2 className="text-2xl font-semibold tracking-normal">Showtimes</h2>
          </div>

          <p className="text-muted mt-2 text-sm">
            Assign movies to venue screens with scheduled date and time.
          </p>
        </div>

        <Button asChild>
          <Link to="/showtimes/new">
            <Plus className="size-4" />
            Add Showtime
          </Link>
        </Button>
      </div>

      <form
        className="bg-surface flex flex-wrap items-end gap-4 rounded-lg border p-4 shadow-sm"
        onSubmit={handleSearch}
      >
        <div className="w-full sm:w-64">
          <Label htmlFor="showtime-movie">Movie</Label>
          <Select
            disabled={isLoading || isFiltersLoading}
            onValueChange={setMovieId}
            value={movieId}
          >
            <SelectTrigger id="showtime-movie">
              <SelectValue placeholder="All movies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={allValue}>All movies</SelectItem>
              {movies.map((movie) => (
                <SelectItem key={movie.id} value={movie.id}>
                  {movie.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-64">
          <Label htmlFor="showtime-venue">Venue</Label>
          <Select
            disabled={isLoading || isFiltersLoading}
            onValueChange={setVenueId}
            value={venueId}
          >
            <SelectTrigger id="showtime-venue">
              <SelectValue placeholder="All venues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={allValue}>All venues</SelectItem>
              {venues.map((venue) => (
                <SelectItem key={venue.id} value={venue.id}>
                  {venue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-56">
          <Label htmlFor="showtime-screen">Screen</Label>
          <Select
            disabled={isLoading || isScreensLoading || venueId === allValue}
            onValueChange={setScreenId}
            value={screenId}
          >
            <SelectTrigger id="showtime-screen">
              <SelectValue placeholder="All screens" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={allValue}>All screens</SelectItem>
              {screens.map((screen) => (
                <SelectItem key={screen.id} value={screen.id}>
                  {screen.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-48">
          <Label htmlFor="showtime-status">Status</Label>
          <Select
            disabled={isLoading}
            onValueChange={(value) => setStatus(value as ShowStatus | typeof allValue)}
            value={status}
          >
            <SelectTrigger id="showtime-status">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={allValue}>All status</SelectItem>
              {showtimeStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-48">
          <Label htmlFor="showtime-from">From</Label>
          <DatePicker
            disabled={isLoading}
            id="showtime-from"
            onValueChange={setFromDate}
            value={fromDate}
          />
        </div>

        <div className="w-full sm:w-48">
          <Label htmlFor="showtime-to">To</Label>
          <DatePicker
            disabled={isLoading}
            id="showtime-to"
            onValueChange={setToDate}
            value={toDate}
          />
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Button className="flex-1 sm:flex-none" disabled={isLoading} type="submit">
            Search
          </Button>
          <Button
            aria-label="Reset showtime filters"
            disabled={isLoading}
            onClick={handleResetFilters}
            type="button"
            variant="outline"
          >
            <FilterX className="size-4" />
            Clear
          </Button>
          <Button disabled={isLoading} onClick={loadShowtimes} type="button" variant="outline">
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>
      </form>

      {filtersErrorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{filtersErrorMessage}</AlertDescription>
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
        data={showtimes.items}
        emptyMessage={isLoading ? "Loading showtimes..." : "No showtimes found."}
        loadingMessage="Loading showtimes..."
        pagination={{
          isLoading,
          limit: showtimes.limit,
          onPageChange: handlePageChange,
          page: showtimes.page,
          rowsPerPage: {
            onLimitChange: handleLimitChange,
          },
          total: showtimes.total,
        }}
        resultLabel="showtimes"
      />
    </section>
  );
}
