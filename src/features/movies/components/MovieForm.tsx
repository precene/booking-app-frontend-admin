import { Link } from "@tanstack/react-router";
import { DateTime } from "luxon";
import { ArrowLeft, Film, Image, LinkIcon, Save } from "lucide-react";
import type { SubmitEvent } from "react";

import type { Movie, MoviePayload } from "../types/movieTypes";

import { Button } from "#/shared/components/ui/button";
import { Checkbox } from "#/shared/components/ui/checkbox";
import { DatePicker } from "#/shared/components/ui/date-picker";
import { Form } from "#/shared/components/ui/form";
import { Input } from "#/shared/components/ui/input";
import { Label } from "#/shared/components/ui/label";
import { Textarea } from "#/shared/components/ui/textarea";
import type { FormValidationErrors } from "#/shared/utils/getFormValidationErrors";

export type MovieFormValues = {
  active: boolean;
  ageRating: string;
  cast: string;
  coverImage: string;
  directors: string;
  durationMinutes: string;
  genre: string;
  overview: string;
  posterUrl: string;
  producers: string;
  releaseDate: string;
  title: string;
  trailerUrl: string;
  writers: string;
};

export type MovieFormErrors = FormValidationErrors<MoviePayload>;

type MovieFormProps = {
  description: string;
  errors: MovieFormErrors;
  formId: string;
  isSubmitting: boolean;
  movieForm: MovieFormValues;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onUpdateField: <TField extends keyof MovieFormValues>(
    field: TField,
    value: MovieFormValues[TField],
  ) => void;
  submitLabel: string;
  submittingLabel: string;
  title: string;
};

export const initialMovieFormValues: MovieFormValues = {
  active: true,
  ageRating: "",
  cast: "",
  coverImage: "",
  directors: "",
  durationMinutes: "",
  genre: "",
  overview: "",
  posterUrl: "",
  producers: "",
  releaseDate: "",
  title: "",
  trailerUrl: "",
  writers: "",
};

