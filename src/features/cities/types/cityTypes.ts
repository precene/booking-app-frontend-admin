export type City = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CityPayload = {
  name: string;
  slug?: string;
  active?: boolean;
};

export type CityUpdatePayload = Partial<CityPayload>;

export type ListCitiesQuery = {
  active?: "false" | "true";
  limit?: number;
  page?: number;
  q?: string;
};
