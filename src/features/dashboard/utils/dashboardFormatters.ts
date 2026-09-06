import { DateTime } from "luxon";

import type { BookingSummary } from "#/features/bookings/types/bookingTypes";
import type { DashboardMetric, DashboardSummary } from "../types/dashboardTypes";

export function formatDashboardMoney(amountMinor: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amountMinor / 100);
}

export function formatDashboardDateTime(value: string) {
  const dateTime = DateTime.fromISO(value);

  return dateTime.isValid ? dateTime.toFormat("dd LLL yyyy, h:mm a") : "Invalid Date";
}

export function formatDashboardShortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export function isToday(value: string) {
  const dateTime = DateTime.fromISO(value);

  return dateTime.isValid && dateTime.hasSame(DateTime.local(), "day");
}

export function getPaidRevenueMinor(bookings: Array<BookingSummary>) {
  return bookings.reduce((total, booking) => {
    if (booking.status !== "paid") {
      return total;
    }

    return total + booking.totalMinor;
  }, 0);
}

export function getDashboardMetrics(summary: DashboardSummary): Array<DashboardMetric> {
  return [
    {
      helperText: `${summary.bookings.totalBookings} Total Bookings`,
      label: "Today's Bookings",
      tone: "primary",
      value: String(summary.bookings.todayBookings),
    },
    {
      helperText: "Paid Bookings Created Today",
      label: "Today's Revenue",
      tone: "success",
      value: formatDashboardMoney(summary.bookings.todayRevenueMinor),
    },
    {
      helperText: `${summary.shows.upcomingShowsTotal} Upcoming Shows`,
      label: "Live Shows",
      tone: "warning",
      value: String(summary.shows.liveShows),
    },
    {
      helperText: `${summary.catalog.activeVenues} Active Venues`,
      label: "Active Movies",
      tone: "secondary",
      value: String(summary.catalog.activeMovies),
    },
  ];
}
