export type SeatCategory = {
  color: string;
  createdAt: string;
  defaultPriceMinor: number;
  id: string;
  name: string;
  updatedAt: string;
  usageCount: number;
  venueId: null | string;
};

export type SeatCategoryPayload = {
  color?: string;
  defaultPriceMinor: number;
  name: string;
  venueId?: null | string;
};

export type SeatCategoryUpdatePayload = Partial<SeatCategoryPayload>;

export type ListSeatCategoriesQuery = {
  limit?: number;
  page?: number;
  q?: string;
  venueId?: string;
};
