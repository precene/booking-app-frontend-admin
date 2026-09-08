import { useEffect, useState, type SubmitEvent } from "react";
import { DateTime } from "luxon";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

import { citiesApi } from "#/features/cities/services/citiesApi";
import { moviesApi } from "#/features/movies/services/moviesApi";
import type { Movie } from "#/features/movies/types/movieTypes";
import { seatCategoriesApi } from "#/features/venues/services/seatCategoriesApi";
import { seatLayoutsApi } from "#/features/venues/services/seatLayoutsApi";
import { screensApi } from "#/features/venues/services/screensApi";
import { venuesApi } from "#/features/venues/services/venuesApi";
import type { SeatCategory } from "#/features/venues/types/seatCategoryTypes";
import type { Screen } from "#/features/venues/types/screenTypes";
import type { Venue } from "#/features/venues/types/venueTypes";
import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import { getFormValidationErrors } from "#/shared/utils/getFormValidationErrors";
import {
  getShowtimePayload,
  initialShowtimeFormValues,
  ShowtimeForm,
  type ShowtimeFormErrors,
  type ShowtimeFormValues,
} from "../components/ShowtimeForm";
import { showtimesApi } from "../services/showtimesApi";
import { showtimeFormSchema, showtimeSchema } from "../validations/showtimeValidation";

const formId = "create-showtime-form";
const movieSearchDebounceMs = 250;
const movieSearchLimit = 20;

