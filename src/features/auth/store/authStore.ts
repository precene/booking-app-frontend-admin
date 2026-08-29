import { create } from "zustand";

import type { User } from "../types/authTypes";

const AUTH_USER_STORAGE_KEY = "admin_user";
const LEGACY_AUTH_EMAIL_STORAGE_KEY = "admin_email";

interface AuthStore {
  user: User | null;
  email: string | null;
  login: (user: User) => void;
  logout: () => void;
}

function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  window.localStorage.removeItem(LEGACY_AUTH_EMAIL_STORAGE_KEY);

  const user = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as User;
  } catch {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
}

const storedUser = getStoredUser();

export const useAuthStore = create<AuthStore>((set) => ({
  user: storedUser,
  email: storedUser?.email ?? null,
  login: (user) => {
    window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    set({ email: user.email, user });
  },
  logout: () => {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    set({ email: null, user: null });
  },
}));
