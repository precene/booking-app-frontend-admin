import { createFileRoute, redirect } from "@tanstack/react-router";

import { getValidatedAdminUser } from "#/features/auth/middleware/authGuards";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const user = await getValidatedAdminUser();

    throw redirect({ to: user ? "/dashboard" : "/login" });
  },
});
