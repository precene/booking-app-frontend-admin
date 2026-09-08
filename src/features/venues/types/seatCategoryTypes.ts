export type SeatCategory = {
  color: string;
  createdAt: string;
  defaultPriceMinor: number;
  id: string;
  name: string;
  screenId: null | string;
  updatedAt: string;
  usageCount: number;
  venueId: null | string;
};

export type SeatCategoryPayload = {
  color?: string;
  defaultPriceMinor: number;
  name: string;
  screenId?: null | string;
  venueId?: null | string;
};

export type SeatCategoryUpdatePayload = Partial<SeatCategoryPayload>;

export type ListSeatCategoriesQuery = {
  limit?: number;
  page?: number;
  q?: string;
  screenId?: string;
  venueId?: string;
};
