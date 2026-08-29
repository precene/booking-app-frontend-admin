import { useEffect, useState, type SubmitEvent } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

import {
  getMovieFormValues,
  getMoviePayload,
  initialMovieFormValues,
  MovieForm,
  type MovieFormErrors,
  type MovieFormValues,
} from "../components/MovieForm";
import { moviesApi } from "../services/moviesApi";
import { movieSchema } from "../validations/movieValidation";

import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { toast } from "#/shared/components/ui/toast";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import { getFormValidationErrors } from "#/shared/utils/getFormValidationErrors";

const formId = "edit-movie-form";

export default function EditMoviePage() {
  const { movieId } = useParams({ from: "/_protected/movies/$movieId_/edit" });
  const [movieForm, setMovieForm] = useState<MovieFormValues>(initialMovieFormValues);
  const [errors, setErrors] = useState<MovieFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    void loadMovie();
  }, [movieId]);

  async function loadMovie() {
    setIsLoading(true);
    setFormError(null);

    try {
      const response = await moviesApi.get(movieId);
      setMovieForm(getMovieFormValues(response.data.movie));
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to load movie details."));
    } finally {
      setIsLoading(false);
    }
  }

  function updateField<TField extends keyof MovieFormValues>(
    field: TField,
    value: MovieFormValues[TField],
  ) {
    setMovieForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError(null);

    const payload = getMoviePayload(movieForm);
    const validation = movieSchema.safeParse(payload);

    if (!validation.success) {
      setErrors(getFormValidationErrors(validation.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await moviesApi.update(movieId, validation.data);
      const movie = response.data.movie;

      toast.success({ title: "Movie updated." });
      void navigate({ params: { movieId: movie.id }, to: "/movies/$movieId" });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to update movie."));
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

      {isLoading ? (
        <div className="bg-surface rounded-lg border p-6 shadow-sm">
          <p className="text-muted text-sm font-medium">Loading movie details...</p>
        </div>
      ) : (
        <MovieForm
          description="Update movie metadata, media links, and availability status."
          errors={errors}
          formId={formId}
          isSubmitting={isSubmitting}
          movieForm={movieForm}
          onSubmit={handleSubmit}
          onUpdateField={updateField}
          submitLabel="Update Movie"
          submittingLabel="Updating..."
          title="Edit Movie"
        />
      )}
    </section>
  );
}
