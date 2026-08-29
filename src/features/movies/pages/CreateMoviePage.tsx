import { useState, type SubmitEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";

import {
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

const formId = "create-movie-form";

export default function CreateMoviePage() {
  const [movieForm, setMovieForm] = useState<MovieFormValues>(initialMovieFormValues);
  const [errors, setErrors] = useState<MovieFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

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
      await moviesApi.create(validation.data);
      toast.success({ title: "Movie created." });
      void navigate({ to: "/movies" });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Unable to create movie."));
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

      <MovieForm
        description="Create a catalog entry with movie metadata, media links, and availability status."
        errors={errors}
        formId={formId}
        isSubmitting={isSubmitting}
        movieForm={movieForm}
        onSubmit={handleSubmit}
        onUpdateField={updateField}
        submitLabel="Save Movie"
        submittingLabel="Saving..."
        title="Add Movie"
      />
    </section>
  );
}
