import type { ScreenType } from "./screenTypes";
import type { SeatDefinitionPayload } from "./seatLayoutTypes";

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

export type VenueSetupPayload = VenuePayload & {
  seatCategories?: Array<{
    color?: string;
    defaultPriceMinor: number;
    name: string;
  }>;
  screens?: Array<{
    active?: boolean;
    layout?: {
      config?: Record<string, unknown>;
      isActive?: boolean;
      name: string;
      seatDefs?: Array<SeatDefinitionPayload>;
    };
    name: string;
    screenType?: ScreenType;
    sortOrder?: number;
  }>;
};

export type ListVenuesQuery = {
  active?: "false" | "true";
  cityId?: string;
  limit?: number;
  page?: number;
  q?: string;
};
