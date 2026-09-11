import type { BookingStatus } from "#/features/bookings/types/bookingTypes";
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
  activeScreens: number;
  activeVenues: number;
  totalCustomers: number;
};

export type DashboardRecentBooking = {
  bookingReference: string;
  createdAt: string;
  currency: string;
  id: string;
  movieTitle: string;
  startsAt: string;
  status: BookingStatus;
  totalMinor: number;
  userName: string;
  venueName: string;
};

export type DashboardBookingSummary = {
  recentBookings: Array<DashboardRecentBooking>;
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

export type DashboardSummaryResponse = {
  activeCities: number;
  activeCustomers: number;
  activeMovies: number;
  activeScreens: number;
  activeVenues: number;
  liveShows: number;
  recentBookings: Array<DashboardRecentBooking>;
  todayBookings: number;
  todayRevenueMinor: number;
  totalBookings: number;
  upcomingShows: number;
};
