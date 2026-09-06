import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CalendarClock, RefreshCcw } from "lucide-react";

import { Alert, AlertDescription } from "#/shared/components/ui/alert";
import { Button } from "#/shared/components/ui/button";
import { cn } from "#/shared/utils/cn";
import { getApiErrorMessage } from "#/shared/utils/getApiErrorMessage";
import { seatLayoutsApi } from "#/features/venues/services/seatLayoutsApi";
import type { SeatDefinition, SeatLayout } from "#/features/venues/types/seatLayoutTypes";
import {
  getLayoutColumns,
  getLayoutRows,
  getRowLabel,
  getSeatKey,
} from "#/features/venues/utils/seatLayoutUtils";
import { ShowtimeStatusBadge } from "../components/ShowtimeStatusBadge";
import {
  createShowtimeSocket,
  showtimeSocketEvents,
  type SeatMapSnapshotPayload,
  type SeatStateChangePayload,
  type ShowStatusChangePayload,
} from "../services/showtimeRealtime";
import { showtimesApi } from "../services/showtimesApi";
import type { ShowSeat, ShowSeatStatus, Showtime, ShowStatus } from "../types/showtimeTypes";
import { formatShowtimeDateTime, formatShowtimeTime } from "../utils/showtimeFormatters";

type SeatCount = Record<ShowSeatStatus, number>;

const initialSeatCount: SeatCount = {
  available: 0,
  booked: 0,
  cancelled: 0,
  held: 0,
  unavailable: 0,
};

const seatStatusStyles: Record<ShowSeatStatus, string> = {
  available: "border-teal-200 bg-teal-50 text-teal-700",
  booked: "border-primary/30 bg-primary/10 text-primary",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  held: "border-amber-200 bg-amber-50 text-amber-700",
  unavailable: "border-border bg-surface-muted text-muted",
};

const seatStatusLabels: Record<ShowSeatStatus, string> = {
  available: "Available",
  booked: "Booked",
  cancelled: "Cancelled",
  held: "Held",
  unavailable: "Unavailable",
};

const seatLabelCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

