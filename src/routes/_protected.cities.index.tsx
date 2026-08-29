import { createFileRoute } from "@tanstack/react-router";

import CitiesPage from "#/features/cities/pages/CitiesPage";

export const Route = createFileRoute("/_protected/cities/")({
  component: CitiesPage,
});
