import type { SeatCategory } from "../types/seatCategoryTypes";
import type { SeatLayoutCell } from "../types/seatLayoutTypes";

export type SeatCategoryFormResult =
  | {
      data: {
        defaultPriceMinor: number;
        name: string;
      };
      success: true;
    }
  | {
      error: string;
      success: false;
    };

export function getSeatCategoryFormData(name: string, price: string): SeatCategoryFormResult {
  const trimmedName = name.trim();
  const amount = Number(price);

  if (!trimmedName) {
    return {
      error: "Category name is required.",
      success: false,
    };
  }

  if (!Number.isFinite(amount) || amount < 1) {
    return {
      error: "Default price must be at least £1.",
      success: false,
    };
  }

  return {
    data: {
      defaultPriceMinor: Math.round(amount * 100),
      name: trimmedName,
    },
    success: true,
  };
}

export function isSeatCategoryAssigned(
  category: Pick<SeatCategory, "id" | "usageCount">,
  assignedCategoryIds: Array<string>,
) {
  return category.usageCount > 0 || assignedCategoryIds.includes(category.id);
}

export function assignSeatCategory(
  seats: Array<SeatLayoutCell>,
  positionX: number,
  positionY: number,
  selectedCategoryId: string | undefined,
) {
  return seats.map((seat) =>
    seat.positionX === positionX && seat.positionY === positionY
      ? {
          ...seat,
          categoryId: seat.categoryId === selectedCategoryId ? null : selectedCategoryId,
        }
      : seat,
  );
}
