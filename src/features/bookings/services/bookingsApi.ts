import type { BookingDetails, BookingSummary, ListBookingsQuery } from "../types/bookingTypes";

import { apiClient } from "#/shared/services/apiClient";
import type { ApiPaginated, ApiResponse } from "#/shared/types";
import { cleanQueryParams } from "#/shared/utils/cleanQueryParams";

export const bookingsApi = {
  get: async (id: string) => {
    const response = await apiClient.get<ApiResponse<{ booking: BookingDetails }>>(
      `/admin/bookings/${id}`,
    );

    return response.data;
  },

  list: async (query?: ListBookingsQuery) => {
    const response = await apiClient.get<ApiResponse<ApiPaginated<BookingSummary>>>(
      "/admin/bookings",
      {
        params: cleanQueryParams(query),
      },
    );

    return response.data;
  },
};
