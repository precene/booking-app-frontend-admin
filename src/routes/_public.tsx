import { Outlet, createFileRoute } from "@tanstack/react-router";

import { redirectAuthenticatedAdmin } from "#/features/auth/middleware/authGuards";

export const Route = createFileRoute("/_public")({
  beforeLoad: redirectAuthenticatedAdmin,
  component: Outlet,
});
