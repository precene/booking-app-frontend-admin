import { Armchair } from "lucide-react";

import type { SeatCategory } from "../types/seatCategoryTypes";
import type { ScreenType } from "../types/screenTypes";
import type { SeatDefinition } from "../types/seatLayoutTypes";
import { getRowLabel, getSeatKey } from "../utils/seatLayoutUtils";

type SeatDefinitionsPreviewProps = {
  categories?: Array<SeatCategory>;
  screenType?: ScreenType;
  seats: Array<SeatDefinition>;
};

export function SeatDefinitionsPreview({
  categories = [],
  screenType = "flat",
  seats,
}: SeatDefinitionsPreviewProps) {
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
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const assignedCategoryIds = new Set(
    seats
      .map((seat) => seat.categoryId)
      .filter((categoryId): categoryId is string => Boolean(categoryId)),
  );
  const assignedCategories = categories.filter((category) => assignedCategoryIds.has(category.id));

  return (
    <div className="bg-surface-muted overflow-x-auto rounded-md border p-4">
      {assignedCategories.length ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {assignedCategories.map((category) => (
            <span
              className="bg-surface inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium"
              key={category.id}
            >
              <span
                className="size-3 rounded-sm border"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </span>
          ))}
        </div>
      ) : null}

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
              const category = seat?.categoryId ? categoryById.get(seat.categoryId) : null;

              return (
                <div
                  className={
                    !seat
                      ? "border-border bg-surface text-muted flex size-9 items-center justify-center rounded border text-[0.625rem] font-semibold"
                      : seat.isActive
                        ? "flex size-9 flex-col items-center justify-center rounded border border-teal-200 bg-teal-50 text-[0.625rem] leading-none font-semibold text-teal-700"
                        : "flex size-9 flex-col items-center justify-center rounded border border-amber-300 bg-amber-100 text-[0.625rem] leading-none font-semibold text-amber-800"
                  }
                  key={getSeatKey(positionX, positionY)}
                  style={
                    seat?.isActive && category
                      ? {
                          backgroundColor: category.color,
                          borderColor: category.color,
                          color: "#ffffff",
                        }
                      : undefined
                  }
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
