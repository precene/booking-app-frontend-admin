import { createFileRoute } from "@tanstack/react-router";

import VenuesPage from "#/features/venues/pages/VenuesPage";

export const Route = createFileRoute("/_protected/venues/")({
  component: VenuesPage,
});
