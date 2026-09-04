import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, ExternalLink, Pencil } from "lucide-react";

import { MovieStatusBadge } from "../components/MovieStatusBadge";
import { moviesApi } from "../services/moviesApi";
import type { Movie } from "../types/movieTypes";
import {
  formatMovieDate,
  formatMovieDuration,
  formatOptionalMovieValue,
} from "../utils/movieFormatters";

import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { Button } from "#/shared/components/ui/button";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

type MovieInfoItem = {
  label: string;
  value: string;
};

type MovieCreditItem = {
  label: string;
  values: Array<string>;
};

export default function MovieDetailsPage() {
  const { movieId } = useParams({ from: "/_protected/movies/$movieId" });
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const movieInfo: Array<MovieInfoItem> = movie
    ? [
        {
          label: "Genre",
          value: formatOptionalMovieValue(movie.genre),
        },
        {
          label: "Duration",
          value: formatMovieDuration(movie.durationMinutes),
        },
        {
          label: "Age Rating",
          value: formatOptionalMovieValue(movie.ageRating),
        },
        {
          label: "Release Date",
          value: formatMovieDate(movie.releaseDate),
        },
        {
          label: "Created",
          value: formatMovieDate(movie.createdAt),
        },
        {
          label: "Last Updated",
          value: formatMovieDate(movie.updatedAt),
        },
      ]
    : [];
  const movieCredits: Array<MovieCreditItem> = movie
    ? [
        {
          label: "Directors",
          values: movie.directors,
        },
        {
          label: "Producers",
          values: movie.producers,
        },
        {
          label: "Writers",
          values: movie.writers,
        },
        {
          label: "Cast",
          values: movie.cast,
        },
      ]
    : [];

  useEffect(() => {
    void loadMovie();
  }, [movieId]);

  async function loadMovie() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await moviesApi.get(movieId);
      setMovie(response.data.movie);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to load movie details."));
      setMovie(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button asChild aria-label="Back to movies" size="icon" variant="ghost">
              <Link to="/movies">
                <ArrowLeft className="size-3" />
              </Link>
            </Button>

            <h2 className="text-2xl font-semibold tracking-normal">View Movie</h2>
          </div>

          <p className="text-muted mt-2 text-sm">
            View movie metadata, media, availability, and linked show schedules.
          </p>
        </div>

        {movie ? (
          <div className="flex gap-2">
            {movie.trailerUrl ? (
              <Button asChild type="button" variant="outline">
                <a href={movie.trailerUrl} rel="noreferrer" target="_blank">
                  <ExternalLink className="size-4" />
                  Watch Trailer
                </a>
              </Button>
            ) : null}

            <Button asChild type="button">
              <Link params={{ movieId: movie.id }} to="/movies/$movieId/edit">
                <Pencil className="size-4" />
                Edit
              </Link>
            </Button>
          </div>
        ) : null}
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="bg-surface rounded-lg border p-6 shadow-sm">
          <p className="text-muted text-sm font-medium">Loading Movie Details...</p>
        </div>
      ) : null}

      {movie ? (
        <div className="grid items-start gap-6 xl:grid-cols-[22rem_1fr]">
          <div className="bg-surface overflow-hidden rounded-lg border shadow-sm">
            <div className="bg-surface-muted aspect-[2/3]">
              {movie.posterUrl ? (
                <img alt={movie.title} className="size-full object-cover" src={movie.posterUrl} />
              ) : (
                <div className="text-muted flex size-full items-center justify-center px-6 text-center text-sm font-medium">
                  No Poster Image Added
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface rounded-lg border p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-semibold tracking-normal">{movie.title}</h3>
                <MovieStatusBadge active={movie.active} />
              </div>

              <p className="text-muted mt-3 text-sm leading-6">
                {formatOptionalMovieValue(movie.overview, "No Overview Added.")}
              </p>
            </div>

            <div className="bg-surface rounded-lg border p-6 shadow-sm">
              <h3 className="text-base font-semibold tracking-normal">Movie Information</h3>

              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {movieInfo.map((item) => (
                  <div key={item.label}>
                    <dt className="text-muted text-xs font-medium uppercase">{item.label}</dt>
                    <dd className="mt-1 text-sm font-medium">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="bg-surface rounded-lg border p-6 shadow-sm">
              <h3 className="text-base font-semibold tracking-normal">Credits</h3>

              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {movieCredits.map((item) => (
                  <div key={item.label}>
                    <dt className="text-muted text-xs font-medium uppercase">{item.label}</dt>
                    <dd className="mt-1 text-sm font-medium">{formatCreditList(item.values)}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="bg-surface rounded-lg border p-6 shadow-sm">
              <h3 className="text-base font-semibold tracking-normal">Catalog Links</h3>

              <dl className="mt-4 grid gap-4">
                <div>
                  <dt className="text-muted text-xs font-medium uppercase">Poster URL</dt>
                  <dd className="mt-1 text-sm break-all">
                    {movie.posterUrl ? (
                      <a
                        className="text-primary font-medium hover:underline"
                        href={movie.posterUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {movie.posterUrl}
                      </a>
                    ) : (
                      "Not Set"
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-muted text-xs font-medium uppercase">Cover Image URL</dt>
                  <dd className="mt-1 text-sm break-all">
                    {movie.coverImage ? (
                      <a
                        className="text-primary font-medium hover:underline"
                        href={movie.coverImage}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {movie.coverImage}
                      </a>
                    ) : (
                      "Not Set"
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-muted text-xs font-medium uppercase">Trailer URL</dt>
                  <dd className="mt-1 text-sm break-all">
                    {movie.trailerUrl ? (
                      <a
                        className="text-primary font-medium hover:underline"
                        href={movie.trailerUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {movie.trailerUrl}
                      </a>
                    ) : (
                      "Not Set"
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function formatCreditList(values: Array<string>) {
  return values.length ? values.join(", ") : "Not Set";
}
