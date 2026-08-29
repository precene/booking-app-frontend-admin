export type ScreenType = "curved" | "flat";

export type Screen = {
  active: boolean;
  createdAt: string;
  id: string;
  name: string;
  screenType: ScreenType;
  sortOrder: number;
  updatedAt: string;
  venueId: string;
};

export type ScreenPayload = {
  active?: boolean;
  name: string;
  screenType?: ScreenType;
  sortOrder?: number;
  venueId: string;
};

export type ScreenUpdatePayload = Partial<ScreenPayload>;

export type ListScreensQuery = {
  active?: "false" | "true";
  venueId?: string;
};
