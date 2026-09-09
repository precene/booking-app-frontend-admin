import type { Screen } from "../types/screenTypes";
import type { SeatLayout } from "../types/seatLayoutTypes";
import {
  getLayoutColumns,
  getLayoutRows,
  getSeatCellsFromLayout,
} from "./seatLayoutUtils";

export function getScreenSeatFormValues(screen: Screen, layout: SeatLayout | null) {
  const seats = getSeatCellsFromLayout(layout);

  return {
    active: screen.active,
    layoutName: layout?.name ?? "Default Layout",
    name: screen.name,
    rows: getLayoutRows(layout),
    columns: getLayoutColumns(layout),
    screenType: screen.screenType,
    seats,
    sortOrder: screen.sortOrder,
  };
}
