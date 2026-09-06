import type { Query } from "#/shared/types";

export type BookingStatus = "pending" | "paid" | "cancelled" | "refunded" | "failed" | "expired";

export type BookingSummary = {
  id: string;
  bookingReference: string;
  userId: string;
  showId: string;
  status: BookingStatus;
  subtotalMinor: number;
  feeMinor: number;
  discountMinor: number;
  promoCodeId: string | null;
  totalMinor: number;
  currency: string;
  holdExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: BookingCustomer;
  show?: BookingShow;
};

export type BookingCustomer = {
  id: string;
  fullName: string;
  email: string;
};

export type BookingShow = {
  id: string;
  startsAt: string;
  movieId: string;
  movieTitle: string;
  venueId: string;
  venueName: string;
  screenId: string;
  screenName: string;
};

export type BookingSeat = {
  id: string;
  seatLabel: string;
  rowLabel: string;
  priceMinor: number;
};

export type BookingTicket = {
  id: string;
  qrCode: string;
  issuedAt: string;
};

export type BookingDetails = BookingSummary & {
  seats: Array<BookingSeat>;
  ticket: BookingTicket | null;
};

export type ListBookingsQuery = Query & {
  limit?: number;
  page?: number;
  showId?: string;
  status?: BookingStatus;
  userId?: string;
};
