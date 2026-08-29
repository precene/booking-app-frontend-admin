import { createFileRoute } from "@tanstack/react-router";

import CreateCityPage from "#/features/cities/pages/CreateCityPage";

export const Route = createFileRoute("/_protected/cities/new")({
  component: CreateCityPage,
});
