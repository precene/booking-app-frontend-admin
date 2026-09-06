import type { AdminPayment, CreateRefundPayload, ListPaymentsQuery } from "../types/paymentTypes";
import { paymentFeatureFlags } from "../utils/paymentFeatureFlags";

import { apiClient } from "#/shared/services/apiClient";
import type { ApiPaginated, ApiResponse } from "#/shared/types";
import { cleanQueryParams } from "#/shared/utils/cleanQueryParams";

export const paymentsApi = {
  list: async (query?: ListPaymentsQuery) => {
    const response = await apiClient.get<ApiResponse<ApiPaginated<AdminPayment>>>(
      "/admin/payments",
      {
        params: cleanQueryParams(query),
      },
    );

    return response.data;
  },

  createRefund: async (bookingId: string, payload: CreateRefundPayload) => {
    if (!paymentFeatureFlags.refunds) {
      throw new Error("Refunds are disabled.");
    }

    const response = await apiClient.post<ApiResponse<{ refundId: string; status: string }>>(
      `/admin/bookings/${bookingId}/refund`,
      payload,
    );

    return response.data;
  },
};