export default function CreateShowtimePage() {
  const [showtimeForm, setShowtimeForm] = useState<ShowtimeFormValues>(initialShowtimeFormValues);
  const [venues, setVenues] = useState<Array<Venue>>([]);
  const [movies, setMovies] = useState<Array<Movie>>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [movieSearch, setMovieSearch] = useState("");
  const [screens, setScreens] = useState<Array<Screen>>([]);
  const [priceCategories, setPriceCategories] = useState<Array<SeatCategory>>([]);
  const [errors, setErrors] = useState<ShowtimeFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isVenuesLoading, setIsVenuesLoading] = useState(true);
  const [isMoviesLoading, setIsMoviesLoading] = useState(false);
  const [isScreensLoading, setIsScreensLoading] = useState(false);
  const [isPriceOverridesLoading, setIsPriceOverridesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    void loadVenues();
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadMovies(movieSearch);
    }, movieSearchDebounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [movieSearch]);

  useEffect(() => {
    void loadScreens(showtimeForm.venueId);
  }, [showtimeForm.venueId]);

  useEffect(() => {
    void loadPriceCategories(showtimeForm.screenId);
  }, [showtimeForm.screenId]);

  async function loadVenues() {
    setIsVenuesLoading(true);
    setFormError(null);

    try {
      const [citiesResponse, venuesResponse] = await Promise.all([
        citiesApi.list({ active: "true", limit: 100, page: 1 }),
        venuesApi.list({ active: "true", limit: 100, page: 1 }),
      ]);
      const activeCityIds = new Set(citiesResponse.data.items.map((city) => city.id));

      setVenues(
        venuesResponse.data.items.filter(
          (venue) => venue.active && activeCityIds.has(venue.cityId),
        ),
      );
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to load active venues."));
    } finally {
      setIsVenuesLoading(false);
    }
  }

  async function loadMovies(searchValue: string) {
    setIsMoviesLoading(true);
    setFormError(null);

    try {
      const response = await moviesApi.list({
        active: "true",
        limit: movieSearchLimit,
        page: 1,
        q: searchValue.trim(),
      });
      const activeMovies = response.data.items.filter((movie) => movie.active);

      setMovies(mergeSelectedMovie(activeMovies, selectedMovie));
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to load active movies."));
    } finally {
      setIsMoviesLoading(false);
    }
  }

  async function loadScreens(venueId: string) {
    setScreens([]);
    setPriceCategories([]);

    if (!venueId) {
      return;
    }

    setIsScreensLoading(true);
    setFormError(null);

    try {
      const screensResponse = await screensApi.list({ active: "true", venueId });
      setScreens(screensResponse.data.screens.filter((screen) => screen.active));
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to load venue screens."));
    } finally {
      setIsScreensLoading(false);
    }
  }

  async function loadPriceCategories(screenId: string) {
    setPriceCategories([]);

    if (!screenId) {
      return;
    }

    setIsPriceOverridesLoading(true);
    setFormError(null);

    try {
      const layoutsResponse = await seatLayoutsApi.list({ screenId });
      const activeLayout = layoutsResponse.data.layouts.find((layout) => layout.isActive);

      if (!activeLayout) {
        return;
      }

      const [layoutResponse, categoriesResponse] = await Promise.all([
        seatLayoutsApi.get(activeLayout.id),
        seatCategoriesApi.list({ limit: 100, page: 1, screenId }),
      ]);
      const usedCategoryIds = new Set(
        (layoutResponse.data.layout.seatDefs ?? [])
          .map((seat) => seat.categoryId)
          .filter((categoryId): categoryId is string => Boolean(categoryId)),
      );
      const usedCategories = categoriesResponse.data.items.filter((category) =>
        usedCategoryIds.has(category.id),
      );

      setPriceCategories(usedCategories);
      setShowtimeForm((currentForm) => ({
        ...currentForm,
        priceOverrides: Object.fromEntries(
          usedCategories.map((category) => [category.id, String(category.defaultPriceMinor / 100)]),
        ),
      }));
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to load screen price categories."));
    } finally {
      setIsPriceOverridesLoading(false);
    }
  }

  function updateField<TField extends keyof ShowtimeFormValues>(
    field: TField,
    value: ShowtimeFormValues[TField],
  ) {
    if (field === "movieId") {
      setSelectedMovie(movies.find((movie) => movie.id === value) ?? null);
    }

    setShowtimeForm((currentForm) => ({
      ...currentForm,
      [field]: value,
      ...(field === "venueId" ? { priceOverrides: {}, screenId: "" } : {}),
      ...(field === "screenId" ? { priceOverrides: {} } : {}),
    }));
  }

  function updateMovieSearch(value: string) {
    setMovieSearch(value);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError(null);

    const formValidation = showtimeFormSchema.safeParse(showtimeForm);

    if (!formValidation.success) {
      setErrors(getFormValidationErrors(formValidation.error));
      return;
    }

    const venue = venues.find((venueItem) => venueItem.id === formValidation.data.venueId);

    if (!venue) {
      setFormError("Selected venue is no longer available.");
      return;
    }

    if (!venue.active) {
      setFormError("Selected venue is not active.");
      return;
    }

    const movie =
      selectedMovie?.id === formValidation.data.movieId
        ? selectedMovie
        : movies.find((movieItem) => movieItem.id === formValidation.data.movieId);

    if (!movie?.active) {
      setFormError("Selected movie is not active.");
      return;
    }

    const screen = screens.find((screenItem) => screenItem.id === formValidation.data.screenId);

    if (!screen?.active) {
      setFormError("Selected screen is not active.");
      return;
    }

    const hasInvalidPriceOverride = priceCategories.some((category) => {
      const value = formValidation.data.priceOverrides[category.id];
      const amount = value === "" || value === undefined ? 0 : Number(value);

      return !Number.isFinite(amount) || amount < 0 || amount > 10000;
    });

    if (hasInvalidPriceOverride) {
      setErrors({ priceOverrides: "Price Overrides Must Be Between £0 And £10,000" });
      return;
    }

    const payload = getShowtimePayload(formValidation.data, venue, priceCategories);

    if (DateTime.fromISO(payload.startsAt) <= DateTime.now()) {
      setErrors({
        date: "Start Date And Time Must Be In The Future",
        time: "Start Date And Time Must Be In The Future",
      });
      return;
    }

    const payloadValidation = showtimeSchema.safeParse(payload);

    if (!payloadValidation.success) {
      setErrors(getFormValidationErrors(payloadValidation.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await showtimesApi.create(payloadValidation.data);
      toast.success({ title: "Showtime Created." });
      void navigate({ to: "/showtimes" });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to create showtime."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      {formError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <ShowtimeForm
        description="Select a venue, movie, screen, date, and start time for a new show."
        errors={errors}
        formId={formId}
        isMoviesLoading={isMoviesLoading}
        isPriceOverridesLoading={isPriceOverridesLoading}
        isScreensLoading={isScreensLoading}
        isSubmitting={isSubmitting}
        isVenuesLoading={isVenuesLoading}
        movieSearch={movieSearch}
        movies={movies}
        onSubmit={handleSubmit}
        onUpdateMovieSearch={updateMovieSearch}
        onUpdateField={updateField}
        priceCategories={priceCategories}
        screens={screens}
        selectedMovie={selectedMovie}
        showtimeForm={showtimeForm}
        submitLabel="Save Showtime"
        submittingLabel="Saving..."
        title="Add Showtime"
        venues={venues}
      />
    </section>
  );
}

function mergeSelectedMovie(movies: Array<Movie>, selectedMovie: Movie | null) {
  if (!selectedMovie || movies.some((movie) => movie.id === selectedMovie.id)) {
    return movies;
  }

  return [selectedMovie, ...movies];
}
