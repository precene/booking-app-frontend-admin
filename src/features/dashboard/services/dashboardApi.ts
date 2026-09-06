import { DateTime } from "luxon";

import { bookingsApi } from "#/features/bookings/services/bookingsApi";
import { citiesApi } from "#/features/cities/services/citiesApi";
import { couponsApi } from "#/features/coupons/services/couponsApi";
import { customersApi } from "#/features/customers/services/customersApi";
import { moviesApi } from "#/features/movies/services/moviesApi";
import { showtimesApi } from "#/features/showtimes/services/showtimesApi";
import { venuesApi } from "#/features/venues/services/venuesApi";
import type { DashboardSummary } from "../types/dashboardTypes";
import { getPaidRevenueMinor, isToday } from "../utils/dashboardFormatters";

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const todayStart = DateTime.local().startOf("day").toUTC().toISO() ?? undefined;
    const nextWeekEnd =
      DateTime.local().plus({ days: 7 }).endOf("day").toUTC().toISO() ?? undefined;

    const [
      bookingsResponse,
      recentBookingsResponse,
      liveShowsResponse,
      upcomingShowsResponse,
      activeMoviesResponse,
      activeCitiesResponse,
      activeVenuesResponse,
      activeCouponsResponse,
      customersResponse,
    ] = await Promise.all([
      bookingsApi.list({ limit: 1, page: 1 }),
      bookingsApi.list({ limit: 100, page: 1 }),
      showtimesApi.list({ limit: 1, page: 1, status: "live" }),
      showtimesApi.list({
        from: todayStart,
        limit: 5,
        page: 1,
        status: "scheduled",
        to: nextWeekEnd,
      }),
      moviesApi.list({ active: "true", limit: 1, page: 1 }),
      citiesApi.list({ active: "true", limit: 1, page: 1 }),
      venuesApi.list({ active: "true", limit: 1, page: 1 }),
      couponsApi.list({ active: "true", limit: 1, page: 1 }),
      customersApi.list({ limit: 1, page: 1 }),
    ]);

    const todayBookings = recentBookingsResponse.data.items.filter((booking) =>
      isToday(booking.createdAt),
    );

    return {
      bookings: {
        recentBookings: recentBookingsResponse.data.items.slice(0, 5),
        todayBookings: todayBookings.length,
        todayRevenueMinor: getPaidRevenueMinor(todayBookings),
        totalBookings: bookingsResponse.data.total,
      },
      catalog: {
        activeCities: activeCitiesResponse.data.total,
        activeCoupons: activeCouponsResponse.data.total,
        activeMovies: activeMoviesResponse.data.total,
        activeVenues: activeVenuesResponse.data.total,
        totalCustomers: customersResponse.data.total,
      },
      shows: {
        liveShows: liveShowsResponse.data.total,
        upcomingShows: upcomingShowsResponse.data.items,
        upcomingShowsTotal: upcomingShowsResponse.data.total,
      },
    };
  },
};
