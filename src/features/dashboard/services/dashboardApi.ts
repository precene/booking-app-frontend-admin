import { DateTime } from "luxon";

import { couponsApi } from "#/features/coupons/services/couponsApi";
import { showtimesApi } from "#/features/showtimes/services/showtimesApi";
import { apiClient } from "#/shared/services/apiClient";
import type { ApiResponse } from "#/shared/types";
import type { DashboardSummary, DashboardSummaryResponse } from "../types/dashboardTypes";

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const todayStart = DateTime.local().startOf("day").toUTC().toISO() ?? undefined;
    const nextWeekEnd =
      DateTime.local().plus({ days: 7 }).endOf("day").toUTC().toISO() ?? undefined;

    const [summaryResponse, upcomingShowsResponse, activeCouponsResponse] = await Promise.all([
      apiClient.get<ApiResponse<DashboardSummaryResponse>>("/admin/dashboard/summary"),
      showtimesApi.list({
        from: todayStart,
        limit: 5,
        page: 1,
        status: "scheduled",
        to: nextWeekEnd,
      }),
      couponsApi.list({ active: "true", limit: 1, page: 1 }),
    ]);
    const summary = summaryResponse.data.data;

    return {
      bookings: {
        recentBookings: summary.recentBookings.slice(0, 5),
        todayBookings: summary.todayBookings,
        todayRevenueMinor: summary.todayRevenueMinor,
        totalBookings: summary.totalBookings,
      },
      catalog: {
        activeCities: summary.activeCities,
        activeCoupons: activeCouponsResponse.data.total,
        activeMovies: summary.activeMovies,
        activeScreens: summary.activeScreens,
        activeVenues: summary.activeVenues,
        totalCustomers: summary.activeCustomers,
      },
      shows: {
        liveShows: summary.liveShows,
        upcomingShows: upcomingShowsResponse.data.items,
        upcomingShowsTotal: summary.upcomingShows,
      },
    };
  },
};
