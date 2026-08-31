export type Venue = {
  active: boolean;
  address: string;
  cityId: string;
  contactEmail: null | string;
  contactPhone: null | string;
  createdAt: string;
  id: string;
  name: string;
  timezone: string;
  updatedAt: string;
};

export type VenuePayload = {
  active?: boolean;
  address: string;
  cityId: string;
  contactEmail?: null | string;
  contactPhone: string;
  name: string;
};

export type VenueUpdatePayload = Partial<VenuePayload>;

export type ListVenuesQuery = {
  active?: "false" | "true";
  cityId?: string;
  limit?: number;
  page?: number;
  q?: string;
};
