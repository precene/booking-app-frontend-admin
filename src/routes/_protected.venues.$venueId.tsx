import { createFileRoute } from "@tanstack/react-router";

import VenueDetailsPage from "#/features/venues/pages/VenueDetailsPage";

export const Route = createFileRoute("/_protected/venues/$venueId")({
  component: VenueDetailsPage,
});
