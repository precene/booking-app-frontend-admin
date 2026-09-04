import type { City, CityPayload, CityUpdatePayload, ListCitiesQuery } from "../types/cityTypes";

import { apiClient } from "#/shared/services/apiClient";
import type { ApiPaginated, ApiResponse } from "#/shared/types";
import { cleanQueryParams } from "#/shared/utils/cleanQueryParams";

export const citiesApi = {
  list: async (query?: ListCitiesQuery) => {
    const response = await apiClient.get<ApiResponse<ApiPaginated<City>>>("/admin/cities", {
      params: cleanQueryParams(query),
    });

    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get<ApiResponse<{ city: City }>>(`/admin/cities/${id}`);

    return response.data;
  },

  create: async (payload: CityPayload) => {
    const response = await apiClient.post<ApiResponse<{ city: City }>>("/admin/cities", payload);

    return response.data;
  },

  update: async (id: string, payload: CityUpdatePayload) => {
    const response = await apiClient.patch<ApiResponse<{ city: City }>>(
      `/admin/cities/${id}`,
      payload,
    );

    return response.data;
  },

  // City delete is intentionally disabled in the admin UI for now.
  // delete: async (id: string) => {
  //   await apiClient.delete(`/admin/cities/${id}`);
  // },
};
