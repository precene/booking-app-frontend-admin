import { createFileRoute } from "@tanstack/react-router";

import CustomerDetailsPage from "#/features/customers/pages/CustomerDetailsPage";

export const Route = createFileRoute("/_protected/customers/$customerId")({
  component: CustomerDetailsPage,
});
