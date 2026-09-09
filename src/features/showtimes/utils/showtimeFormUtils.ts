import type { SeatCategory } from "#/features/venues/types/seatCategoryTypes";
import type { Venue } from "#/features/venues/types/venueTypes";
import type { ShowtimePayload } from "../types/showtimeTypes";
import { combineShowtimeDateTime } from "./showtimeFormatters";

export type ShowtimeFormValues = {
  date: string;
  movieId: string;
  priceOverrides: Record<string, string>;
  screenId: string;
  time: string;
  venueId: string;
};

export const initialShowtimeFormValues: ShowtimeFormValues = {
  date: "",
  movieId: "",
  priceOverrides: {},
  screenId: "",
  time: "",
  venueId: "",
};

export function getShowtimePayload(
  formValues: ShowtimeFormValues,
  venue: Venue,
  priceCategories: Array<SeatCategory> = [],
): ShowtimePayload {
  const priceOverrides = priceCategories
    .map((category) => {
      const value = formValues.priceOverrides[category.id];
      const amount = value === "" || value === undefined ? NaN : Number(value);
      const priceMinor = Number.isFinite(amount)
        ? Math.round(amount * 100)
        : category.defaultPriceMinor;

      return {
        categoryId: category.id,
        defaultPriceMinor: category.defaultPriceMinor,
        priceMinor,
      };
    })
    .filter((override) => override.priceMinor !== override.defaultPriceMinor)
    .map(({ categoryId, priceMinor }) => ({ categoryId, priceMinor }));

  return {
    movieId: formValues.movieId,
    ...(priceOverrides.length ? { priceOverrides } : {}),
    screenId: formValues.screenId,
    startsAt: combineShowtimeDateTime(formValues.date, formValues.time, venue.timezone) ?? "",
  };
}
