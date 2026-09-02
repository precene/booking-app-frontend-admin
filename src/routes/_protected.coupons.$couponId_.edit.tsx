import { createFileRoute } from "@tanstack/react-router";

import EditCouponPage from "#/features/coupons/pages/EditCouponPage";

export const Route = createFileRoute("/_protected/coupons/$couponId_/edit")({
  component: EditCouponPage,
});
