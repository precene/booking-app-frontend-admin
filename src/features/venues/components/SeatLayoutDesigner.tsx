import { Eraser, Grid2X2, MousePointer2 } from "lucide-react";

import { Button } from "#/shared/components/ui/button";
import { Input } from "#/shared/components/ui/input";
import { Label } from "#/shared/components/ui/label";
import { cn } from "#/shared/utils/cn";
import type { SeatLayoutCell, SeatLayoutCellStatus } from "../types/seatLayoutTypes";
import {
  createSeatLayoutCells,
  getRowLabel,
  getSeatCount,
  getSeatKey,
} from "../utils/seatLayoutUtils";

type SeatLayoutDesignerProps = {
  columns: number;
  disabled?: boolean;
  onColumnsChange: (columns: number) => void;
  onRowsChange: (rows: number) => void;
  onSeatsChange: (seats: Array<SeatLayoutCell>) => void;
  rows: number;
  seats: Array<SeatLayoutCell>;
};

const cellStatuses: Array<SeatLayoutCellStatus | "empty"> = ["empty", "seat", "disabled"];

export function SeatLayoutDesigner({
  columns,
  disabled = false,
  onColumnsChange,
  onRowsChange,
  onSeatsChange,
  rows,
  seats,
}: SeatLayoutDesignerProps) {
  const seatByPosition = new Map(
    seats.map((seat) => [getSeatKey(seat.positionX, seat.positionY), seat]),
  );
  const seatCount = getSeatCount(seats);
  const disabledSeatCount = seats.filter((seat) => seat.status === "disabled").length;

  function updateRows(nextRows: number) {
    const normalizedRows = normalizeDimension(nextRows, 40);
    onRowsChange(normalizedRows);
    onSeatsChange(
      seats.filter((seat) => seat.positionY <= normalizedRows && seat.positionX <= columns),
    );
  }

  function updateColumns(nextColumns: number) {
    const normalizedColumns = normalizeDimension(nextColumns, 50);
    onColumnsChange(normalizedColumns);
    onSeatsChange(
      seats.filter((seat) => seat.positionY <= rows && seat.positionX <= normalizedColumns),
    );
  }

  function handleCellClick(positionX: number, positionY: number) {
    if (disabled) return;

    const seat = seatByPosition.get(getSeatKey(positionX, positionY));
    const currentStatus = seat?.status ?? "empty";
    const nextStatus = getNextStatus(currentStatus);

    if (nextStatus === "empty") {
      onSeatsChange(
        seats.filter((item) => item.positionX !== positionX || item.positionY !== positionY),
      );
      return;
    }

    if (seat) {
      onSeatsChange(
        seats.map((item) =>
          item.positionX === positionX && item.positionY === positionY
            ? { ...item, status: nextStatus }
            : item,
        ),
      );
      return;
    }

    onSeatsChange([...seats, { positionX, positionY, status: nextStatus }]);
  }

  function fillAllSeats() {
    onSeatsChange(createSeatLayoutCells(rows, columns));
  }

  function clearSeats() {
    onSeatsChange([]);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="layoutRows">Grid Rows</Label>
          <Input
            disabled={disabled}
            id="layoutRows"
            max={40}
            min={1}
            onChange={(event) => updateRows(Number(event.target.value))}
            type="number"
            value={rows}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="layoutColumns">Grid Columns</Label>
          <Input
            disabled={disabled}
            id="layoutColumns"
            max={50}
            min={1}
            onChange={(event) => updateColumns(Number(event.target.value))}
            type="number"
            value={columns}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
          <LegendItem className="bg-primary/10 ring-primary/30" label="Seat" />
          <LegendItem className="bg-surface text-muted ring-border" label="Gap" />
          <LegendItem className="bg-amber-100 ring-amber-300" label="Disabled" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={disabled}
            onClick={fillAllSeats}
            size="sm"
            type="button"
            variant="outline"
          >
            <Grid2X2 className="size-4" />
            Fill
          </Button>
          <Button
            disabled={disabled}
            onClick={clearSeats}
            size="sm"
            type="button"
            variant="outline"
          >
            <Eraser className="size-4" />
            Clear
          </Button>
        </div>
      </div>

      <div className="bg-surface-muted overflow-x-auto rounded-md border p-4">
        <p className="text-muted mb-2 text-center text-xs font-semibold uppercase">Screen</p>
        <div className="bg-foreground/80 mx-auto mb-4 h-2 w-48 rounded-full" />

        <div
          className="mx-auto grid w-max gap-2"
          style={{ gridTemplateColumns: `2rem repeat(${columns}, minmax(1.75rem, 1.75rem))` }}
        >
          {Array.from({ length: rows }).flatMap((_row, rowIndex) => {
            const positionY = rowIndex + 1;

            return [
              <div
                className="text-muted flex size-7 items-center justify-center text-xs font-semibold"
                key={`row-${positionY}`}
              >
                {getRowLabel(rowIndex)}
              </div>,
              ...Array.from({ length: columns }).map((_column, columnIndex) => {
                const positionX = columnIndex + 1;
                const seat = seatByPosition.get(getSeatKey(positionX, positionY));
                const status = seat?.status ?? "empty";
                const label = `${getRowLabel(rowIndex)}${positionX}`;

                return (
                  <button
                    aria-label={`${label} ${status}`}
                    className={cn(
                      "flex size-7 items-center justify-center rounded border text-[0.625rem] font-semibold transition-colors",
                      status === "seat" &&
                        "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20",
                      status === "disabled" &&
                        "border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200",
                      status === "empty" &&
                        "border-border bg-surface text-muted hover:bg-primary/5",
                    )}
                    disabled={disabled}
                    key={getSeatKey(positionX, positionY)}
                    onClick={() => handleCellClick(positionX, positionY)}
                    type="button"
                  >
                    {status === "empty" ? "" : label}
                  </button>
                );
              }),
            ];
          })}
        </div>

        <p className="text-muted mt-4 flex items-center justify-center gap-2 text-center text-xs font-medium">
          <MousePointer2 className="size-3" />
          Click Cells to Cycle Gap, Seat, and Disabled Seat.
        </p>
      </div>

      <div className="text-muted flex flex-wrap gap-4 text-sm font-medium">
        <span>{seatCount} Physical Seats</span>
        <span>{seatCount - disabledSeatCount} Bookable</span>
        <span>{disabledSeatCount} Disabled</span>
      </div>
    </div>
  );
}

type LegendItemProps = {
  className: string;
  label: string;
};

function LegendItem({ className, label }: LegendItemProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("size-3 rounded-sm ring-1", className)} />
      {label}
    </span>
  );
}

function getNextStatus(status: SeatLayoutCellStatus | "empty") {
  const nextIndex = (cellStatuses.indexOf(status) + 1) % cellStatuses.length;

  return cellStatuses[nextIndex]!;
}

function normalizeDimension(value: number, max: number) {
  if (!Number.isFinite(value)) return 1;

  return Math.min(max, Math.max(1, value));
}
