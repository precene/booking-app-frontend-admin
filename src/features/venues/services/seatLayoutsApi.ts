import type {
  ListSeatLayoutsQuery,
  SeatLayout,
  SeatLayoutPayload,
  SeatLayoutUpdatePayload,
} from "../types/seatLayoutTypes";

import { apiClient } from "#/shared/services/apiClient";
import type { ApiResponse } from "#/shared/types";
import { cleanQueryParams } from "#/shared/utils/cleanQueryParams";

export const seatLayoutsApi = {
  list: async (query?: ListSeatLayoutsQuery) => {
    const response = await apiClient.get<ApiResponse<{ layouts: Array<SeatLayout> }>>(
      "/admin/layouts",
      {
        params: cleanQueryParams(query),
      },
    );

    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get<ApiResponse<{ layout: SeatLayout }>>(
      `/admin/layouts/${id}`,
    );

    return response.data;
  },

  create: async (payload: SeatLayoutPayload) => {
    const response = await apiClient.post<ApiResponse<{ layout: SeatLayout }>>(
      "/admin/layouts",
      payload,
    );

    return response.data;
  },

  update: async (id: string, payload: SeatLayoutUpdatePayload) => {
    const response = await apiClient.patch<ApiResponse<{ layout: SeatLayout }>>(
      `/admin/layouts/${id}`,
      payload,
    );

    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/admin/layouts/${id}`);
  },
};
