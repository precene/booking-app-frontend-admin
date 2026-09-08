import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Eye, FilterX, RefreshCcw, Search } from "lucide-react";

import { BookingStatusBadge } from "../components/BookingStatusBadge";
import { bookingsApi } from "../services/bookingsApi";
import type { BookingStatus, BookingSummary, ListBookingsQuery } from "../types/bookingTypes";
import {
  bookingStatusOptions,
  formatBookingDate,
  formatBookingMoney,
  formatShortId,
} from "../utils/bookingFormatters";
import { bookingFiltersSchema } from "../validations/bookingValidation";

import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { Button } from "#/shared/components/ui/button";
import { DataTable } from "#/shared/components/ui/data-table";
import { Input } from "#/shared/components/ui/input";
import { Label } from "#/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/shared/components/ui/select";
import type { ApiPaginated } from "#/shared/types";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import { cn } from "#/shared/utils/cn";

const allValue = "all";

const initialBookings: ApiPaginated<BookingSummary> = {
  items: [],
  limit: 20,
  page: 1,
  total: 0,
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<ApiPaginated<BookingSummary>>(initialBookings);
  const [status, setStatus] = useState<BookingStatus | typeof allValue>(allValue);
  const [userId, setUserId] = useState("");
  const [submittedFilters, setSubmittedFilters] = useState({
    status: allValue as BookingStatus | typeof allValue,
    userId: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userIdError, setUserIdError] = useState<string | null>(null);

  const columns = useMemo<Array<ColumnDef<BookingSummary>>>(
    () => [
      {
        accessorKey: "bookingReference",
        header: "Booking Reference",
        cell: ({ row }) => (
          <Link
            className="text-primary font-medium hover:underline"
            params={{ bookingId: row.original.id }}
            to="/bookings/$bookingId"
          >
            {row.original.bookingReference}
          </Link>
        ),
      },
      {
        accessorKey: "userId",
        header: "Customer",
        cell: ({ row }) => (
          <div className="min-w-48 space-y-1">
            <p className="text-sm font-medium">
              {row.original.customer?.fullName ?? `User ${formatShortId(row.original.userId)}`}
            </p>
            {row.original.customer?.email ? (
              <p className="text-muted text-xs">{row.original.customer.email}</p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "showId",
        header: "Show",
        cell: ({ row }) => (
          <div className="min-w-56 space-y-1">
            <p className="text-sm font-medium">
              {row.original.show?.movieTitle ?? `Show ${formatShortId(row.original.showId)}`}
            </p>
            {row.original.show ? (
              <p className="text-muted text-xs">
                {row.original.show.venueName} - {row.original.show.screenName}
              </p>
            ) : null}
            {row.original.show?.startsAt ? (
              <p className="text-muted text-xs">{formatBookingDate(row.original.show.startsAt)}</p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "totalMinor",
        header: "Total",
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {formatBookingMoney(row.original.totalMinor, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <BookingStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button asChild size="sm" variant="outline">
            <Link params={{ bookingId: row.original.id }} to="/bookings/$bookingId">
              <Eye className="size-4" />
              View Booking
            </Link>
          </Button>
        ),
      },
    ],
    [],
  );

  useEffect(() => {
    void loadBookings();
  }, [limit, page, submittedFilters]);

  async function loadBookings() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await bookingsApi.list(getBookingsQuery());
      setBookings(response.data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to load bookings."));
    } finally {
      setIsLoading(false);
    }
  }

  function getBookingsQuery(): ListBookingsQuery {
    return {
      limit,
      page,
      status: submittedFilters.status === allValue ? undefined : submittedFilters.status,
      userId: submittedFilters.userId.trim(),
    };
  }

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = bookingFiltersSchema.safeParse({ userId });

    if (!validation.success) {
      setUserIdError(validation.error.issues[0]?.message ?? "Use a valid user ID");
      return;
    }

    setUserIdError(null);
    setSubmittedFilters({ status, userId: validation.data.userId });
    setPage(1);
  }

  function handleResetFilters() {
    setStatus(allValue);
    setUserId("");
    setUserIdError(null);
    setSubmittedFilters({ status: allValue, userId: "" });
    setLimit(20);
    setPage(1);
  }

  function handleLimitChange(nextLimit: number) {
    setLimit(nextLimit);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">Bookings</h2>

        <p className="text-muted mt-2 text-sm">
          Review customer reservations, payment status, show references, and seat holds.
        </p>
      </div>

      <form
        className="bg-surface flex flex-wrap items-end gap-4 rounded-lg border p-4 shadow-sm"
        onSubmit={handleSearch}
      >
        <div className="w-full sm:w-72">
          <Label htmlFor="booking-user">User ID</Label>
          <Input
            aria-describedby={userIdError ? "booking-user-error" : undefined}
            aria-invalid={Boolean(userIdError)}
            className={cn(userIdError && "border-destructive focus-visible:ring-destructive/30")}
            disabled={isLoading}
            id="booking-user"
            onChange={(event) => setUserId(event.target.value)}
            placeholder="Filter by user ID"
            value={userId}
          />
          {userIdError ? (
            <p className="text-destructive mt-1 text-xs" id="booking-user-error">
              {userIdError}
            </p>
          ) : null}
        </div>

        <div className="w-full sm:w-48">
          <Label htmlFor="booking-status">Status</Label>
          <Select
            disabled={isLoading}
            onValueChange={(value) => setStatus(value as BookingStatus | typeof allValue)}
            value={status}
          >
            <SelectTrigger id="booking-status">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={allValue}>All Status</SelectItem>
              {bookingStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Button className="flex-1 sm:flex-none" disabled={isLoading} type="submit">
            <Search className="size-4" />
            Search
          </Button>
          <Button
            aria-label="Reset booking filters"
            disabled={isLoading}
            onClick={handleResetFilters}
            type="button"
            variant="outline"
          >
            <FilterX className="size-4" />
            Clear
          </Button>
          <Button disabled={isLoading} onClick={loadBookings} type="button" variant="outline">
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>
      </form>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <DataTable
        columns={columns}
        data={bookings.items}
        emptyMessage={isLoading ? "Loading bookings..." : "No bookings found."}
        loadingMessage="Loading bookings..."
        pagination={{
          isLoading,
          limit: bookings.limit,
          onPageChange: handlePageChange,
          page: bookings.page,
          rowsPerPage: {
            onLimitChange: handleLimitChange,
          },
          total: bookings.total,
        }}
        resultLabel="Bookings"
      />
    </section>
  );
}
