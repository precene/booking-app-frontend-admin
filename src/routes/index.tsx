import { createFileRoute, redirect } from "@tanstack/react-router";

import { useAuthStore } from "#/features/auth/store/authStore";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const user = useAuthStore.getState().user;

    throw redirect({ to: user ? "/dashboard" : "/login" });
  },
});
