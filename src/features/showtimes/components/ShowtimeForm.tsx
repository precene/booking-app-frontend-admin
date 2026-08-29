import { DateTime } from "luxon";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, Clock, Film, MapPin, Save } from "lucide-react";
import type { SubmitEvent } from "react";

import type { Movie } from "#/features/movies/types/movieTypes";
import type { Screen } from "#/features/venues/types/screenTypes";
import type { Venue } from "#/features/venues/types/venueTypes";
import { Button } from "#/shared/components/ui/button";
import { DatePicker } from "#/shared/components/ui/date-picker";
import { Form } from "#/shared/components/ui/form";
import { Input } from "#/shared/components/ui/input";
import { Label } from "#/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/shared/components/ui/select";
import type { FormValidationErrors } from "#/shared/utils/getFormValidationErrors";
import type { ShowtimePayload } from "../types/showtimeTypes";
import { combineShowtimeDateTime, formatShowtimeDateTime } from "../utils/showtimeFormatters";

export type ShowtimeFormValues = {
  date: string;
  movieId: string;
  screenId: string;
  time: string;
  venueId: string;
};

export type ShowtimeFormErrors = FormValidationErrors<ShowtimeFormValues>;

type ShowtimeFormProps = {
  description: string;
  errors: ShowtimeFormErrors;
  formId: string;
  isMoviesLoading: boolean;
  isScreensLoading: boolean;
  isSubmitting: boolean;
  isVenuesLoading: boolean;
  movies: Array<Movie>;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onUpdateField: <TField extends keyof ShowtimeFormValues>(
    field: TField,
    value: ShowtimeFormValues[TField],
  ) => void;
  screens: Array<Screen>;
  submitLabel: string;
  submittingLabel: string;
  title: string;
  venues: Array<Venue>;
  showtimeForm: ShowtimeFormValues;
};

export const initialShowtimeFormValues: ShowtimeFormValues = {
  date: "",
  movieId: "",
  screenId: "",
  time: "",
  venueId: "",
};

