import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Eye, FilterX, RefreshCcw, Search } from "lucide-react";

// import { CustomerActiveDialog } from "../components/CustomerActiveDialog";
import { CustomerStatusBadge } from "../components/CustomerStatusBadge";
import { customersApi } from "../services/customersApi";
import type { Customer, ListCustomersQuery } from "../types/customerTypes";
import {
  formatCustomerDate,
  formatOptionalCustomerValue,
  formatShortCustomerId,
} from "../utils/customerFormatters";

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

const allValue = "all";

type CustomerStatusFilter = "all" | "false" | "true";

const initialCustomers: ApiPaginated<Customer> = {
  items: [],
  limit: 20,
  page: 1,
  total: 0,
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<ApiPaginated<Customer>>(initialCustomers);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CustomerStatusFilter>(allValue);
  const [submittedFilters, setSubmittedFilters] = useState({
    search: "",
    status: allValue as CustomerStatusFilter,
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const columns = useMemo<Array<ColumnDef<Customer>>>(
    () => [
      {
        accessorKey: "fullName",
        header: "Customer",
        cell: ({ row }) => {
          const customer = row.original;

          return (
            <div className="min-w-56 space-y-1">
              <Link
                className="text-primary font-medium hover:underline"
                params={{ customerId: customer.id }}
                to="/customers/$customerId"
              >
                {formatOptionalCustomerValue(customer.fullName)}
              </Link>
              <p className="text-muted text-xs">ID: {formatShortCustomerId(customer.id)}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <span className="text-sm font-medium">{row.original.email}</span>,
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <span className="text-muted text-sm">
            {formatOptionalCustomerValue(row.original.phone)}
          </span>
        ),
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => <CustomerStatusBadge active={row.original.active} />,
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }) => (
          <span className="text-muted text-sm">{formatCustomerDate(row.original.createdAt)}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const customer = row.original;

          return (
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link params={{ customerId: customer.id }} to="/customers/$customerId">
                  <Eye className="size-4" />
                  View
                </Link>
              </Button>

              {/* <CustomerActiveDialog
                customer={customer}
                onUpdated={handleCustomerUpdated}
                size="sm"
              /> */}
            </div>
          );
        },
      },
    ],
    [],
  );

  useEffect(() => {
    void loadCustomers();
  }, [limit, page, submittedFilters]);

  async function loadCustomers() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await customersApi.list(getCustomersQuery());
      setCustomers(response.data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to load customers."));
    } finally {
      setIsLoading(false);
    }
  }

  function getCustomersQuery(): ListCustomersQuery {
    return {
      active: submittedFilters.status === allValue ? undefined : submittedFilters.status,
      limit,
      page,
      q: submittedFilters.search,
    };
  }

  // function handleCustomerUpdated(updatedCustomer: Customer) {
  //   setCustomers((currentCustomers) => ({
  //     ...currentCustomers,
  //     items: currentCustomers.items.map((customer) =>
  //       customer.id === updatedCustomer.id ? updatedCustomer : customer,
  //     ),
  //   }));
  // }

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedFilters({ search, status });
    setPage(1);
  }

  function handleResetFilters() {
    setSearch("");
    setStatus(allValue);
    setSubmittedFilters({ search: "", status: allValue });
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
        <h2 className="text-2xl font-semibold tracking-normal">Customers</h2>

        <p className="text-muted mt-2 text-sm">
          View customer accounts, contact details, booking history, and account availability.
        </p>
      </div>

      <form
        className="bg-surface flex flex-wrap items-end gap-4 rounded-lg border p-4 shadow-sm"
        onSubmit={handleSearch}
      >
        <div className="w-full sm:w-72">
          <Label htmlFor="customer-search">Search</Label>
          <div className="relative">
            <Search className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              className="pl-9"
              disabled={isLoading}
              id="customer-search"
              maxLength={100}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name or email"
              type="search"
              value={search}
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <Label htmlFor="customer-status">Status</Label>
          <Select
            disabled={isLoading}
            onValueChange={(value) => setStatus(value as CustomerStatusFilter)}
            value={status}
          >
            <SelectTrigger id="customer-status">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={allValue}>All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Button className="flex-1 sm:flex-none" disabled={isLoading} type="submit">
            <Search className="size-4" />
            Search
          </Button>
          <Button
            aria-label="Reset Customer Filters"
            disabled={isLoading}
            onClick={handleResetFilters}
            type="button"
            variant="outline"
          >
            <FilterX className="size-4" />
            Clear
          </Button>
          <Button disabled={isLoading} onClick={loadCustomers} type="button" variant="outline">
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
        data={customers.items}
        emptyMessage={isLoading ? "Loading customers..." : "No customers found."}
        loadingMessage="Loading customers..."
        pagination={{
          isLoading,
          limit: customers.limit,
          onPageChange: handlePageChange,
          page: customers.page,
          rowsPerPage: {
            onLimitChange: handleLimitChange,
          },
          total: customers.total,
        }}
        resultLabel="Customers"
      />
    </section>
  );
}
