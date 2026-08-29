export type ShowStatus = "cancelled" | "completed" | "live" | "scheduled";
export type ShowSeatStatus = "available" | "booked" | "held" | "unavailable";

export type ShowSeatSummary = {
  available: number;
  total: number;
};

export type ShowSeatCategorySummary = {
  available: number;
  categoryId: null | string;
  categoryName: null | string;
  priceMinor: number;
  total: number;
};

export type ShowtimeListItem = {
  endsAt: string;
  id: string;
  movie: {
    id: string;
    title: string;
  };
  screen: {
    id: string;
    name: string;
  };
  seatSummary: ShowSeatSummary;
  startsAt: string;
  status: ShowStatus;
  venue: {
    id: string;
    name: string;
  };
};

export type Showtime = ShowtimeListItem & {
  byCategory: Array<ShowSeatCategorySummary>;
  createdAt: string;
  movie: {
    durationMinutes: number;
    id: string;
    title: string;
  };
  updatedAt: string;
  venue: {
    city: {
      id: string;
      name: string;
    };
    id: string;
    name: string;
    timezone: string;
  };
};

export type ShowtimePayload = {
  movieId: string;
  priceOverrides?: Array<{
    categoryId: string;
    priceMinor: number;
  }>;
  screenId: string;
  startsAt: string;
};

export type ShowtimeUpdatePayload = {
  movieId?: string;
  startsAt?: string;
  status?: Exclude<ShowStatus, "cancelled">;
};

export type ListShowtimesQuery = {
  from?: string;
  limit?: number;
  movieId?: string;
  page?: number;
  screenId?: string;
  status?: ShowStatus;
  to?: string;
  venueId?: string;
};

export type ShowSeat = {
  categoryId: null | string;
  categoryName: null | string;
  id: string;
  priceMinor: number;
  rowLabel: string;
  seatLabel: string;
  status: ShowSeatStatus;
};

export type ShowtimeSeatMap = {
  seats: Array<ShowSeat>;
  show: Showtime;
};
