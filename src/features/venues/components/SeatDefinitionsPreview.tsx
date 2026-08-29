import type { SeatDefinition } from "../types/seatLayoutTypes";

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
  const sortedSeats = [...seats].sort((firstSeat, secondSeat) => {
    if (firstSeat.positionY !== secondSeat.positionY) {
      return firstSeat.positionY - secondSeat.positionY;
    }

    return firstSeat.positionX - secondSeat.positionX;
  });

  return (
    <div className="bg-surface-muted overflow-x-auto rounded-md border p-4">
      <div className="bg-foreground/80 mx-auto mb-4 h-2 w-48 rounded-full" />

      <div
        className="mx-auto grid w-max gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(1.75rem, 1.75rem))` }}
      >
        {sortedSeats.map((seat) => (
          <div
            className={
              seat.isActive
                ? "border-primary/30 bg-primary/10 text-primary flex size-7 items-center justify-center rounded text-[0.625rem] font-semibold"
                : "border-border bg-surface text-muted flex size-7 items-center justify-center rounded text-[0.625rem] font-semibold opacity-60"
            }
            key={seat.id}
            title={seat.seatLabel}
          >
            {seat.seatLabel}
          </div>
        ))}
      </div>

      <p className="text-muted mt-4 text-center text-xs font-medium">Screen</p>
    </div>
  );
}
