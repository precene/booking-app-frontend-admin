import { createFileRoute } from "@tanstack/react-router";

import CouponDetailsPage from "#/features/coupons/pages/CouponDetailsPage";

export const Route = createFileRoute("/_protected/coupons/$couponId")({
  component: CouponDetailsPage,
});
