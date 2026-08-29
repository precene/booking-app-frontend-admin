import type { AuthUserResponse, LoginPayload } from "../types/authTypes";

import { apiClient } from "#/shared/services/apiClient";
import type { ApiResponse } from "#/shared/types";

export const authApi = {
  login: async (payload: LoginPayload) => {
    const response = await apiClient.post<ApiResponse<AuthUserResponse>>("/auth/login", payload);

    return response.data;
  },

  me: async () => {
    const response = await apiClient.get<ApiResponse<AuthUserResponse>>("/auth/me");

    return response.data;
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
  },
};
