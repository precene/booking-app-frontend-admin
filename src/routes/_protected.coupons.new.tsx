import { createFileRoute } from "@tanstack/react-router";

import CreateCouponPage from "#/features/coupons/pages/CreateCouponPage";

export const Route = createFileRoute("/_protected/coupons/new")({
  component: CreateCouponPage,
});
