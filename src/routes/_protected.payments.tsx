import { createFileRoute } from "@tanstack/react-router";

import PaymentsPage from "#/features/payments/pages/PaymentsPage";

export const Route = createFileRoute("/_protected/payments")({
  component: PaymentsPage,
});
