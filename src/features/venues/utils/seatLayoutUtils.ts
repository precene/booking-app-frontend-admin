import type { SeatDefinitionPayload } from "../types/seatLayoutTypes";

export function generateSeatDefinitions(rows: number, seatsPerRow: number) {
  const seats: Array<SeatDefinitionPayload> = [];

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    const rowLabel = getRowLabel(rowIndex);

    for (let seatIndex = 1; seatIndex <= seatsPerRow; seatIndex += 1) {
      seats.push({
        positionX: seatIndex,
        positionY: rowIndex + 1,
        rowLabel,
        seatLabel: `${rowLabel}${seatIndex}`,
      });
    }
  }

  return seats;
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
