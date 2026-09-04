import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CalendarRange,
  Pencil,
  Percent,
  TicketPercent,
} from "lucide-react";

import { CouponStatusBadge } from "../components/CouponStatusBadge";
import { couponsApi } from "../services/couponsApi";
import type { Coupon } from "../types/couponTypes";
import {
  formatCouponDate,
  formatCouponDiscount,
  formatCouponUsage,
  formatCouponValidity,
} from "../utils/couponFormatters";

import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { Button } from "#/shared/components/ui/button";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

type CouponInfoItem = {
  label: string;
  value: string;
};

export default function CouponDetailsPage() {
  const { couponId } = useParams({ from: "/_protected/coupons/$couponId" });
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const couponInfo: Array<CouponInfoItem> = coupon
    ? [
        {
          label: "Discount",
          value: formatCouponDiscount(coupon),
        },
        {
          label: "Usage",
          value: formatCouponUsage(coupon),
        },
        {
          label: "Validity",
          value: formatCouponValidity(coupon),
        },
        {
          label: "Created",
          value: formatCouponDate(coupon.createdAt),
        },
        {
          label: "Last Updated",
          value: formatCouponDate(coupon.updatedAt),
        },
      ]
    : [];

  useEffect(() => {
    void loadCoupon();
  }, [couponId]);

  async function loadCoupon() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await couponsApi.get(couponId);
      setCoupon(response.data.promo);
    } catch (error) {
      setCoupon(null);
      setErrorMessage(getApiErrorMessage(error, "Unable to load coupon details."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button asChild aria-label="Back to coupons" size="icon" variant="ghost">
              <Link to="/coupons">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>

            <h2 className="text-2xl font-semibold tracking-normal">View Coupon</h2>
          </div>

          <p className="text-muted mt-2 text-sm">
            View discount rules, validity, usage limits, and availability.
          </p>
        </div>

        {coupon ? (
          <Button asChild type="button">
            <Link params={{ couponId: coupon.id }} to="/coupons/$couponId/edit">
              <Pencil className="size-4" />
              Edit
            </Link>
          </Button>
        ) : null}
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="bg-surface rounded-lg border p-6 shadow-sm">
          <p className="text-muted text-sm font-medium">Loading Coupon Details...</p>
        </div>
      ) : null}

      {coupon ? (
        <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
          <div className="bg-surface rounded-lg border p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-md">
                <TicketPercent className="size-6" />
              </div>

              <CouponStatusBadge active={coupon.active} />
            </div>

            <h3 className="mt-5 text-xl font-semibold tracking-normal">{coupon.code}</h3>
            <p className="text-muted mt-2 text-sm">{coupon.description ?? "No Description"}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-surface rounded-lg border p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Percent className="text-primary size-5" />
                <h3 className="text-base font-semibold tracking-normal">Discount Rule</h3>
              </div>

              <dl className="mt-4 grid gap-4">
                {couponInfo.slice(0, 2).map((item) => (
                  <InfoItem item={item} key={item.label} />
                ))}
              </dl>
            </div>

            <div className="bg-surface rounded-lg border p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <CalendarRange className="text-primary size-5" />
                <h3 className="text-base font-semibold tracking-normal">Coupon Information</h3>
              </div>

              <dl className="mt-4 grid gap-4">
                {couponInfo.slice(2).map((item) => (
                  <InfoItem item={item} key={item.label} />
                ))}
              </dl>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function InfoItem({ item }: { item: CouponInfoItem }) {
  return (
    <div>
      <dt className="text-muted text-xs font-medium uppercase">{item.label}</dt>
      <dd className="mt-1 text-sm font-medium">{item.value}</dd>
    </div>
  );
}
