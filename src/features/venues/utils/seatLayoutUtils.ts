import type {
  SeatDefinition,
  SeatDefinitionPayload,
  SeatLayout,
  SeatLayoutCell,
} from "../types/seatLayoutTypes";

export type SeatLayoutConfig = {
  columns: number;
  disabledSeats: Array<string>;
  rows: number;
};

export function createSeatLayoutCells(rows: number, columns: number) {
  const seats: Array<SeatLayoutCell> = [];

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    for (let columnIndex = 1; columnIndex <= columns; columnIndex += 1) {
      seats.push({
        positionX: columnIndex,
        positionY: rowIndex + 1,
        status: "seat",
      });
    }
  }

  return seats;
}

export function getSeatDefinitions(seats: Array<SeatLayoutCell>) {
  return seats.map<SeatDefinitionPayload>((seat) => {
    const rowLabel = getRowLabel(seat.positionY - 1);

    return {
      positionX: seat.positionX,
      positionY: seat.positionY,
      rowLabel,
      seatLabel: `${rowLabel}${seat.positionX}`,
    };
  });
}

export function getSeatLayoutConfig(
  rows: number,
  columns: number,
  seats: Array<SeatLayoutCell>,
): SeatLayoutConfig {
  return {
    columns,
    disabledSeats: seats
      .filter((seat) => seat.status === "disabled")
      .map((seat) => getSeatKey(seat.positionX, seat.positionY)),
    rows,
  };
}

export function getSeatCellsFromLayout(layout: SeatLayout | null) {
  const rows = getLayoutRows(layout);
  const columns = getLayoutColumns(layout);
  const disabledSeatKeys = getDisabledSeatKeys(layout);

  if (!layout?.seatDefs?.length) {
    return createSeatLayoutCells(rows, columns);
  }

  return layout.seatDefs.map<SeatLayoutCell>((seat) => ({
    positionX: seat.positionX,
    positionY: seat.positionY,
    status:
      !seat.isActive || disabledSeatKeys.has(getSeatKey(seat.positionX, seat.positionY))
        ? "disabled"
        : "seat",
  }));
}

export function getSeatDefinitionsForDisplay(layout: SeatLayout | null) {
  const disabledSeatKeys = getDisabledSeatKeys(layout);

  return (layout?.seatDefs ?? []).map<SeatDefinition>((seat) => ({
    ...seat,
    isActive: seat.isActive && !disabledSeatKeys.has(getSeatKey(seat.positionX, seat.positionY)),
  }));
}

export function getSeatCount(seats: Array<SeatLayoutCell>) {
  return seats.length;
}

export function getLayoutRows(layout: SeatLayout | null) {
  const rows = getNumberConfigValue(layout, "rows");

  if (rows) return rows;

  return Math.max(1, ...(layout?.seatDefs ?? []).map((seat) => seat.positionY));
}

export function getLayoutColumns(layout: SeatLayout | null) {
  const columns =
    getNumberConfigValue(layout, "columns") ?? getNumberConfigValue(layout, "seatsPerRow");

  if (columns) return columns;

  return Math.max(1, ...(layout?.seatDefs ?? []).map((seat) => seat.positionX));
}

export function getSeatKey(positionX: number, positionY: number) {
  return `${positionX}:${positionY}`;
}

export function getRowLabel(index: number) {
  let label = "";
  let value = index;

  do {
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);

  return label;
}

function getDisabledSeatKeys(layout: SeatLayout | null) {
  const disabledSeats = Array.isArray(layout?.config.disabledSeats)
    ? layout.config.disabledSeats
    : [];

  return new Set(disabledSeats.filter((seat): seat is string => typeof seat === "string"));
}

function getNumberConfigValue(layout: SeatLayout | null, key: string) {
  const value = layout?.config[key];

  return typeof value === "number" ? value : null;
}
