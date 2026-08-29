import { createFileRoute } from "@tanstack/react-router";

import CreateVenuePage from "#/features/venues/pages/CreateVenuePage";

export const Route = createFileRoute("/_protected/venues/new")({
  component: CreateVenuePage,
});
