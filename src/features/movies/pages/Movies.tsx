import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Eye, FilterX, Pencil, Plus, RefreshCcw, Search } from "lucide-react";

// import { MovieDeleteDialog } from "../components/MovieDeleteDialog";
import { moviesApi } from "../services/moviesApi";
import type { ListMoviesQuery, Movie } from "../types/movieTypes";
import {
  formatMovieDate,
  formatMovieDuration,
  formatOptionalMovieValue,
} from "../utils/movieFormatters";

import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { Button } from "#/shared/components/ui/button";
import { DataTable } from "#/shared/components/ui/data-table";
import { Input } from "#/shared/components/ui/input";
import { Label } from "#/shared/components/ui/label";
import type { ApiPaginated } from "#/shared/types";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

const initialMovies: ApiPaginated<Movie> = {
  items: [],
  limit: 20,
  page: 1,
  total: 0,
};

export default function Movies() {
  const [movies, setMovies] = useState<ApiPaginated<Movie>>(initialMovies);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const columns = useMemo<Array<ColumnDef<Movie>>>(
    () => [
      {
        accessorKey: "title",
        header: "Movie",
        cell: ({ row }) => {
          const movie = row.original;

          return (
            <div className="flex min-w-72 items-center gap-3">
              <div className="bg-surface-muted flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border">
                {movie.posterUrl ? (
                  <img alt="" className="size-full object-cover" src={movie.posterUrl} />
                ) : (
                  <span className="text-muted text-xs font-medium">No Poster</span>
                )}
              </div>

              <Link
                className="hover:text-primary min-w-0 truncate font-medium transition-colors hover:underline"
                params={{ movieId: movie.id }}
                to="/movies/$movieId"
              >
                {movie.title}
              </Link>
            </div>
          );
        },
      },
      {
        accessorKey: "genre",
        header: "Genre",
        cell: ({ row }) => formatOptionalMovieValue(row.original.genre),
      },
      {
        accessorKey: "durationMinutes",
        header: "Duration",
        cell: ({ row }) => formatMovieDuration(row.original.durationMinutes),
      },
      {
        accessorKey: "releaseDate",
        header: "Release Date",
        cell: ({ row }) => formatMovieDate(row.original.releaseDate),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const movie = row.original;

          return (
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link params={{ movieId: movie.id }} to="/movies/$movieId">
                  <Eye className="size-4" />
                  View
                </Link>
              </Button>

              <Button asChild size="sm" variant="outline">
                <Link params={{ movieId: movie.id }} to="/movies/$movieId/edit">
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>

              {/* <MovieDeleteDialog movie={movie} onDeleted={handleMovieDeleted} size="sm" /> */}
            </div>
          );
        },
      },
    ],
    [],
  );

  useEffect(() => {
    void loadMovies();
  }, [limit, page, submittedSearch]);

  async function loadMovies() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const query = getMoviesQuery();
      const response = await moviesApi.list(query);
      setMovies(response.data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable To Load Movies."));
    } finally {
      setIsLoading(false);
    }
  }

  function getMoviesQuery(): ListMoviesQuery {
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

  // function handleMovieDeleted() {
  //   if (movies.items.length === 1 && page > 1) {
  //     setPage((currentPage) => currentPage - 1);
  //     return;
  //   }
  //
  //   void loadMovies();
  // }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal">Movies</h2>
          <p className="text-muted mt-2 text-sm">
            Manage Movie Listings, Posters, Metadata, Release Details, And Catalog Availability.
          </p>
        </div>

        <Button asChild>
          <Link to="/movies/new">
            <Plus className="size-4" />
            Add Movie
          </Link>
        </Button>
      </div>

      <form
        className="bg-surface grid gap-4 rounded-lg border p-4 shadow-sm lg:grid-cols-[20rem_auto] lg:items-end"
        onSubmit={handleSearch}
      >
        <div>
          <Label htmlFor="movie-search">Search By Title</Label>

          <div className="relative">
            <Search className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              className="pl-9"
              disabled={isLoading}
              id="movie-search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Movie Title"
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
            aria-label="Reset Movie Filters"
            disabled={isLoading}
            onClick={handleResetFilters}
            type="button"
            variant="outline"
          >
            <FilterX className="size-4" />
            Clear
          </Button>
          <Button disabled={isLoading} onClick={loadMovies} type="button" variant="outline">
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
        data={movies.items}
        emptyMessage={isLoading ? "Loading Movies..." : "No Movies Found."}
        loadingMessage="Loading Movies..."
        pagination={{
          isLoading,
          limit: movies.limit,
          onPageChange: handlePageChange,
          page: movies.page,
          rowsPerPage: {
            onLimitChange: handleLimitChange,
          },
          total: movies.total,
        }}
        resultLabel="Movies"
      />
    </section>
  );
}
