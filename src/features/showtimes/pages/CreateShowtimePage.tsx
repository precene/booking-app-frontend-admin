import { useEffect, useState, type SubmitEvent } from "react";
import { DateTime } from "luxon";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

import { citiesApi } from "#/features/cities/services/citiesApi";
import { moviesApi } from "#/features/movies/services/moviesApi";
import type { Movie } from "#/features/movies/types/movieTypes";
import { screensApi } from "#/features/venues/services/screensApi";
import { venuesApi } from "#/features/venues/services/venuesApi";
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

export default function CreateShowtimePage() {
  const [showtimeForm, setShowtimeForm] = useState<ShowtimeFormValues>(initialShowtimeFormValues);
  const [venues, setVenues] = useState<Array<Venue>>([]);
  const [movies, setMovies] = useState<Array<Movie>>([]);
  const [screens, setScreens] = useState<Array<Screen>>([]);
  const [errors, setErrors] = useState<ShowtimeFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isVenuesLoading, setIsVenuesLoading] = useState(true);
  const [isMoviesLoading, setIsMoviesLoading] = useState(false);
  const [isScreensLoading, setIsScreensLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    void loadVenues();
  }, []);

  useEffect(() => {
    void loadVenueOptions(showtimeForm.venueId);
  }, [showtimeForm.venueId]);

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

  async function loadVenueOptions(venueId: string) {
    setMovies([]);
    setScreens([]);

    if (!venueId) {
      return;
    }

    setIsMoviesLoading(true);
    setIsScreensLoading(true);
    setFormError(null);

    try {
      const [moviesResponse, screensResponse] = await Promise.all([
        moviesApi.listVenueMovies(venueId),
        screensApi.list({ active: "true", venueId }),
      ]);

      setMovies(moviesResponse.data.movies.filter((movie) => movie.active));
      setScreens(screensResponse.data.screens.filter((screen) => screen.active));
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to load venue movies and screens."));
    } finally {
      setIsMoviesLoading(false);
      setIsScreensLoading(false);
    }
  }

  function updateField<TField extends keyof ShowtimeFormValues>(
    field: TField,
    value: ShowtimeFormValues[TField],
  ) {
    setShowtimeForm((currentForm) => ({
      ...currentForm,
      [field]: value,
      ...(field === "venueId" ? { movieId: "", screenId: "" } : {}),
    }));
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

    const movie = movies.find((movieItem) => movieItem.id === formValidation.data.movieId);

    if (!movie?.active) {
      setFormError("Selected movie is not active.");
      return;
    }

    const screen = screens.find((screenItem) => screenItem.id === formValidation.data.screenId);

    if (!screen?.active) {
      setFormError("Selected screen is not active.");
      return;
    }

    const payload = getShowtimePayload(formValidation.data, venue);

    if (DateTime.fromISO(payload.startsAt) <= DateTime.now()) {
      setErrors({
        date: "Start date and time must be in the future",
        time: "Start date and time must be in the future",
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
      toast.success({ title: "Showtime created." });
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
        description="Select a venue, assigned movie, screen, date, and start time for a new show."
        errors={errors}
        formId={formId}
        isMoviesLoading={isMoviesLoading}
        isScreensLoading={isScreensLoading}
        isSubmitting={isSubmitting}
        isVenuesLoading={isVenuesLoading}
        movies={movies}
        onSubmit={handleSubmit}
        onUpdateField={updateField}
        screens={screens}
        showtimeForm={showtimeForm}
        submitLabel="Save Showtime"
        submittingLabel="Saving..."
        title="Add Showtime"
        venues={venues}
      />
    </section>
  );
}
