import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  Film,
  PoundSterling,
  RefreshCcw,
  TicketCheck,
  Users,
} from "lucide-react";

import { useAuthStore } from "#/features/auth/store/authStore";
import { BookingStatusBadge } from "#/features/bookings/components/BookingStatusBadge";
import { formatBookingMoney } from "#/features/bookings/utils/bookingFormatters";
import { ShowtimeStatusBadge } from "#/features/showtimes/components/ShowtimeStatusBadge";
import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { Button } from "#/shared/components/ui/button";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import { DashboardMetricCard } from "../components/DashboardMetricCard";
import { dashboardApi } from "../services/dashboardApi";
import type { DashboardSummary } from "../types/dashboardTypes";
import { formatDashboardDateTime, getDashboardMetrics } from "../utils/dashboardFormatters";

const metricIcons = [TicketCheck, PoundSterling, CalendarClock, Film] as const;

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await dashboardApi.getSummary();
      setSummary(response);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable To Load Dashboard."));
    } finally {
      setIsLoading(false);
    }
  }

  const metrics = summary ? getDashboardMetrics(summary) : [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal">Dashboard</h2>
          <p className="text-muted mt-2 text-sm">
            Monitor bookings, showtimes, catalog readiness, and customer activity.
          </p>
        </div>

        <Button disabled={isLoading} onClick={loadDashboard} type="button" variant="outline">
          <RefreshCcw className="size-4" />
          Refresh
        </Button>
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary ? (
          metrics.map((metric, index) => (
            <DashboardMetricCard icon={metricIcons[index]} key={metric.label} metric={metric} />
          ))
        ) : (
          <>
            <DashboardSkeletonCard />
            <DashboardSkeletonCard />
            <DashboardSkeletonCard />
            <DashboardSkeletonCard />
          </>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <DashboardPanel
          action={
            <Button asChild size="sm" variant="outline">
              <Link to="/bookings">
                View All
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
          title="Recent Bookings"
        >
          {summary?.bookings.recentBookings.length ? (
            <div className="divide-y">
              {summary.bookings.recentBookings.map((booking) => (
                <div
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between"
                  key={booking.id}
                >
                  <div className="min-w-0">
                    <Link
                      className="text-primary font-medium hover:underline"
                      params={{ bookingId: booking.id }}
                      to="/bookings/$bookingId"
                    >
                      {booking.bookingReference}
                    </Link>
                    <p className="text-muted mt-1 text-sm">
                      {booking.userName} / {formatDashboardDateTime(booking.createdAt)}
                    </p>
                    <p className="text-muted mt-1 text-sm">
                      {booking.movieTitle} / {booking.venueName}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold">
                      {formatBookingMoney(booking.totalMinor, booking.currency)}
                    </span>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DashboardEmptyState label={isLoading ? "Loading Bookings..." : "No Bookings Found."} />
          )}
        </DashboardPanel>

        <DashboardPanel title="Catalog Health">
          <div className="grid gap-3">
            <CatalogHealthRow label="Active Cities" value={summary?.catalog.activeCities ?? 0} />
            <CatalogHealthRow label="Active Venues" value={summary?.catalog.activeVenues ?? 0} />
            <CatalogHealthRow label="Active Screens" value={summary?.catalog.activeScreens ?? 0} />
            <CatalogHealthRow label="Active Movies" value={summary?.catalog.activeMovies ?? 0} />
            <CatalogHealthRow label="Active Coupons" value={summary?.catalog.activeCoupons ?? 0} />
            <CatalogHealthRow label="Customers" value={summary?.catalog.totalCustomers ?? 0} />
          </div>
        </DashboardPanel>
      </div>

      <DashboardPanel
        action={
          <Button asChild size="sm" variant="outline">
            <Link to="/showtimes">
              View All
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
        title="Upcoming Showtimes"
      >
        {summary?.shows.upcomingShows.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {summary.shows.upcomingShows.map((showtime) => (
              <Link
                className="hover:border-primary/40 hover:bg-primary/5 rounded-lg border p-4 transition-colors"
                key={showtime.id}
                params={{ showId: showtime.id }}
                to="/showtimes/$showId"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{showtime.movie.title}</p>
                    <p className="text-muted mt-1 text-sm">
                      {showtime.venue.name} / {showtime.screen.name}
                    </p>
                  </div>
                  <ShowtimeStatusBadge status={showtime.status} />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <span>{formatDashboardDateTime(showtime.startsAt)}</span>
                  <span className="text-muted">
                    {showtime.seatSummary.available} / {showtime.seatSummary.total} Available
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <DashboardEmptyState
            label={isLoading ? "Loading Showtimes..." : "No Upcoming Showtimes Found."}
          />
        )}
      </DashboardPanel>

      <div className="bg-surface flex flex-col gap-3 rounded-lg border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary rounded-md p-2">
            <Users className="size-5" />
          </span>
          <div>
            <p className="font-semibold">Signed In User</p>
            <p className="text-muted text-sm">{user?.fullName ?? user?.email}</p>
          </div>
        </div>

        <p className="text-muted text-sm">{user?.email}</p>
      </div>
    </section>
  );
}

type DashboardPanelProps = {
  action?: ReactNode;
  children: ReactNode;
  title: string;
};

function DashboardPanel({ action, children, title }: DashboardPanelProps) {
  return (
    <section className="bg-surface rounded-lg border p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="font-semibold tracking-normal">{title}</h3>
        {action}
      </div>

      {children}
    </section>
  );
}

function DashboardSkeletonCard() {
  return (
    <div className="bg-surface rounded-lg border p-5 shadow-sm">
      <div className="bg-surface-muted h-4 w-28 rounded" />
      <div className="bg-surface-muted mt-4 h-8 w-20 rounded" />
      <div className="bg-surface-muted mt-5 h-4 w-36 rounded" />
    </div>
  );
}

type CatalogHealthRowProps = {
  label: string;
  value: number;
};

function CatalogHealthRow({ label, value }: CatalogHealthRowProps) {
  return (
    <div className="bg-surface-muted flex items-center justify-between rounded-md px-4 py-3">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

type DashboardEmptyStateProps = {
  label: string;
};

function DashboardEmptyState({ label }: DashboardEmptyStateProps) {
  return (
    <div className="text-muted flex min-h-32 items-center justify-center rounded-lg border border-dashed text-sm">
      {label}
    </div>
  );
}
