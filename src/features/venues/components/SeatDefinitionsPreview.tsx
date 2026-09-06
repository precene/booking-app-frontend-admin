import { Armchair } from "lucide-react";

import type { SeatDefinition } from "../types/seatLayoutTypes";
import { getRowLabel, getSeatKey } from "../utils/seatLayoutUtils";

type SeatDefinitionsPreviewProps = {
  seats: Array<SeatDefinition>;
};

export function SeatDefinitionsPreview({ seats }: SeatDefinitionsPreviewProps) {
  if (!seats.length) {
    return (
      <div className="bg-surface-muted text-muted flex min-h-32 items-center justify-center rounded-md border px-6 text-center text-sm font-medium">
        No seat definitions added.
      </div>
    );
  }

  const columns = Math.max(...seats.map((seat) => seat.positionX));
  const rows = Math.max(...seats.map((seat) => seat.positionY));
  const seatByPosition = new Map(
    seats.map((seat) => [getSeatKey(seat.positionX, seat.positionY), seat]),
  );

  return (
    <div className="bg-surface-muted overflow-x-auto rounded-md border p-4">
      <p className="text-muted mb-2 text-center text-xs font-semibold uppercase">Screen</p>
      <div className="bg-foreground/80 mx-auto mb-4 h-2 w-48 rounded-full" />

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

              return (
                <div
                  className={
                    !seat
                      ? "border-border bg-surface text-muted flex size-9 items-center justify-center rounded border text-[0.625rem] font-semibold"
                      : seat.isActive
                        ? "flex size-9 flex-col items-center justify-center rounded border border-teal-200 bg-teal-50 text-[0.625rem] font-semibold leading-none text-teal-700"
                        : "flex size-9 flex-col items-center justify-center rounded border border-amber-300 bg-amber-100 text-[0.625rem] font-semibold leading-none text-amber-800"
                  }
                  key={getSeatKey(positionX, positionY)}
                  title={seat?.seatLabel ?? "Gap"}
                >
                  {seat ? (
                    <>
                      <Armchair aria-hidden="true" className="size-4" />
                      <span>{seat.seatLabel}</span>
                    </>
                  ) : null}
                </div>
              );
            }),
          ];
        })}
      </div>
    </div>
  );
}
