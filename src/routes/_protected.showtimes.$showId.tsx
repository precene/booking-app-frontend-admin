import { createFileRoute } from "@tanstack/react-router";

import ShowtimeDetailsPage from "#/features/showtimes/pages/ShowtimeDetailsPage";

export const Route = createFileRoute("/_protected/showtimes/$showId")({
  component: ShowtimeDetailsPage,
});
