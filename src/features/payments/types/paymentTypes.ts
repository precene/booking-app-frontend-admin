import type { Query } from "#/shared/types";

export type PaymentStatus =
  | "pending"
  | "succeeded"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type AdminPayment = {
  id: string;
  bookingId: string;
  amountMinor: number;
  currency: string;
  status: PaymentStatus;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  receiptUrl: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  createdAt: string;
  updatedAt: string;
  booking: {
    reference: string;
    status: string;
    totalMinor: number;
    createdAt: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
  };
};

export type ListPaymentsQuery = Query & {
  limit?: number;
  page?: number;
  q?: string;
  status?: PaymentStatus;
};

export type RefundReason = "requested" | "cancelled_by_venue" | "policy" | "duplicate" | "other";

export type CreateRefundPayload = {
  reason: RefundReason;
};
