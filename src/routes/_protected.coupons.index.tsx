import { createFileRoute } from "@tanstack/react-router";

import CouponsPage from "#/features/coupons/pages/CouponsPage";

export const Route = createFileRoute("/_protected/coupons/")({
  component: CouponsPage,
});
