import { useEffect, useState, type CSSProperties } from "react";
import { Armchair, Eraser, Grid2X2, MousePointer2, Tags } from "lucide-react";

import { Button } from "#/shared/components/ui/button";
import { Input } from "#/shared/components/ui/input";
import { Label } from "#/shared/components/ui/label";
import { cn } from "#/shared/utils/cn";
import type { SeatCategory } from "../types/seatCategoryTypes";
import type { ScreenType } from "../types/screenTypes";
import type { SeatLayoutCell, SeatLayoutCellStatus } from "../types/seatLayoutTypes";
import {
  createSeatLayoutCells,
  getRowLabel,
  getSeatLabel,
  getSeatCount,
  getSeatKey,
} from "../utils/seatLayoutUtils";

type SeatLayoutDesignerProps = {
  categories?: Array<SeatCategory>;
  columns: number;
  disabled?: boolean;
  onColumnsChange: (columns: number) => void;
  onRowsChange: (rows: number) => void;
  onSeatsChange: (seats: Array<SeatLayoutCell>) => void;
  rows: number;
  screenType?: ScreenType;
  seats: Array<SeatLayoutCell>;
};

const cellStatuses: Array<SeatLayoutCellStatus | "empty"> = ["seat", "empty", "disabled"];
const layoutMode = "layout";
const categoryMode = "category";

