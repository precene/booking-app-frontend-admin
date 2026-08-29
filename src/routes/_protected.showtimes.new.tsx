import { createFileRoute } from "@tanstack/react-router";

import CreateShowtimePage from "#/features/showtimes/pages/CreateShowtimePage";

export const Route = createFileRoute("/_protected/showtimes/new")({
  component: CreateShowtimePage,
});
