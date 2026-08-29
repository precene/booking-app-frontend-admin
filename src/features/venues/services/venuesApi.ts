import type { ListVenuesQuery, Venue, VenuePayload, VenueUpdatePayload } from "../types/venueTypes";

import { apiClient } from "#/shared/services/apiClient";
import type { ApiPaginated, ApiResponse } from "#/shared/types";
import { cleanQueryParams } from "#/shared/utils/cleanQueryParams";

export const venuesApi = {
  list: async (query?: ListVenuesQuery) => {
    const response = await apiClient.get<ApiResponse<ApiPaginated<Venue>>>("/admin/venues", {
      params: cleanQueryParams(query),
    });

    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get<ApiResponse<{ venue: Venue }>>(`/admin/venues/${id}`);

    return response.data;
  },

  create: async (payload: VenuePayload) => {
    const response = await apiClient.post<ApiResponse<{ venue: Venue }>>("/admin/venues", payload);

    return response.data;
  },

  update: async (id: string, payload: VenueUpdatePayload) => {
    const response = await apiClient.patch<ApiResponse<{ venue: Venue }>>(
      `/admin/venues/${id}`,
      payload,
    );

    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/admin/venues/${id}`);
  },
};