export function ShowtimeForm({
  description,
  errors,
  formId,
  isMoviesLoading,
  isScreensLoading,
  isSubmitting,
  isVenuesLoading,
  movies,
  onSubmit,
  onUpdateField,
  screens,
  submitLabel,
  submittingLabel,
  title,
  venues,
  showtimeForm,
}: ShowtimeFormProps) {
  const selectedVenue = venues.find((venue) => venue.id === showtimeForm.venueId);
  const selectedMovie = movies.find((movie) => movie.id === showtimeForm.movieId);
  const startsAtPreview = selectedVenue
    ? combineShowtimeDateTime(showtimeForm.date, showtimeForm.time, selectedVenue.timezone)
    : null;
  const endsAtPreview =
    startsAtPreview && selectedMovie
      ? DateTime.fromISO(startsAtPreview)
          .plus({ minutes: selectedMovie.durationMinutes + 25 })
          .toISO()
      : null;

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button asChild aria-label="Back to showtimes" size="icon" variant="ghost">
              <Link to="/showtimes">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>

            <h2 className="text-3xl font-semibold tracking-normal">{title}</h2>
          </div>

          <p className="text-muted mt-2 text-sm">{description}</p>
        </div>

        <Button disabled={isSubmitting || isVenuesLoading} form={formId} type="submit">
          <Save className="size-4" />
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>

      <Form
        className="grid gap-6 xl:grid-cols-[1fr_22rem]"
        disabled={isSubmitting}
        id={formId}
        noValidate
        onSubmit={onSubmit}
      >
        <div className="space-y-6">
          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <MapPin className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">Venue & Screen</h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="venueId">Venue</Label>
                <Select
                  disabled={isVenuesLoading}
                  name="venueId"
                  onValueChange={(value) => onUpdateField("venueId", value)}
                  value={showtimeForm.venueId}
                >
                  <SelectTrigger
                    aria-describedby={errors.venueId ? "venue-id-error" : undefined}
                    aria-invalid={Boolean(errors.venueId)}
                    id="venueId"
                  >
                    <SelectValue
                      placeholder={isVenuesLoading ? "Loading venues..." : "Select venue"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.venueId ? (
                  <p className="text-destructive text-sm" id="venue-id-error">
                    {errors.venueId}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="screenId">Screen</Label>
                <Select
                  disabled={!showtimeForm.venueId || isScreensLoading}
                  name="screenId"
                  onValueChange={(value) => onUpdateField("screenId", value)}
                  value={showtimeForm.screenId}
                >
                  <SelectTrigger
                    aria-describedby={errors.screenId ? "screen-id-error" : undefined}
                    aria-invalid={Boolean(errors.screenId)}
                    id="screenId"
                  >
                    <SelectValue
                      placeholder={isScreensLoading ? "Loading screens..." : "Select screen"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {screens.map((screen) => (
                      <SelectItem key={screen.id} value={screen.id}>
                        {screen.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.screenId ? (
                  <p className="text-destructive text-sm" id="screen-id-error">
                    {errors.screenId}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Film className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">Movie</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="movieId">Movie</Label>
              <Select
                disabled={!showtimeForm.venueId || isMoviesLoading}
                name="movieId"
                onValueChange={(value) => onUpdateField("movieId", value)}
                value={showtimeForm.movieId}
              >
                <SelectTrigger
                  aria-describedby={errors.movieId ? "movie-id-error" : undefined}
                  aria-invalid={Boolean(errors.movieId)}
                  id="movieId"
                >
                  <SelectValue
                    placeholder={isMoviesLoading ? "Loading movies..." : "Select movie"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {movies.map((movie) => (
                    <SelectItem key={movie.id} value={movie.id}>
                      {movie.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.movieId ? (
                <p className="text-destructive text-sm" id="movie-id-error">
                  {errors.movieId}
                </p>
              ) : null}
            </div>
          </div>

          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <CalendarClock className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">Schedule</h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <DatePicker
                  aria-describedby={errors.date ? "date-error" : undefined}
                  aria-invalid={Boolean(errors.date)}
                  disablePast
                  id="date"
                  onValueChange={(value) => onUpdateField("date", value)}
                  value={showtimeForm.date}
                />

                {errors.date ? (
                  <p className="text-destructive text-sm" id="date-error">
                    {errors.date}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Start time</Label>
                <Input
                  aria-describedby={errors.time ? "time-error" : undefined}
                  aria-invalid={Boolean(errors.time)}
                  id="time"
                  name="time"
                  onChange={(event) => onUpdateField("time", event.target.value)}
                  type="time"
                  value={showtimeForm.time}
                />

                {errors.time ? (
                  <p className="text-destructive text-sm" id="time-error">
                    {errors.time}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Clock className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">Timing Preview</h3>
            </div>

            <dl className="space-y-4">
              <div>
                <dt className="text-muted text-xs font-medium uppercase">Venue timezone</dt>
                <dd className="mt-1 text-sm font-medium">
                  {selectedVenue?.timezone ?? "Select venue"}
                </dd>
              </div>
              <div>
                <dt className="text-muted text-xs font-medium uppercase">Start</dt>
                <dd className="mt-1 text-sm font-medium">
                  {startsAtPreview && selectedVenue
                    ? formatShowtimeDateTime(startsAtPreview, selectedVenue.timezone)
                    : "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-muted text-xs font-medium uppercase">Estimated end</dt>
                <dd className="mt-1 text-sm font-medium">
                  {endsAtPreview && selectedVenue
                    ? formatShowtimeDateTime(endsAtPreview, selectedVenue.timezone)
                    : "Not set"}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </Form>
    </>
  );
}

export function getShowtimePayload(formValues: ShowtimeFormValues, venue: Venue): ShowtimePayload {
  return {
    movieId: formValues.movieId,
    screenId: formValues.screenId,
    startsAt: combineShowtimeDateTime(formValues.date, formValues.time, venue.timezone) ?? "",
  };
}
