import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowLeft,
  BookOpenCheck,
  Eye,
  Mail,
  Phone,
  RefreshCcw,
  User,
} from "lucide-react";

// import { CustomerActiveDialog } from "../components/CustomerActiveDialog";
import { CustomerStatusBadge } from "../components/CustomerStatusBadge";
import { customersApi } from "../services/customersApi";
import type { Customer } from "../types/customerTypes";
import {
  formatCustomerDate,
  formatOptionalCustomerValue,
  formatShortCustomerId,
} from "../utils/customerFormatters";

import { BookingStatusBadge } from "#/features/bookings/components/BookingStatusBadge";
import { bookingsApi } from "#/features/bookings/services/bookingsApi";
import type { BookingSummary, ListBookingsQuery } from "#/features/bookings/types/bookingTypes";
import { formatBookingMoney, formatShortId } from "#/features/bookings/utils/bookingFormatters";
import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { Button } from "#/shared/components/ui/button";
import { DataTable } from "#/shared/components/ui/data-table";
import type { ApiPaginated } from "#/shared/types";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

type CustomerInfoItem = {
  label: string;
  value: string;
};

const initialBookings: ApiPaginated<BookingSummary> = {
  items: [],
  limit: 10,
  page: 1,
  total: 0,
};

export default function CustomerDetailsPage() {
  const { customerId } = useParams({ from: "/_protected/customers/$customerId" });
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<ApiPaginated<BookingSummary>>(initialBookings);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCustomerLoading, setIsCustomerLoading] = useState(true);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);
  const [customerErrorMessage, setCustomerErrorMessage] = useState<string | null>(null);
  const [bookingsErrorMessage, setBookingsErrorMessage] = useState<string | null>(null);

  const customerInfo: Array<CustomerInfoItem> = customer
    ? [
        { label: "Customer ID", value: customer.id },
        { label: "Email", value: customer.email },
        { label: "Phone", value: formatOptionalCustomerValue(customer.phone) },
        { label: "Joined", value: formatCustomerDate(customer.createdAt) },
        { label: "Last Updated", value: formatCustomerDate(customer.updatedAt) },
      ]
    : [];

  const bookingColumns = useMemo<Array<ColumnDef<BookingSummary>>>(
    () => [
      {
        accessorKey: "bookingReference",
        header: "Booking",
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
        accessorKey: "showId",
        header: "Show",
        cell: ({ row }) => (
          <span className="text-sm font-medium">Show {formatShortId(row.original.showId)}</span>
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
              View
            </Link>
          </Button>
        ),
      },
    ],
    [],
  );

  useEffect(() => {
    void loadCustomer();
  }, [customerId]);

  useEffect(() => {
    void loadBookings();
  }, [customerId, limit, page]);

  async function loadCustomer() {
    setIsCustomerLoading(true);
    setCustomerErrorMessage(null);

    try {
      const response = await customersApi.get(customerId);
      setCustomer(response.data.user);
    } catch (error) {
      setCustomer(null);
      setCustomerErrorMessage(getApiErrorMessage(error, "Unable to load customer details."));
    } finally {
      setIsCustomerLoading(false);
    }
  }

  async function loadBookings() {
    setIsBookingsLoading(true);
    setBookingsErrorMessage(null);

    try {
      const response = await bookingsApi.list(getBookingsQuery());
      setBookings(response.data);
    } catch (error) {
      setBookings(initialBookings);
      setBookingsErrorMessage(getApiErrorMessage(error, "Unable to load customer bookings."));
    } finally {
      setIsBookingsLoading(false);
    }
  }

  function getBookingsQuery(): ListBookingsQuery {
    return {
      limit,
      page,
      userId: customerId,
    };
  }

  // function handleCustomerUpdated(updatedCustomer: Customer) {
  //   setCustomer(updatedCustomer);
  // }

  function handleLimitChange(nextLimit: number) {
    setLimit(nextLimit);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button asChild aria-label="Back To Customers" size="icon" variant="ghost">
              <Link to="/customers">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>

            <h2 className="text-2xl font-semibold tracking-normal">View Customer</h2>
          </div>

          <p className="text-muted mt-2 text-sm">
            View customer profile, account status, and booking history.
          </p>
        </div>

        {/* {customer ? (
          <CustomerActiveDialog customer={customer} onUpdated={handleCustomerUpdated} />
        ) : null} */}
      </div>

      {customerErrorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{customerErrorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {isCustomerLoading ? (
        <div className="bg-surface rounded-lg border p-6 shadow-sm">
          <p className="text-muted text-sm font-medium">Loading customer details...</p>
        </div>
      ) : null}

      {customer ? (
        <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-md">
                <User className="size-6" />
              </div>

              <CustomerStatusBadge active={customer.active} />
            </div>

            <h3 className="mt-5 text-xl font-semibold tracking-normal">
              {formatOptionalCustomerValue(customer.fullName)}
            </h3>
            <p className="text-muted mt-2 text-sm">Customer {formatShortCustomerId(customer.id)}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-surface rounded-lg border p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Mail className="text-primary size-5" />
                <h3 className="text-base font-semibold tracking-normal">Contact Information</h3>
              </div>

              <dl className="mt-4 grid gap-4">
                {customerInfo.slice(0, 3).map((item) => (
                  <InfoItem item={item} key={item.label} />
                ))}
              </dl>
            </div>

            <div className="bg-surface rounded-lg border p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Phone className="text-primary size-5" />
                <h3 className="text-base font-semibold tracking-normal">Account Information</h3>
              </div>

              <dl className="mt-4 grid gap-4">
                {customerInfo.slice(3).map((item) => (
                  <InfoItem item={item} key={item.label} />
                ))}
              </dl>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="text-primary size-5" />
            <h3 className="text-lg font-semibold tracking-normal">Booking History</h3>
          </div>

          <Button
            disabled={isBookingsLoading}
            onClick={loadBookings}
            type="button"
            variant="outline"
          >
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>

        {bookingsErrorMessage ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{bookingsErrorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <DataTable
          columns={bookingColumns}
          data={bookings.items}
          emptyMessage={isBookingsLoading ? "Loading bookings..." : "No bookings found."}
          loadingMessage="Loading bookings..."
          pagination={{
            isLoading: isBookingsLoading,
            limit: bookings.limit,
            onPageChange: handlePageChange,
            page: bookings.page,
            rowsPerPage: {
              onLimitChange: handleLimitChange,
              options: [10, 20, 50],
            },
            total: bookings.total,
          }}
          resultLabel="Bookings"
        />
      </div>
    </section>
  );
}

function InfoItem({ item }: { item: CustomerInfoItem }) {
  return (
    <div>
      <dt className="text-muted text-xs font-medium uppercase">{item.label}</dt>
      <dd className="mt-1 text-sm font-medium break-all">{item.value}</dd>
    </div>
  );
}