export function MovieForm({
  description,
  errors,
  formId,
  isSubmitting,
  movieForm,
  onSubmit,
  onUpdateField,
  submitLabel,
  submittingLabel,
  title,
}: MovieFormProps) {
  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button asChild aria-label="Back To Movies" size="icon" variant="ghost">
              <Link to="/movies">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>

            <h2 className="text-3xl font-semibold tracking-normal">{title}</h2>
          </div>

          <p className="text-muted mt-2 text-sm">{description}</p>
        </div>

        <Button disabled={isSubmitting} form={formId} type="submit">
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
              <Film className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">Movie Details</h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  aria-describedby={errors.title ? "title-error" : undefined}
                  aria-invalid={Boolean(errors.title)}
                  id="title"
                  name="title"
                  onChange={(event) => onUpdateField("title", event.target.value)}
                  placeholder="Movie Title"
                  value={movieForm.title}
                />

                {errors.title ? (
                  <p className="text-destructive text-sm" id="title-error">
                    {errors.title}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input
                  aria-describedby={errors.genre ? "genre-error" : undefined}
                  aria-invalid={Boolean(errors.genre)}
                  id="genre"
                  name="genre"
                  onChange={(event) => onUpdateField("genre", event.target.value)}
                  placeholder="Action"
                  value={movieForm.genre}
                />

                {errors.genre ? (
                  <p className="text-destructive text-sm" id="genre-error">
                    {errors.genre}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Duration (Minutes)</Label>
                <Input
                  aria-describedby={errors.durationMinutes ? "duration-error" : undefined}
                  aria-invalid={Boolean(errors.durationMinutes)}
                  id="durationMinutes"
                  min={1}
                  name="durationMinutes"
                  onChange={(event) => onUpdateField("durationMinutes", event.target.value)}
                  placeholder="120"
                  type="number"
                  value={movieForm.durationMinutes}
                />

                {errors.durationMinutes ? (
                  <p className="text-destructive text-sm" id="duration-error">
                    {errors.durationMinutes}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageRating">Age Rating</Label>
                <Input
                  aria-describedby={errors.ageRating ? "age-rating-error" : undefined}
                  aria-invalid={Boolean(errors.ageRating)}
                  id="ageRating"
                  name="ageRating"
                  onChange={(event) => onUpdateField("ageRating", event.target.value)}
                  placeholder="PG-13"
                  value={movieForm.ageRating}
                />

                {errors.ageRating ? (
                  <p className="text-destructive text-sm" id="age-rating-error">
                    {errors.ageRating}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="releaseDate">Release Date</Label>
                <DatePicker
                  aria-describedby={errors.releaseDate ? "release-date-error" : undefined}
                  aria-invalid={Boolean(errors.releaseDate)}
                  disablePast
                  id="releaseDate"
                  name="releaseDate"
                  onValueChange={(value) => onUpdateField("releaseDate", value)}
                  value={movieForm.releaseDate}
                />

                {errors.releaseDate ? (
                  <p className="text-destructive text-sm" id="release-date-error">
                    {errors.releaseDate}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="overview">Overview</Label>
                <Textarea
                  aria-describedby={errors.overview ? "overview-error" : undefined}
                  aria-invalid={Boolean(errors.overview)}
                  id="overview"
                  name="overview"
                  onChange={(event) => onUpdateField("overview", event.target.value)}
                  placeholder="Short Movie Overview"
                  value={movieForm.overview}
                />

                {errors.overview ? (
                  <p className="text-destructive text-sm" id="overview-error">
                    {errors.overview}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Film className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">Credits</h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <CreditInput
                error={errors.directors}
                id="directors"
                label="Directors"
                onChange={(value) => onUpdateField("directors", value)}
                value={movieForm.directors}
              />

              <CreditInput
                error={errors.producers}
                id="producers"
                label="Producers"
                onChange={(value) => onUpdateField("producers", value)}
                value={movieForm.producers}
              />

              <CreditInput
                error={errors.writers}
                id="writers"
                label="Writers"
                onChange={(value) => onUpdateField("writers", value)}
                value={movieForm.writers}
              />

              <CreditInput
                error={errors.cast}
                id="cast"
                label="Cast"
                onChange={(value) => onUpdateField("cast", value)}
                value={movieForm.cast}
              />
            </div>
          </div>

          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <LinkIcon className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">Media Links</h3>
            </div>

            <div className="grid gap-5">
              <div className="space-y-2">
                <Label htmlFor="posterUrl">Poster URL</Label>
                <Input
                  aria-describedby={
                    errors.posterUrl ? "poster-url-hint poster-url-error" : "poster-url-hint"
                  }
                  aria-invalid={Boolean(errors.posterUrl)}
                  id="posterUrl"
                  name="posterUrl"
                  onChange={(event) => onUpdateField("posterUrl", event.target.value)}
                  placeholder="https://example.com/poster.jpg"
                  type="url"
                  value={movieForm.posterUrl}
                />
                <p className="text-muted text-sm" id="poster-url-hint">
                  Recommended poster size: 1000x1500 pixels.
                </p>

                {errors.posterUrl ? (
                  <p className="text-destructive text-sm" id="poster-url-error">
                    {errors.posterUrl}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  aria-describedby={errors.coverImage ? "cover-image-error" : undefined}
                  aria-invalid={Boolean(errors.coverImage)}
                  id="coverImage"
                  name="coverImage"
                  onChange={(event) => onUpdateField("coverImage", event.target.value)}
                  placeholder="https://example.com/cover.jpg"
                  type="url"
                  value={movieForm.coverImage}
                />

                {errors.coverImage ? (
                  <p className="text-destructive text-sm" id="cover-image-error">
                    {errors.coverImage}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="trailerUrl">Trailer URL</Label>
                <Input
                  aria-describedby={errors.trailerUrl ? "trailer-url-error" : undefined}
                  aria-invalid={Boolean(errors.trailerUrl)}
                  id="trailerUrl"
                  name="trailerUrl"
                  onChange={(event) => onUpdateField("trailerUrl", event.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  type="url"
                  value={movieForm.trailerUrl}
                />

                {errors.trailerUrl ? (
                  <p className="text-destructive text-sm" id="trailer-url-error">
                    {errors.trailerUrl}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Image className="text-primary size-5" />
              <h3 className="text-base font-semibold tracking-normal">Poster Preview</h3>
            </div>

            <div className="bg-surface-muted aspect-[2/3] overflow-hidden rounded-md border">
              {movieForm.posterUrl ? (
                <img alt="" className="size-full object-cover" src={movieForm.posterUrl} />
              ) : (
                <div className="text-muted flex size-full items-center justify-center px-6 text-center text-sm font-medium">
                  Poster Preview Appears Here
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <h3 className="text-base font-semibold tracking-normal">Availability</h3>

            <label className="mt-4 flex items-start gap-3">
              <Checkbox
                checked={movieForm.active}
                id="active"
                onCheckedChange={(checked) => onUpdateField("active", checked === true)}
              />

              <span>
                <span className="block text-sm font-medium">Active In Catalog</span>
                <span className="text-muted mt-1 block text-sm">
                  Active Movies Can Be Used For Show Scheduling And Customer Browsing.
                </span>
              </span>
            </label>
          </div>
        </aside>
      </Form>
    </>
  );
}

export function getMoviePayload(formValues: MovieFormValues): MoviePayload {
  return {
    active: formValues.active,
    ageRating: formValues.ageRating.trim(),
    cast: toOptionalStringArray(formValues.cast),
    coverImage: formValues.coverImage.trim(),
    directors: toOptionalStringArray(formValues.directors),
    durationMinutes: Number(formValues.durationMinutes),
    genre: formValues.genre.trim(),
    overview: formValues.overview.trim(),
    posterUrl: formValues.posterUrl.trim(),
    producers: toOptionalStringArray(formValues.producers),
    releaseDate: formValues.releaseDate.trim(),
    title: formValues.title.trim(),
    trailerUrl: formValues.trailerUrl.trim(),
    writers: toOptionalStringArray(formValues.writers),
  };
}

export function getMovieFormValues(movie: Movie): MovieFormValues {
  return {
    active: movie.active,
    ageRating: movie.ageRating ?? "",
    cast: movie.cast.join(", "),
    coverImage: movie.coverImage ?? "",
    directors: movie.directors.join(", "),
    durationMinutes: String(movie.durationMinutes),
    genre: movie.genre ?? "",
    overview: movie.overview ?? "",
    posterUrl: movie.posterUrl ?? "",
    producers: movie.producers.join(", "),
    releaseDate: toDateInputValue(movie.releaseDate),
    title: movie.title,
    trailerUrl: movie.trailerUrl ?? "",
    writers: movie.writers.join(", "),
  };
}

type CreditInputProps = {
  error?: string;
  id: "cast" | "directors" | "producers" | "writers";
  label: string;
  onChange: (value: string) => void;
  value: string;
};

function CreditInput({ error, id, label, onChange, value }: CreditInputProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        id={id}
        name={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Name, Name"
        value={value}
      />

      {error ? (
        <p className="text-destructive text-sm" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function toDateInputValue(value: string | null) {
  if (!value) {
    return "";
  }

  const parsedDate = DateTime.fromISO(value);

  if (!parsedDate.isValid) {
    return "";
  }

  return parsedDate.toISODate() ?? "";
}

function toOptionalStringArray(value: string | undefined) {
  const items = value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return items?.length ? items : undefined;
}
