import { createFileRoute } from "@tanstack/react-router";

import EditVenueScreenPage from "#/features/venues/pages/EditVenueScreenPage";

export const Route = createFileRoute("/_protected/venues/$venueId_/screens/$screenId_/edit")({
  component: EditVenueScreenPage,
});
