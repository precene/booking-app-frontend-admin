import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Eye, FilterX, Pencil, Plus, RefreshCcw } from "lucide-react";

import { CouponStatusBadge } from "../components/CouponStatusBadge";
import { couponsApi } from "../services/couponsApi";
import type { Coupon, ListCouponsQuery } from "../types/couponTypes";
import {
  formatCouponDate,
  formatCouponDiscount,
  formatCouponUsage,
  formatCouponValidity,
} from "../utils/couponFormatters";

import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { Button } from "#/shared/components/ui/button";
import { DataTable } from "#/shared/components/ui/data-table";
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

const initialCoupons: ApiPaginated<Coupon> = {
  items: [],
  limit: 20,
  page: 1,
  total: 0,
};

type CouponStatusFilter = "all" | "false" | "true";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<ApiPaginated<Coupon>>(initialCoupons);
  const [status, setStatus] = useState<CouponStatusFilter>("all");
  const [submittedStatus, setSubmittedStatus] = useState<CouponStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const columns = useMemo<Array<ColumnDef<Coupon>>>(
    () => [
      {
        accessorKey: "code",
        header: "Coupon",
        cell: ({ row }) => {
          const coupon = row.original;

          return (
            <div>
              <p className="font-medium">{coupon.code}</p>
              {coupon.description ? (
                <p className="text-muted mt-1 max-w-80 truncate text-sm">{coupon.description}</p>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "discount",
        header: "Discount",
        cell: ({ row }) => formatCouponDiscount(row.original),
      },
      {
        id: "validity",
        header: "Validity",
        cell: ({ row }) => formatCouponValidity(row.original),
      },
      {
        id: "usage",
        header: "Usage",
        cell: ({ row }) => formatCouponUsage(row.original),
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => <CouponStatusBadge active={row.original.active} />,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatCouponDate(row.original.createdAt),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const coupon = row.original;

          return (
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link params={{ couponId: coupon.id }} to="/coupons/$couponId">
                  <Eye className="size-4" />
                  View
                </Link>
              </Button>

              <Button asChild size="sm" variant="outline">
                <Link params={{ couponId: coupon.id }} to="/coupons/$couponId/edit">
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  useEffect(() => {
    void loadCoupons();
  }, [limit, page, submittedStatus]);

  async function loadCoupons() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const query = getCouponsQuery();
      const response = await couponsApi.list(query);
      setCoupons(response.data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to load coupons."));
    } finally {
      setIsLoading(false);
    }
  }

  function getCouponsQuery(): ListCouponsQuery {
    return {
      active: submittedStatus === "all" ? undefined : submittedStatus,
      limit,
      page,
    };
  }

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedStatus(status);
    setPage(1);
  }

  function handleResetFilters() {
    setStatus("all");
    setSubmittedStatus("all");
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal">Coupons</h2>
          <p className="text-muted mt-2 text-sm">
            Manage discount codes, validity windows, usage limits, and availability.
          </p>
        </div>

        <Button asChild>
          <Link to="/coupons/new">
            <Plus className="size-4" />
            Add Coupon
          </Link>
        </Button>
      </div>

      <form
        className="bg-surface flex flex-wrap items-end gap-4 rounded-lg border p-4 shadow-sm"
        onSubmit={handleSearch}
      >
        <div className="w-full sm:w-56">
          <Label htmlFor="coupon-status">Status</Label>
          <Select
            disabled={isLoading}
            onValueChange={(value) => setStatus(value as CouponStatusFilter)}
            value={status}
          >
            <SelectTrigger id="coupon-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button className="flex-1 sm:flex-none" disabled={isLoading} type="submit">
            Search
          </Button>
          <Button
            aria-label="Reset coupon filters"
            disabled={isLoading}
            onClick={handleResetFilters}
            type="button"
            variant="outline"
          >
            <FilterX className="size-4" />
            Clear
          </Button>
          <Button disabled={isLoading} onClick={loadCoupons} type="button" variant="outline">
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
        data={coupons.items}
        emptyMessage={isLoading ? "Loading coupons..." : "No coupons found."}
        loadingMessage="Loading coupons..."
        pagination={{
          isLoading,
          limit: coupons.limit,
          onPageChange: handlePageChange,
          page: coupons.page,
          rowsPerPage: {
            onLimitChange: handleLimitChange,
          },
          total: coupons.total,
        }}
        resultLabel="coupons"
      />
    </section>
  );
}
