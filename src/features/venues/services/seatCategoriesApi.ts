import { apiClient } from "#/shared/services/apiClient";
import type { ApiPaginated, ApiResponse } from "#/shared/types";
import { cleanQueryParams } from "#/shared/utils/cleanQueryParams";
import type {
  ListSeatCategoriesQuery,
  SeatCategory,
  SeatCategoryPayload,
  SeatCategoryUpdatePayload,
} from "../types/seatCategoryTypes";

export const seatCategoriesApi = {
  list: async (query?: ListSeatCategoriesQuery) => {
    const response = await apiClient.get<ApiResponse<ApiPaginated<SeatCategory>>>(
      "/admin/seat-categories",
      {
        params: cleanQueryParams(query),
      },
    );

    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get<ApiResponse<{ category: SeatCategory }>>(
      `/admin/seat-categories/${id}`,
    );

    return response.data;
  },

  create: async (payload: SeatCategoryPayload) => {
    const response = await apiClient.post<ApiResponse<{ category: SeatCategory }>>(
      "/admin/seat-categories",
      payload,
    );

    return response.data;
  },

  update: async (id: string, payload: SeatCategoryUpdatePayload) => {
    const response = await apiClient.patch<ApiResponse<{ category: SeatCategory }>>(
      `/admin/seat-categories/${id}`,
      payload,
    );

    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/admin/seat-categories/${id}`);
  },
};