export default function ShowtimeDetailsPage() {
  const { showId } = useParams({ from: "/_protected/showtimes/$showId" });
  const [show, setShow] = useState<Showtime | null>(null);
  const [seatLayout, setSeatLayout] = useState<SeatLayout | null>(null);
  const [seats, setSeats] = useState<Array<ShowSeat>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socketStatus, setSocketStatus] = useState<"connected" | "connecting" | "disconnected">(
    "connecting",
  );
  const [lastLiveUpdate, setLastLiveUpdate] = useState<string | null>(null);
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

  useEffect(() => {
    const socket = createShowtimeSocket();

    function joinShowRoom() {
      setSocketStatus("connected");
      socket.emit("join_show", showId);
      socket.emit(showtimeSocketEvents.requestSeatMap, showId);
    }

    function handleSnapshot(payload: SeatMapSnapshotPayload) {
      if (payload.showId !== showId) {
        return;
      }

      setSeats((currentSeats) => mergeSeatSnapshot(currentSeats, payload.seats));
      setLastLiveUpdate(new Date().toISOString());
    }

    function handleSeatHeld(payload: SeatStateChangePayload) {
      updateSeatStatusFromSocket(payload, "held");
    }

    function handleSeatReleased(payload: SeatStateChangePayload) {
      updateSeatStatusFromSocket(payload, "available");
    }

    function handleSeatBooked(payload: SeatStateChangePayload) {
      updateSeatStatusFromSocket(payload, "booked");
    }

    function handleSeatCancelled(payload: SeatStateChangePayload) {
      updateSeatStatusFromSocket(payload, "cancelled");
    }

    function handleSeatBlocked(payload: SeatStateChangePayload) {
      updateSeatStatusFromSocket(payload, "unavailable");
    }

    function handleSeatUnblocked(payload: SeatStateChangePayload) {
      updateSeatStatusFromSocket(payload, "available");
    }

    function handleShowStatusChanged(payload: ShowStatusChangePayload) {
      if (payload.showId !== showId) {
        return;
      }

      setShow((currentShow) =>
        currentShow ? { ...currentShow, status: payload.status as ShowStatus } : currentShow,
      );
      setLastLiveUpdate(payload.timestamp);
    }

    function handleConnectionError() {
      setSocketStatus("disconnected");
    }

    function updateSeatStatusFromSocket(payload: SeatStateChangePayload, status: ShowSeatStatus) {
      if (payload.showId !== showId) {
        return;
      }

      setSeats((currentSeats) =>
        currentSeats.map((seat) => (seat.id === payload.seatId ? { ...seat, status } : seat)),
      );
      setLastLiveUpdate(payload.timestamp);
    }

    setSocketStatus("connecting");
    socket.on("connect", joinShowRoom);
    socket.on("connect_error", handleConnectionError);
    socket.on("disconnect", handleConnectionError);
    socket.on(showtimeSocketEvents.seatMapSnapshot, handleSnapshot);
    socket.on(showtimeSocketEvents.seatHeld, handleSeatHeld);
    socket.on(showtimeSocketEvents.seatReleased, handleSeatReleased);
    socket.on(showtimeSocketEvents.seatBooked, handleSeatBooked);
    socket.on(showtimeSocketEvents.seatCancelled, handleSeatCancelled);
    socket.on(showtimeSocketEvents.seatBlocked, handleSeatBlocked);
    socket.on(showtimeSocketEvents.seatUnblocked, handleSeatUnblocked);
    socket.on(showtimeSocketEvents.showStatusChanged, handleShowStatusChanged);
    socket.connect();

    return () => {
      socket.emit("leave_show", showId);
      socket.disconnect();
    };
  }, [showId]);

  async function loadSeatMap() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await showtimesApi.getSeatMap(showId);
      setShow(response.data.show);
      setSeats(response.data.seats);
      await loadSeatLayout(response.data.show.screen.id);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to load showtime booking seats."));
      setShow(null);
      setSeatLayout(null);
      setSeats([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadSeatLayout(screenId: string) {
    try {
      const layoutsResponse = await seatLayoutsApi.list({ screenId });
      const activeLayout = layoutsResponse.data.layouts.find((layout) => layout.isActive);

      if (!activeLayout) {
        setSeatLayout(null);
        return;
      }

      const layoutResponse = await seatLayoutsApi.get(activeLayout.id);
      setSeatLayout(layoutResponse.data.layout);
    } catch {
      setSeatLayout(null);
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold tracking-normal">Seat Map</h3>
                    <p className="text-muted mt-1 text-sm">
                      {isLoading
                        ? "Refreshing Seats..."
                        : "Live Seat Inventory By Row For This Showtime."}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                        socketStatus === "connected" && "bg-teal-50 text-teal-700 ring-teal-200",
                        socketStatus === "connecting" &&
                          "bg-amber-50 text-amber-700 ring-amber-200",
                        socketStatus === "disconnected" &&
                          "bg-surface-muted text-muted ring-border",
                      )}
                    >
                      {socketStatus === "connected" ? "Live" : null}
                      {socketStatus === "connecting" ? "Connecting" : null}
                      {socketStatus === "disconnected" ? "Disconnected" : null}
                    </span>
                    {lastLiveUpdate ? (
                      <span className="text-muted text-xs">
                        Updated {formatShowtimeDateTime(lastLiveUpdate)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <SeatMapGrid layout={seatLayout} seatRows={seatRows} seats={seats} />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-surface rounded-lg border p-6 shadow-sm">
              <h3 className="text-base font-semibold tracking-normal">Booking Seats</h3>

              <dl className="mt-5 grid gap-3">
                <InfoItem label="Available" value={String(seatCount.available)} />
                <InfoItem label="Held" value={String(seatCount.held)} />
                <InfoItem label="Booked" value={String(seatCount.booked)} />
                <InfoItem label="Cancelled" value={String(seatCount.cancelled)} />
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

function SeatMapGrid({
  layout,
  seatRows,
  seats,
}: {
  layout: SeatLayout | null;
  seatRows: Array<{ rowLabel: string; seats: Array<ShowSeat> }>;
  seats: Array<ShowSeat>;
}) {
  if (!seats.length) {
    return (
      <div className="bg-surface-muted text-muted flex min-h-32 items-center justify-center rounded-md border px-6 text-center text-sm font-medium">
        No Seats Found.
      </div>
    );
  }

  if (!layout?.seatDefs?.length) {
    return (
      <div className="max-w-full overflow-x-auto pb-2">
        <div className="flex w-max min-w-full flex-col gap-2">
          {seatRows.map((row) => (
            <div className="flex items-center gap-2" key={row.rowLabel}>
              <span className="text-muted w-8 shrink-0 text-sm font-medium">{row.rowLabel}</span>
              <div className="flex shrink-0 gap-2">
                {row.seats.map((seat) => (
                  <SeatCell key={seat.id} seat={seat} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const columns = getLayoutColumns(layout);
  const rows = getLayoutRows(layout);
  const layoutSeatByPosition = new Map(
    layout.seatDefs.map((seat) => [getSeatKey(seat.positionX, seat.positionY), seat]),
  );
  const showSeatByLayoutSeat = new Map(
    seats.map((seat) => [getShowSeatLookupKey(seat.rowLabel, seat.seatLabel), seat]),
  );

  return (
    <div className="max-w-full overflow-x-auto pb-2">
      <div className="bg-surface-muted w-max min-w-full rounded-md border p-4">
        <p className="text-muted mb-2 text-center text-xs font-semibold uppercase">Screen</p>
        <div className="bg-foreground/80 mx-auto mb-5 h-2 w-48 rounded-full" />

        <div
          className="mx-auto grid w-max gap-2"
          style={{ gridTemplateColumns: `2rem repeat(${columns}, minmax(2.25rem, 2.25rem))` }}
        >
          {Array.from({ length: rows }).flatMap((_row, rowIndex) => {
            const positionY = rowIndex + 1;

            return [
              <div
                className="text-muted flex size-9 items-center justify-center text-sm font-medium"
                key={`row-${positionY}`}
              >
                {getRowLabel(positionY - 1)}
              </div>,
              ...Array.from({ length: columns }).map((_column, columnIndex) => {
                const positionX = columnIndex + 1;
                const layoutSeat = layoutSeatByPosition.get(getSeatKey(positionX, positionY));

                if (!layoutSeat) {
                  return (
                    <span
                      aria-label="Gap"
                      className="border-border bg-surface flex size-9 items-center justify-center rounded-md border"
                      key={getSeatKey(positionX, positionY)}
                      title="Gap"
                    />
                  );
                }

                const seat = showSeatByLayoutSeat.get(
                  getShowSeatLookupKey(layoutSeat.rowLabel, layoutSeat.seatLabel),
                );

                return seat ? (
                  <SeatCell key={seat.id} seat={seat} />
                ) : (
                  <LayoutOnlySeatCell key={getSeatKey(positionX, positionY)} seat={layoutSeat} />
                );
              }),
            ];
          })}
        </div>
      </div>
    </div>
  );
}

function SeatCell({ seat }: { seat: ShowSeat }) {
  return (
    <span
      className={cn(
        "flex size-9 items-center justify-center rounded-md border text-xs font-semibold",
        seatStatusStyles[seat.status],
      )}
      title={`${seat.seatLabel} - ${seatStatusLabels[seat.status]}`}
    >
      {seat.seatLabel}
    </span>
  );
}

function LayoutOnlySeatCell({ seat }: { seat: SeatDefinition }) {
  return (
    <span
      className="flex size-9 items-center justify-center rounded-md border border-amber-300 bg-amber-100 text-xs font-semibold text-amber-800"
      title={`${seat.seatLabel} - Disabled`}
    >
      {seat.seatLabel}
    </span>
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

function mergeSeatSnapshot(
  currentSeats: Array<ShowSeat>,
  snapshotSeats: SeatMapSnapshotPayload["seats"],
) {
  const currentSeatById = new Map(currentSeats.map((seat) => [seat.id, seat]));

  return snapshotSeats.map((seat) => ({
    ...currentSeatById.get(seat.id),
    ...seat,
  }));
}

function groupSeatsByRow(seats: Array<ShowSeat>) {
  const rowMap = new Map<string, Array<ShowSeat>>();

  seats.forEach((seat) => {
    rowMap.set(seat.rowLabel, [...(rowMap.get(seat.rowLabel) ?? []), seat]);
  });

  return [...rowMap.entries()]
    .sort(([firstRowLabel], [secondRowLabel]) =>
      seatLabelCollator.compare(firstRowLabel, secondRowLabel),
    )
    .map(([rowLabel, rowSeats]) => ({
      rowLabel,
      seats: rowSeats.sort((firstSeat, secondSeat) =>
        seatLabelCollator.compare(firstSeat.seatLabel, secondSeat.seatLabel),
      ),
    }));
}

function getShowSeatLookupKey(rowLabel: string, seatLabel: string) {
  return `${rowLabel}:${seatLabel}`;
}
