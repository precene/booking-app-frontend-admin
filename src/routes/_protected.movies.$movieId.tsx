import { createFileRoute } from "@tanstack/react-router";

import MovieDetailsPage from "#/features/movies/pages/MovieDetailsPage";

export const Route = createFileRoute("/_protected/movies/$movieId")({
  component: MovieDetailsPage,
});
