import type {
  Customer,
  ListCustomersQuery,
  UpdateCustomerActivePayload,
} from "../types/customerTypes";

import { apiClient } from "#/shared/services/apiClient";
import type { ApiPaginated, ApiResponse } from "#/shared/types";
import { cleanQueryParams } from "#/shared/utils/cleanQueryParams";

export const customersApi = {
  get: async (id: string) => {
    const response = await apiClient.get<ApiResponse<{ user: Customer }>>(`/admin/users/${id}`);

    return response.data;
  },

  list: async (query?: ListCustomersQuery) => {
    const response = await apiClient.get<ApiResponse<ApiPaginated<Customer>>>("/admin/users", {
      params: cleanQueryParams({ ...query, role: "customer" }),
    });

    return response.data;
  },

  updateActive: async (id: string, payload: UpdateCustomerActivePayload) => {
    const response = await apiClient.patch<ApiResponse<{ user: Customer }>>(
      `/admin/users/${id}/active`,
      payload,
    );

    return response.data;
  },
};
