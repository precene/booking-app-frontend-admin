import { generateSeatDefinitions } from "../utils/seatLayoutUtils";

type SeatLayoutPreviewProps = {
  rows: number;
  seatsPerRow: number;
};

export function SeatLayoutPreview({ rows, seatsPerRow }: SeatLayoutPreviewProps) {
  const seats = generateSeatDefinitions(rows, seatsPerRow);

  return (
    <div className="bg-surface-muted overflow-x-auto rounded-md border p-4">
      <div className="bg-foreground/80 mx-auto mb-4 h-2 w-48 rounded-full" />

      <div
        className="mx-auto grid w-max gap-2"
        style={{ gridTemplateColumns: `repeat(${seatsPerRow}, minmax(1.75rem, 1.75rem))` }}
      >
        {seats.map((seat) => (
          <div
            className="border-primary/30 bg-primary/10 text-primary flex size-7 items-center justify-center rounded text-[0.625rem] font-semibold"
            key={seat.seatLabel}
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
