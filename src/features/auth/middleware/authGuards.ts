import { redirect } from "@tanstack/react-router";

import { useAuthStore } from "../store/authStore";

export function requireAuth() {
  const user = useAuthStore.getState().user;

  if (!user) {
    throw redirect({ to: "/login" });
  }
}

export function redirectAuthenticatedAdmin() {
  const user = useAuthStore.getState().user;

  if (user) {
    throw redirect({ to: "/dashboard" });
  }
}
