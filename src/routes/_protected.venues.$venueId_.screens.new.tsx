import { createFileRoute } from "@tanstack/react-router";

import CreateVenueScreenPage from "#/features/venues/pages/CreateVenueScreenPage";

export const Route = createFileRoute("/_protected/venues/$venueId_/screens/new")({
  component: CreateVenueScreenPage,
});
