import { createFileRoute } from "@tanstack/react-router";

import BookingDetailsPage from "#/features/bookings/pages/BookingDetailsPage";

export const Route = createFileRoute("/_protected/bookings/$bookingId")({
  component: BookingDetailsPage,
});
