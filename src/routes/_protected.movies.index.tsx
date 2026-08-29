import { createFileRoute } from "@tanstack/react-router";

import Movies from "#/features/movies/pages/Movies";

export const Route = createFileRoute("/_protected/movies/")({
  component: Movies,
});
