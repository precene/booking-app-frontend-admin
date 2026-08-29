import { createFileRoute } from "@tanstack/react-router";

import { requireAuth } from "#/features/auth/middleware/authGuards";
import { AdminLayout } from "#/shared/components/layout/AdminLayout";

export const Route = createFileRoute("/_protected")({
  beforeLoad: requireAuth,
  component: AdminLayout,
});
