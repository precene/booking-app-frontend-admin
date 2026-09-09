import type { SeatMapSnapshotPayload } from "../services/showtimeRealtime";
import type { ShowSeat, ShowSeatStatus } from "../types/showtimeTypes";

export type SeatCount = Record<ShowSeatStatus, number>;

export const initialSeatCount: SeatCount = {
  available: 0,
  booked: 0,
  cancelled: 0,
  held: 0,
  unavailable: 0,
};

const seatLabelCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

export function getShowSeatCount(seats: Array<ShowSeat>) {
  return seats.reduce<SeatCount>(
    (count, seat) => ({
      ...count,
      [seat.status]: count[seat.status] + 1,
    }),
    initialSeatCount,
  );
}

export function hasSeatPositions(seats: Array<ShowSeat>) {
  return seats.every(
    (seat) =>
      typeof seat.positionX === "number" &&
      seat.positionX > 0 &&
      typeof seat.positionY === "number" &&
      seat.positionY > 0,
  );
}

export function getSeatMapDimensions(seats: Array<ShowSeat>) {
  return {
    columns: Math.max(1, ...seats.map((seat) => seat.positionX ?? 1)),
    rows: Math.max(1, ...seats.map((seat) => seat.positionY ?? 1)),
  };
}

export function getAssignedSeatCategories(seats: Array<ShowSeat>) {
  const categoryById = new Map<string, { color: string; id: string; name: string }>();

  seats.forEach((seat) => {
    if (!seat.categoryId || !seat.categoryName || !seat.categoryColor) {
      return;
    }

    categoryById.set(seat.categoryId, {
      color: seat.categoryColor,
      id: seat.categoryId,
      name: seat.categoryName,
    });
  });

  return [...categoryById.values()].sort((firstCategory, secondCategory) =>
    firstCategory.name.localeCompare(secondCategory.name),
  );
}

export function getShowSeatByPosition(seats: Array<ShowSeat>) {
  return new Map(
    seats.flatMap((seat) =>
      typeof seat.positionX === "number" && typeof seat.positionY === "number"
        ? [[`${seat.positionX}:${seat.positionY}`, seat] as const]
        : [],
    ),
  );
}

export function mergeSeatSnapshot(
  currentSeats: Array<ShowSeat>,
  snapshotSeats: SeatMapSnapshotPayload["seats"],
) {
  const currentSeatById = new Map(currentSeats.map((seat) => [seat.id, seat]));

  return snapshotSeats.map((seat) => ({
    ...currentSeatById.get(seat.id),
    ...seat,
  }));
}

export function groupSeatsByRow(seats: Array<ShowSeat>) {
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
