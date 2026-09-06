import type { BookingSummary } from "#/features/bookings/types/bookingTypes";
import type { ShowtimeListItem } from "#/features/showtimes/types/showtimeTypes";

export type DashboardMetric = {
  label: string;
  value: string;
  helperText: string;
  tone: "primary" | "secondary" | "success" | "warning";
};

export type DashboardCatalogSummary = {
  activeCities: number;
  activeCoupons: number;
  activeMovies: number;
  activeVenues: number;
  totalCustomers: number;
};

export type DashboardBookingSummary = {
  recentBookings: Array<BookingSummary>;
  todayBookings: number;
  todayRevenueMinor: number;
  totalBookings: number;
};

export type DashboardShowSummary = {
  liveShows: number;
  upcomingShows: Array<ShowtimeListItem>;
  upcomingShowsTotal: number;
};

export type DashboardSummary = {
  bookings: DashboardBookingSummary;
  catalog: DashboardCatalogSummary;
  shows: DashboardShowSummary;
};
