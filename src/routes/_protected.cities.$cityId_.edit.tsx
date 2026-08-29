import { createFileRoute } from "@tanstack/react-router";

import EditCityPage from "#/features/cities/pages/EditCityPage";

export const Route = createFileRoute("/_protected/cities/$cityId_/edit")({
  component: EditCityPage,
});
