import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Armchair,
  BookOpenCheck,
  CalendarClock,
  CreditCard,
  TicketCheck,
} from "lucide-react";

import { BookingStatusBadge } from "../components/BookingStatusBadge";
import { bookingsApi } from "../services/bookingsApi";
import type { BookingDetails } from "../types/bookingTypes";
import { formatBookingDate, formatBookingMoney } from "../utils/bookingFormatters";

import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { Button } from "#/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/shared/components/ui/table";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";

type BookingInfoItem = {
  label: string;
  value: string;
};

export default function BookingDetailsPage() {
  const { bookingId } = useParams({ from: "/_protected/bookings/$bookingId" });
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bookingInfo: Array<BookingInfoItem> = booking
    ? [
        { label: "Booking ID", value: booking.id },
        { label: "Customer", value: booking.customer?.fullName ?? booking.userId },
        { label: "Email", value: booking.customer?.email ?? "Not Set" },
        { label: "Movie", value: booking.show?.movieTitle ?? booking.showId },
        { label: "Venue", value: booking.show?.venueName ?? "Not Set" },
        { label: "Screen", value: booking.show?.screenName ?? "Not Set" },
        {
          label: "Show Time",
          value: booking.show?.startsAt ? formatBookingDate(booking.show.startsAt) : "Not Set",
        },
        { label: "Created", value: formatBookingDate(booking.createdAt) },
        { label: "Last Updated", value: formatBookingDate(booking.updatedAt) },
        { label: "Hold Expires", value: formatBookingDate(booking.holdExpiresAt) },
      ]
    : [];

  useEffect(() => {
    void loadBooking();
  }, [bookingId]);

  async function loadBooking() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await bookingsApi.get(bookingId);
      setBooking(response.data.booking);
    } catch (error) {
      setBooking(null);
      setErrorMessage(getApiErrorMessage(error, "Unable to load booking details."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <Button asChild aria-label="Back to bookings" size="icon" variant="ghost">
            <Link to="/bookings">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          <h2 className="text-2xl font-semibold tracking-normal">View Booking</h2>
        </div>

        <p className="text-muted mt-2 text-sm">
          View booking status, selected seats, totals, and ticket information.
        </p>
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="bg-surface rounded-lg border p-6 shadow-sm">
          <p className="text-muted text-sm font-medium">Loading booking details...</p>
        </div>
      ) : null}

      {booking ? (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
            <div className="bg-surface rounded-lg border p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-md">
                  <BookOpenCheck className="size-6" />
                </div>

                <BookingStatusBadge status={booking.status} />
              </div>

              <h3 className="mt-5 text-xl font-semibold tracking-normal">
                {booking.bookingReference}
              </h3>
              <p className="text-muted mt-2 text-sm">
                Total {formatBookingMoney(booking.totalMinor, booking.currency)}
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-surface rounded-lg border p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-primary size-5" />
                  <h3 className="text-base font-semibold tracking-normal">Payment Summary</h3>
                </div>

                <dl className="mt-4 grid gap-4">
                  <InfoItem
                    item={{
                      label: "Subtotal",
                      value: formatBookingMoney(booking.subtotalMinor, booking.currency),
                    }}
                  />
                  <InfoItem
                    item={{
                      label: "Fee",
                      value: formatBookingMoney(booking.feeMinor, booking.currency),
                    }}
                  />
                  <InfoItem
                    item={{
                      label: "Discount",
                      value: formatBookingMoney(booking.discountMinor, booking.currency),
                    }}
                  />
                  <InfoItem
                    item={{
                      label: "Total",
                      value: formatBookingMoney(booking.totalMinor, booking.currency),
                    }}
                  />
                  <InfoItem
                    item={{
                      label: "Promo Code ID",
                      value: booking.promoCodeId ?? "Not Set",
                    }}
                  />
                </dl>
              </div>

              <div className="bg-surface rounded-lg border p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <CalendarClock className="text-primary size-5" />
                  <h3 className="text-base font-semibold tracking-normal">Booking Information</h3>
                </div>

                <dl className="mt-4 grid gap-4">
                  {bookingInfo.map((item) => (
                    <InfoItem item={item} key={item.label} />
                  ))}
                </dl>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
            <div className="bg-surface rounded-lg border p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Armchair className="text-primary size-5" />
                <h3 className="text-base font-semibold tracking-normal">Selected Seats</h3>
              </div>

              <div className="mt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seat</TableHead>
                      <TableHead>Row</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {booking.seats.length ? (
                      booking.seats.map((seat) => (
                        <TableRow key={seat.id}>
                          <TableCell className="font-medium">{seat.seatLabel}</TableCell>
                          <TableCell>{seat.rowLabel}</TableCell>
                          <TableCell>
                            {formatBookingMoney(seat.priceMinor, booking.currency)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell className="text-muted h-24 text-center" colSpan={3}>
                          No seats found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="bg-surface rounded-lg border p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <TicketCheck className="text-primary size-5" />
                <h3 className="text-base font-semibold tracking-normal">Ticket</h3>
              </div>

              {booking.ticket ? (
                <dl className="mt-4 grid gap-4">
                  <InfoItem item={{ label: "Ticket ID", value: booking.ticket.id }} />
                  <InfoItem
                    item={{ label: "Issued At", value: formatBookingDate(booking.ticket.issuedAt) }}
                  />
                  <InfoItem item={{ label: "QR Code", value: booking.ticket.qrCode }} />
                </dl>
              ) : (
                <p className="text-muted mt-4 text-sm">No ticket issued.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function InfoItem({ item }: { item: BookingInfoItem }) {
  return (
    <div>
      <dt className="text-muted text-xs font-medium uppercase">{item.label}</dt>
      <dd className="mt-1 text-sm font-medium break-all">{item.value}</dd>
    </div>
  );
}
