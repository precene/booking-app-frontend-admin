import { useCallback, useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Eye, FilterX, RefreshCcw, Search } from "lucide-react";

// import { CreateRefundDialog } from "../components/CreateRefundDialog";

import { PaymentStatusBadge } from "../components/PaymentStatusBadge";
import { paymentsApi } from "../services/paymentsApi";
import type { AdminPayment, ListPaymentsQuery, PaymentStatus } from "../types/paymentTypes";
import {
  formatCardDetails,
  formatPaymentDate,
  formatPaymentMoney,
  formatStatusText,
  paymentStatusOptions,
} from "../utils/paymentFormatters";
import { paymentFiltersSchema } from "../validations/paymentValidation";

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
import { cn } from "#/shared/utils/cn";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

const allValue = "all";

const initialPayments: ApiPaginated<AdminPayment> = {
  items: [],
  limit: 20,
  page: 1,
  total: 0,
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<ApiPaginated<AdminPayment>>(initialPayments);
  const [status, setStatus] = useState<PaymentStatus | typeof allValue>(allValue);
  const [query, setQuery] = useState("");
  const [submittedFilters, setSubmittedFilters] = useState({
    query: "",
    status: allValue as PaymentStatus | typeof allValue,
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  const getPaymentsQuery = useCallback((): ListPaymentsQuery => {
    return {
      limit,
      page,
      q: submittedFilters.query.trim(),
      status: submittedFilters.status === allValue ? undefined : submittedFilters.status,
    };
  }, [limit, page, submittedFilters]);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await paymentsApi.list(getPaymentsQuery());
      setPayments(response.data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to load payments."));
    } finally {
      setIsLoading(false);
    }
  }, [getPaymentsQuery]);

  const columns = useMemo<Array<ColumnDef<AdminPayment>>>(() => {
    return [
      {
        accessorKey: "id",
        header: "Payment",
        cell: ({ row }) => (
          <div className="min-w-44 space-y-1">
            <p className="text-sm font-medium">{row.original.id.slice(0, 8)}</p>
            <p className="text-muted text-xs">{formatPaymentDate(row.original.createdAt)}</p>
          </div>
        ),
      },
      {
        accessorKey: "booking.reference",
        header: "Booking",
        cell: ({ row }) => (
          <div className="min-w-40 space-y-1">
            <Link
              className="text-primary font-medium hover:underline"
              params={{ bookingId: row.original.bookingId }}
              to="/bookings/$bookingId"
            >
              {row.original.booking.reference}
            </Link>
            <p className="text-muted text-xs">
              Status: {formatStatusText(row.original.booking.status)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "customer.email",
        header: "Customer",
        cell: ({ row }) => (
          <div className="min-w-48 space-y-1">
            <p className="text-sm font-medium">{row.original.customer.name}</p>
            <p className="text-muted text-xs">{row.original.customer.email}</p>
          </div>
        ),
      },
      {
        accessorKey: "amountMinor",
        header: "Amount",
        cell: ({ row }) => (
          <div className="min-w-36 space-y-1">
            <p className="text-sm font-medium">
              {formatPaymentMoney(row.original.amountMinor, row.original.currency)}
            </p>
            <p className="text-muted text-xs">
              {formatCardDetails(row.original.cardBrand, row.original.cardLast4)}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link params={{ bookingId: row.original.bookingId }} to="/bookings/$bookingId">
                <Eye className="size-4" />
                View Booking
              </Link>
            </Button>

            {/* <CreateRefundDialog
              disabled={row.original.status !== "succeeded"}
              initialBookingId={row.original.bookingId}
              onCreated={loadPayments}
              size="sm"
              triggerLabel="Refund"
              variant="outline"
            /> */}
          </div>
        ),
      },
    ];
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = paymentFiltersSchema.safeParse({ query });

    if (!validation.success) {
      setQueryError(validation.error.issues[0]?.message ?? "Search must be valid");
      return;
    }

    setQueryError(null);
    setSubmittedFilters({ query: validation.data.query, status });
    setPage(1);
  }

  function handleResetFilters() {
    setQuery("");
    setStatus(allValue);
    setQueryError(null);
    setSubmittedFilters({ query: "", status: allValue });
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal">Payments</h2>
          <p className="text-muted mt-2 text-sm">
            Review payment activity, booking references, and customer information.
          </p>
        </div>

        {/* <CreateRefundDialog onCreated={loadPayments} /> */}
      </div>

      <form
        className="bg-surface flex flex-wrap items-end gap-4 rounded-lg border p-4 shadow-sm"
        onSubmit={handleSearch}
      >
        <div className="w-full sm:w-48">
          <Label htmlFor="payment-status">Status</Label>
          <Select
            disabled={isLoading}
            onValueChange={(value) => setStatus(value as PaymentStatus | typeof allValue)}
            value={status}
          >
            <SelectTrigger id="payment-status">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={allValue}>All Status</SelectItem>
              {paymentStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-80">
          <Label htmlFor="payment-search">Search</Label>
          <Input
            aria-describedby={queryError ? "payment-search-error" : undefined}
            aria-invalid={Boolean(queryError)}
            className={cn(queryError && "border-destructive focus-visible:ring-destructive/30")}
            disabled={isLoading}
            id="payment-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Booking reference, customer name, or email"
            value={query}
          />
          {queryError ? (
            <p className="text-destructive mt-1 text-xs" id="payment-search-error">
              {queryError}
            </p>
          ) : null}
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Button className="flex-1 sm:flex-none" disabled={isLoading} type="submit">
            <Search className="size-4" />
            Search
          </Button>
          <Button
            aria-label="Reset Payment Filters"
            disabled={isLoading}
            onClick={handleResetFilters}
            type="button"
            variant="outline"
          >
            <FilterX className="size-4" />
            Clear
          </Button>
          <Button disabled={isLoading} onClick={loadPayments} type="button" variant="outline">
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
        data={payments.items}
        emptyMessage={isLoading ? "Loading payments..." : "No payments found."}
        loadingMessage="Loading payments..."
        pagination={{
          isLoading,
          limit: payments.limit,
          onPageChange: handlePageChange,
          page: payments.page,
          rowsPerPage: {
            onLimitChange: handleLimitChange,
          },
          total: payments.total,
        }}
        resultLabel="Payments"
      />
    </section>
  );
}
