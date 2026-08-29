import { createFileRoute } from "@tanstack/react-router";

import EditMoviePage from "#/features/movies/pages/EditMoviePage";

export const Route = createFileRoute("/_protected/movies/$movieId_/edit")({
  component: EditMoviePage,
});
