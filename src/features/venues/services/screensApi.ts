import type {
  ListScreensQuery,
  Screen,
  ScreenPayload,
  ScreenUpdatePayload,
} from "../types/screenTypes";

import { apiClient } from "#/shared/services/apiClient";
import type { ApiResponse } from "#/shared/types";
import { cleanQueryParams } from "#/shared/utils/cleanQueryParams";

export const screensApi = {
  list: async (query?: ListScreensQuery) => {
    const response = await apiClient.get<ApiResponse<{ screens: Array<Screen> }>>(
      "/admin/screens",
      {
        params: cleanQueryParams(query),
      },
    );

    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get<ApiResponse<{ screen: Screen }>>(`/admin/screens/${id}`);

    return response.data;
  },

  create: async (payload: ScreenPayload) => {
    const response = await apiClient.post<ApiResponse<{ screen: Screen }>>(
      "/admin/screens",
      payload,
    );

    return response.data;
  },

  update: async (id: string, payload: ScreenUpdatePayload) => {
    const response = await apiClient.patch<ApiResponse<{ screen: Screen }>>(
      `/admin/screens/${id}`,
      payload,
    );

    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/admin/screens/${id}`);
  },
};
