import { DateTime } from "luxon";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, Clock, Film, MapPin, Save } from "lucide-react";
import type { SubmitEvent } from "react";

import type { Movie } from "#/features/movies/types/movieTypes";
import type { SeatCategory } from "#/features/venues/types/seatCategoryTypes";
import type { Screen } from "#/features/venues/types/screenTypes";
import type { Venue } from "#/features/venues/types/venueTypes";
import { formatVenueMoney } from "#/features/venues/utils/venueFormatters";
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
import { SearchCombobox } from "#/shared/components/ui/search-combobox";
import type { FormValidationErrors } from "#/shared/utils/getFormValidationErrors";
import type { ShowtimeFormValues } from "../utils/showtimeFormUtils";
import { combineShowtimeDateTime, formatShowtimeDateTime } from "../utils/showtimeFormatters";

export { getShowtimePayload, initialShowtimeFormValues } from "../utils/showtimeFormUtils";
export type { ShowtimeFormValues } from "../utils/showtimeFormUtils";

export type ShowtimeFormErrors = FormValidationErrors<ShowtimeFormValues>;

type ShowtimeFormProps = {
  description: string;
  errors: ShowtimeFormErrors;
  formId: string;
  isMoviesLoading: boolean;
  isPriceOverridesLoading: boolean;
  isScreensLoading: boolean;
  isSubmitting: boolean;
  isVenuesLoading: boolean;
  movieSearch: string;
  movies: Array<Movie>;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onUpdateMovieSearch: (value: string) => void;
  onUpdateField: <TField extends keyof ShowtimeFormValues>(
    field: TField,
    value: ShowtimeFormValues[TField],
  ) => void;
  priceCategories: Array<SeatCategory>;
  screens: Array<Screen>;
  selectedMovie: Movie | null;
  submitLabel: string;
  submittingLabel: string;
  title: string;
  venues: Array<Venue>;
  showtimeForm: ShowtimeFormValues;
};

export function ShowtimeForm({
  description,
  errors,
  formId,
  isMoviesLoading,
  isPriceOverridesLoading,
  isScreensLoading,
  isSubmitting,
  isVenuesLoading,
  movieSearch,
  movies,
  onSubmit,
  onUpdateMovieSearch,
  onUpdateField,
  priceCategories,
  screens,
  selectedMovie,
  submitLabel,
  submittingLabel,
  title,
  venues,
  showtimeForm,
}: ShowtimeFormProps) {
  const selectedVenue = venues.find((venue) => venue.id === showtimeForm.venueId);
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
                      placeholder={isVenuesLoading ? "Loading Venues..." : "Select Venue"}
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
                      placeholder={isScreensLoading ? "Loading Screens..." : "Select Screen"}
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
              <SearchCombobox
                aria-describedby={errors.movieId ? "movie-id-error" : undefined}
                emptyLabel="No Active Movies Found."
                error={Boolean(errors.movieId)}
                getItemValue={(movie) => movie.id}
                id="movieId"
                isLoading={isMoviesLoading}
                items={movies}
                loadingLabel="Loading Movies..."
                onSearchChange={onUpdateMovieSearch}
                onValueChange={(value) => onUpdateField("movieId", value)}
                placeholder="Select Movie"
                renderItem={(movie) => (
                  <div className="min-w-0">
                    <p className="truncate font-medium">{movie.title}</p>
                    <p className="text-muted text-xs">{movie.durationMinutes} Minutes</p>
                  </div>
                )}
                search={movieSearch}
                searchPlaceholder="Search Movies..."
                selectedLabel={selectedMovie?.title}
                value={showtimeForm.movieId}
              />

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
                <Label htmlFor="time">Start Time</Label>
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

          {showtimeForm.screenId ? (
            <div className="bg-surface rounded-lg border p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-base font-semibold tracking-normal">Price Overrides</h3>
                <p className="text-muted mt-1 text-sm">
                  Leave a price unchanged to use the screen category default.
                </p>
              </div>

              {isPriceOverridesLoading ? (
                <p className="text-muted text-sm font-medium">Loading Price Categories...</p>
              ) : priceCategories.length ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {priceCategories.map((category) => (
                      <div className="space-y-2" key={category.id}>
                        <Label htmlFor={`price-${category.id}`}>{category.name}</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            aria-describedby={
                              errors.priceOverrides ? "price-overrides-error" : undefined
                            }
                            aria-invalid={Boolean(errors.priceOverrides)}
                            id={`price-${category.id}`}
                            min={0}
                            onChange={(event) =>
                              onUpdateField("priceOverrides", {
                                ...showtimeForm.priceOverrides,
                                [category.id]: event.target.value,
                              })
                            }
                            step="0.01"
                            type="number"
                            value={
                              showtimeForm.priceOverrides[category.id] ??
                              String(category.defaultPriceMinor / 100)
                            }
                          />
                          <span className="text-muted w-28 shrink-0 text-xs">
                            Default {formatVenueMoney(category.defaultPriceMinor)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {errors.priceOverrides ? (
                    <p className="text-destructive mt-3 text-sm" id="price-overrides-error">
                      {errors.priceOverrides}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="text-muted text-sm font-medium">
                  No Seat Categories Found For This Screen.
                </p>
              )}
            </div>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Clock className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">Timing Preview</h3>
            </div>

            <dl className="space-y-4">
              <div>
                <dt className="text-muted text-xs font-medium uppercase">Venue Timezone</dt>
                <dd className="mt-1 text-sm font-medium">
                  {selectedVenue?.timezone ?? "Select Venue"}
                </dd>
              </div>
              <div>
                <dt className="text-muted text-xs font-medium uppercase">Start</dt>
                <dd className="mt-1 text-sm font-medium">
                  {startsAtPreview && selectedVenue
                    ? formatShowtimeDateTime(startsAtPreview, selectedVenue.timezone)
                    : "Not Set"}
                </dd>
              </div>
              <div>
                <dt className="text-muted text-xs font-medium uppercase">Estimated End</dt>
                <dd className="mt-1 text-sm font-medium">
                  {endsAtPreview && selectedVenue
                    ? formatShowtimeDateTime(endsAtPreview, selectedVenue.timezone)
                    : "Not Set"}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </Form>
    </>
  );
}
