import type {
  ListShowtimesQuery,
  Showtime,
  ShowtimeListItem,
  ShowtimePayload,
  ShowtimeSeatMap,
  ShowtimeUpdatePayload,
} from "../types/showtimeTypes";

import { apiClient } from "#/shared/services/apiClient";
import type { ApiPaginated, ApiResponse } from "#/shared/types";
import { cleanQueryParams } from "#/shared/utils/cleanQueryParams";

export const showtimesApi = {
  cancel: async (id: string) => {
    const response = await apiClient.post<ApiResponse<{ show: Showtime }>>(
      `/admin/shows/${id}/cancel`,
    );

    return response.data;
  },

  create: async (payload: ShowtimePayload) => {
    const response = await apiClient.post<ApiResponse<{ show: Showtime }>>("/admin/shows", payload);

    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get<ApiResponse<{ show: Showtime }>>(`/admin/shows/${id}`);

    return response.data;
  },

  getSeatMap: async (id: string) => {
    const response = await apiClient.get<ApiResponse<ShowtimeSeatMap>>(`/shows/${id}/seats`);

    return response.data;
  },

  list: async (query?: ListShowtimesQuery) => {
    const response = await apiClient.get<ApiResponse<ApiPaginated<ShowtimeListItem>>>(
      "/admin/shows",
      {
        params: cleanQueryParams(query),
      },
    );

    return response.data;
  },

  update: async (id: string, payload: ShowtimeUpdatePayload) => {
    const response = await apiClient.patch<ApiResponse<{ show: Showtime }>>(
      `/admin/shows/${id}`,
      payload,
    );

    return response.data;
  },
};
