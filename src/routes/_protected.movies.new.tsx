import { createFileRoute } from "@tanstack/react-router";

import CreateMoviePage from "#/features/movies/pages/CreateMoviePage";

export const Route = createFileRoute("/_protected/movies/new")({
  component: CreateMoviePage,
});
