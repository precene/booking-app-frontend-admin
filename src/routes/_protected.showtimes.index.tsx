import { createFileRoute } from "@tanstack/react-router";

import ShowtimesPage from "#/features/showtimes/pages/ShowtimesPage";

export const Route = createFileRoute("/_protected/showtimes/")({
  component: ShowtimesPage,
});
