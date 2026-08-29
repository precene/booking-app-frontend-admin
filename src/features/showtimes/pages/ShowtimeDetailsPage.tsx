import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CalendarClock, RefreshCcw } from "lucide-react";

import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { Button } from "#/shared/components/ui/button";
import { cn } from "#/shared/utils/cn";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import { ShowtimeStatusBadge } from "../components/ShowtimeStatusBadge";
import { showtimesApi } from "../services/showtimesApi";
import type { ShowSeat, ShowSeatStatus, Showtime } from "../types/showtimeTypes";
import { formatShowtimeDateTime, formatShowtimeTime } from "../utils/showtimeFormatters";

type SeatCount = Record<ShowSeatStatus, number>;

const initialSeatCount: SeatCount = {
  available: 0,
  booked: 0,
  held: 0,
  unavailable: 0,
};

const seatStatusStyles: Record<ShowSeatStatus, string> = {
  available: "border-teal-200 bg-teal-50 text-teal-700",
  booked: "border-primary/30 bg-primary/10 text-primary",
  held: "border-amber-200 bg-amber-50 text-amber-700",
  unavailable: "border-border bg-surface-muted text-muted",
};

export default function ShowtimeDetailsPage() {
  const { showId } = useParams({ from: "/_protected/showtimes/$showId" });
  const [show, setShow] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<Array<ShowSeat>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const seatRows = useMemo(() => groupSeatsByRow(seats), [seats]);
  const seatCount = useMemo(
    () =>
      seats.reduce<SeatCount>(
        (count, seat) => ({
          ...count,
          [seat.status]: count[seat.status] + 1,
        }),
        initialSeatCount,
      ),
    [seats],
  );

  useEffect(() => {
    void loadSeatMap();
  }, [showId]);

  async function loadSeatMap() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await showtimesApi.getSeatMap(showId);
      setShow(response.data.show);
      setSeats(response.data.seats);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to load showtime booking seats."));
      setShow(null);
      setSeats([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button asChild aria-label="Back to showtimes" size="icon" variant="ghost">
              <Link to="/showtimes">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>

            <h2 className="text-3xl font-semibold tracking-normal">Showtime</h2>
          </div>

          <p className="text-muted mt-2 text-sm">
            View live booking seat status for this showtime.
          </p>
        </div>

        <Button disabled={isLoading} onClick={loadSeatMap} type="button" variant="outline">
          <RefreshCcw className="size-4" />
          Refresh
        </Button>
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {show ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-6">
            <div className="bg-surface min-w-0 rounded-lg border p-6 shadow-sm">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CalendarClock className="text-primary size-5" />
                    <h3 className="text-base font-semibold tracking-normal">{show.movie.title}</h3>
                  </div>
                  <p className="text-muted mt-2 text-sm">
                    {show.venue.name} / {show.screen.name}
                  </p>
                </div>

                <ShowtimeStatusBadge status={show.status} />
              </div>

              <dl className="grid gap-4 sm:grid-cols-3">
                <InfoItem
                  label="Start"
                  value={formatShowtimeDateTime(show.startsAt, show.venue.timezone)}
                />
                <InfoItem label="End" value={formatShowtimeTime(show.endsAt)} />
                <InfoItem label="Timezone" value={show.venue.timezone} />
              </dl>
            </div>

            <div className="bg-surface rounded-lg border p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-base font-semibold tracking-normal">Seat Map</h3>
                <p className="text-muted mt-1 text-sm">
                  {isLoading ? "Refreshing seats..." : "Current seat inventory by row."}
                </p>
              </div>

              <div className="max-w-full overflow-x-auto pb-2">
                <div className="flex w-max min-w-full flex-col gap-2">
                  {seatRows.map((row) => (
                    <div className="flex items-center gap-2" key={row.rowLabel}>
                      <span className="text-muted w-8 shrink-0 text-sm font-medium">
                        {row.rowLabel}
                      </span>
                      <div className="flex shrink-0 gap-2">
                        {row.seats.map((seat) => (
                          <span
                            className={cn(
                              "flex size-9 items-center justify-center rounded-md border text-xs font-semibold",
                              seatStatusStyles[seat.status],
                            )}
                            key={seat.id}
                            title={`${seat.seatLabel} - ${seat.status}`}
                          >
                            {seat.seatLabel}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-surface rounded-lg border p-6 shadow-sm">
              <h3 className="text-base font-semibold tracking-normal">Booking Seats</h3>

              <dl className="mt-5 grid gap-3">
                <InfoItem label="Available" value={String(seatCount.available)} />
                <InfoItem label="Held" value={String(seatCount.held)} />
                <InfoItem label="Booked" value={String(seatCount.booked)} />
                <InfoItem label="Unavailable" value={String(seatCount.unavailable)} />
                <InfoItem label="Total" value={String(seats.length)} />
              </dl>
            </div>
          </aside>
        </div>
      ) : (
        <div className="bg-surface rounded-lg border p-6 shadow-sm">
          <p className="text-muted text-sm font-medium">
            {isLoading ? "Loading showtime seats..." : "Showtime not found."}
          </p>
        </div>
      )}
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted text-xs font-medium uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

function groupSeatsByRow(seats: Array<ShowSeat>) {
  const rowMap = new Map<string, Array<ShowSeat>>();

  seats.forEach((seat) => {
    rowMap.set(seat.rowLabel, [...(rowMap.get(seat.rowLabel) ?? []), seat]);
  });

  return [...rowMap.entries()].map(([rowLabel, rowSeats]) => ({
    rowLabel,
    seats: rowSeats,
  }));
}
