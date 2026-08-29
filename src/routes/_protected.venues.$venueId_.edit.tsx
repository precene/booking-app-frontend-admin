import { createFileRoute } from "@tanstack/react-router";

import EditVenuePage from "#/features/venues/pages/EditVenuePage";

export const Route = createFileRoute("/_protected/venues/$venueId_/edit")({
  component: EditVenuePage,
});
