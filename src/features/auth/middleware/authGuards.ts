import { redirect } from "@tanstack/react-router";

import { authApi } from "../services/authApi";
import { useAuthStore } from "../store/authStore";
import type { User } from "../types/authTypes";

export function hasAdminDashboardAccess(user: User | null) {
  return Boolean(user?.active && user.role !== "customer");
}

export async function getValidatedAdminUser() {
  try {
    const response = await authApi.me();
    const user = response.data.user;

    if (!hasAdminDashboardAccess(user)) {
      useAuthStore.getState().logout();
      return null;
    }

    useAuthStore.getState().login(user);
    return user;
  } catch {
    useAuthStore.getState().logout();
    return null;
  }
}

export async function requireAuth() {
  const user = await getValidatedAdminUser();

  if (!user) {
    throw redirect({ to: "/login" });
  }
}

export async function redirectAuthenticatedAdmin() {
  const user = await getValidatedAdminUser();

  if (user) {
    throw redirect({ to: "/dashboard" });
  }
}
