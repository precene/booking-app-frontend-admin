import type {
  Coupon,
  CouponPayload,
  CouponUpdatePayload,
  ListCouponsQuery,
} from "../types/couponTypes";

import { apiClient } from "#/shared/services/apiClient";
import type { ApiPaginated, ApiResponse } from "#/shared/types";
import { cleanQueryParams } from "#/shared/utils/cleanQueryParams";

export const couponsApi = {
  list: async (query?: ListCouponsQuery) => {
    const response = await apiClient.get<ApiResponse<ApiPaginated<Coupon>>>("/admin/promo-codes", {
      params: cleanQueryParams(query),
    });

    return response.data;
  },

  create: async (payload: CouponPayload) => {
    const response = await apiClient.post<ApiResponse<{ promo: Coupon }>>(
      "/admin/promo-codes",
      payload,
    );

    return response.data;
  },

  get: async (id: string) => {
    const response = await apiClient.get<ApiResponse<{ promo: Coupon }>>(
      `/admin/promo-codes/${id}`,
    );

    return response.data;
  },

  update: async (id: string, payload: CouponUpdatePayload) => {
    const response = await apiClient.patch<ApiResponse<{ promo: Coupon }>>(
      `/admin/promo-codes/${id}`,
      payload,
    );

    return response.data;
  },
};