export function SeatLayoutDesigner({
  categories = [],
  columns,
  disabled = false,
  onColumnsChange,
  onRowsChange,
  onSeatsChange,
  rows,
  screenType = "flat",
  seats,
}: SeatLayoutDesignerProps) {
  const [mode, setMode] = useState<typeof categoryMode | typeof layoutMode>(layoutMode);
  const [columnsInput, setColumnsInput] = useState(String(columns));
  const [rowsInput, setRowsInput] = useState(String(rows));
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const hasCategories = categories.length > 0;
  const effectiveMode = hasCategories ? mode : layoutMode;
  const seatByPosition = new Map(
    seats.map((seat) => [getSeatKey(seat.positionX, seat.positionY), seat]),
  );
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const seatCount = getSeatCount(seats);
  const disabledSeatCount = seats.filter((seat) => seat.status === "disabled").length;

  useEffect(() => {
    setRowsInput(String(rows));
  }, [rows]);

  useEffect(() => {
    setColumnsInput(String(columns));
  }, [columns]);

  function handleRowsChange(value: string) {
    setRowsInput(value);
  }

  function handleColumnsChange(value: string) {
    setColumnsInput(value);
  }

  function normalizeRowsInput() {
    const normalizedRows = normalizeDimension(Number(rowsInput), 25);
    updateRows(normalizedRows);
    setRowsInput(String(normalizedRows));
  }

  function normalizeColumnsInput() {
    const normalizedColumns = normalizeDimension(Number(columnsInput), 25);
    updateColumns(normalizedColumns);
    setColumnsInput(String(normalizedColumns));
  }

  function updateRows(nextRows: number) {
    const normalizedRows = normalizeDimension(nextRows, 25);
    onRowsChange(normalizedRows);
    onSeatsChange(
      seats.filter((seat) => seat.positionY <= normalizedRows && seat.positionX <= columns),
    );
  }

  function updateColumns(nextColumns: number) {
    const normalizedColumns = normalizeDimension(nextColumns, 25);
    onColumnsChange(normalizedColumns);
    onSeatsChange(
      seats.filter((seat) => seat.positionY <= rows && seat.positionX <= normalizedColumns),
    );
  }

  function handleCellClick(positionX: number, positionY: number) {
    if (disabled) return;

    const seat = seatByPosition.get(getSeatKey(positionX, positionY));

    if (effectiveMode === categoryMode) {
      if (!seat) return;

      onSeatsChange(
        seats.map((item) =>
          item.positionX === positionX && item.positionY === positionY
            ? {
                ...item,
                categoryId: item.categoryId === selectedCategoryId ? null : selectedCategoryId,
              }
            : item,
        ),
      );
      return;
    }

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

  function selectCategory(categoryId: string | undefined) {
    setSelectedCategoryId(categoryId);
    setMode(categoryMode);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="layoutRows">Grid Rows</Label>
          <Input
            disabled={disabled}
            id="layoutRows"
            max={25}
            min={1}
            onBlur={normalizeRowsInput}
            onChange={(event) => handleRowsChange(event.target.value)}
            type="number"
            value={rowsInput}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="layoutColumns">Grid Columns</Label>
          <Input
            disabled={disabled}
            id="layoutColumns"
            max={25}
            min={1}
            onBlur={normalizeColumnsInput}
            onChange={(event) => handleColumnsChange(event.target.value)}
            type="number"
            value={columnsInput}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
          <LegendItem className="bg-teal-50 text-teal-700 ring-teal-200" label="Seat" />
          <LegendItem className="bg-surface text-muted ring-border" label="Gap" />
          <LegendItem className="bg-amber-100 ring-amber-300" label="Disabled" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            className={cn(
              effectiveMode === layoutMode &&
                "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
            disabled={disabled}
            onClick={() => setMode(layoutMode)}
            size="sm"
            type="button"
            variant={effectiveMode === layoutMode ? "default" : "outline"}
          >
            <MousePointer2 className="size-4" />
            Layout
          </Button>
          {hasCategories ? (
            <Button
              className={cn(
                effectiveMode === categoryMode &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
              disabled={disabled}
              onClick={() => setMode(categoryMode)}
              size="sm"
              type="button"
              variant={effectiveMode === categoryMode ? "default" : "outline"}
            >
              <Tags className="size-4" />
              Category
            </Button>
          ) : null}
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

      {hasCategories ? (
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => (
            <Button
              className={cn(
                selectedCategoryId === category.id &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
              disabled={disabled}
              key={category.id}
              onClick={() => selectCategory(category.id)}
              size="sm"
              type="button"
              variant={selectedCategoryId === category.id ? "default" : "outline"}
            >
              <span
                className="size-3 rounded-sm border"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="bg-surface-muted max-w-full overflow-x-auto rounded-md border p-4">
        <p className="text-muted mb-2 text-center text-xs font-semibold uppercase">Screen</p>
        <ScreenShape screenType={screenType} />

        <div
          className="mx-auto grid w-max gap-2"
          style={{ gridTemplateColumns: `2rem repeat(${columns}, minmax(2.25rem, 2.25rem))` }}
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
                const label = getSeatLabel(seats, positionX, positionY) || seat?.seatLabel;
                const category = seat?.categoryId ? categoryById.get(seat.categoryId) : null;

                return (
                  <button
                    aria-label={`${label || "Gap"} ${status}`}
                    className={cn(
                      "flex size-9 flex-col items-center justify-center rounded border text-[0.625rem] leading-none font-semibold transition-colors",
                      status === "seat" &&
                        "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100",
                      status === "disabled" &&
                        "border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200",
                      status === "empty" &&
                        "border-border bg-surface text-muted hover:bg-primary/5",
                    )}
                    disabled={disabled}
                    key={getSeatKey(positionX, positionY)}
                    onClick={() => handleCellClick(positionX, positionY)}
                    style={
                      status === "seat" && category
                        ? {
                            backgroundColor: category.color,
                            borderColor: category.color,
                            color: "#ffffff",
                          }
                        : undefined
                    }
                    type="button"
                  >
                    {status === "empty" ? null : (
                      <>
                        <Armchair aria-hidden="true" className="size-4" />
                        <span>{label}</span>
                      </>
                    )}
                  </button>
                );
              }),
            ];
          })}
        </div>

        <p className="text-muted mt-4 flex items-center justify-center gap-2 text-center text-xs font-medium">
          {effectiveMode === layoutMode ? (
            <MousePointer2 className="size-3" />
          ) : (
            <Tags className="size-3" />
          )}
          {effectiveMode === layoutMode
            ? "Click cells to cycle Seat, Gap, and Disabled Seat."
            : "Click seats to assign the selected category."}
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

function ScreenShape({ screenType }: { screenType: ScreenType }) {
  if (screenType === "curved") {
    return (
      <div className="mx-auto mb-4 h-7 w-56 overflow-hidden">
        <div className="border-foreground/80 h-14 w-full rounded-[50%] border-t-4" />
      </div>
    );
  }

  return <div className="bg-foreground/80 mx-auto mb-4 h-2 w-48 rounded-full" />;
}

type LegendItemProps = {
  className: string;
  label: string;
  style?: CSSProperties;
};

function LegendItem({ className, label, style }: LegendItemProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("size-3 rounded-sm ring-1", className)} style={style} />
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
