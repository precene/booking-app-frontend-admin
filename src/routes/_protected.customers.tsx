import { createFileRoute } from "@tanstack/react-router";

import CustomersPage from "#/features/customers/pages/CustomersPage";

export const Route = createFileRoute("/_protected/customers")({
  component: CustomersPage,
});
