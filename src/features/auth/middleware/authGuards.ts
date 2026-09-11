import { redirect } from "@tanstack/react-router";

import { authApi } from "../services/authApi";
import { useAuthStore } from "../store/authStore";
import type { User } from "../types/authTypes";

const authValidationTtlMs = 5 * 60 * 1000;

let pendingAdminValidation: Promise<User | null> | null = null;

export function hasAdminDashboardAccess(user: User | null) {
  return Boolean(user?.active && user.role !== "customer");
}

export function isAdminAuthValidationFresh(lastValidatedAt: number | null) {
  return Boolean(lastValidatedAt && Date.now() - lastValidatedAt < authValidationTtlMs);
}

export function getCachedAdminUser() {
  const { lastValidatedAt, user } = useAuthStore.getState();

  if (hasAdminDashboardAccess(user) && isAdminAuthValidationFresh(lastValidatedAt)) {
    return user;
  }

  return null;
}

export async function getValidatedAdminUser() {
  const cachedUser = getCachedAdminUser();

  if (cachedUser) {
    return cachedUser;
  }

  if (pendingAdminValidation) {
    return pendingAdminValidation;
  }

  pendingAdminValidation = validateAdminUser();

  try {
    return await pendingAdminValidation;
  } finally {
    pendingAdminValidation = null;
  }
}

async function validateAdminUser() {
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
  const { user } = useAuthStore.getState();

  if (hasAdminDashboardAccess(user) && getCachedAdminUser()) {
    return;
  }

  const validatedUser = await getValidatedAdminUser();

  if (!validatedUser) {
    throw redirect({ to: "/login" });
  }
}

export async function redirectAuthenticatedAdmin() {
  const { user } = useAuthStore.getState();

  if (hasAdminDashboardAccess(user)) {
    throw redirect({ to: "/dashboard" });
  }
}
