import { createFileRoute } from "@tanstack/react-router";

import CityDetailsPage from "#/features/cities/pages/CityDetailsPage";

export const Route = createFileRoute("/_protected/cities/$cityId")({
  component: CityDetailsPage,
});
