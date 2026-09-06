export type SeatDefinitionPayload = {
  categoryId?: null | string;
  isAccessible?: boolean;
  isActive?: boolean;
  isRestricted?: boolean;
  positionX: number;
  positionY: number;
  rowLabel: string;
  section?: string;
  seatLabel: string;
};

export type SeatLayoutCellStatus = "disabled" | "seat";

export type SeatLayoutCell = {
  categoryId?: null | string;
  isAccessible?: boolean;
  isRestricted?: boolean;
  positionX: number;
  positionY: number;
  rowLabel?: string;
  section?: string;
  seatLabel?: string;
  status: SeatLayoutCellStatus;
};

export type SeatDefinition = {
  categoryId: null | string;
  id: string;
  isAccessible: boolean;
  isActive: boolean;
  isRestricted: boolean;
  positionX: number;
  positionY: number;
  rowLabel: string;
  seatLabel: string;
  section: null | string;
};

export type SeatLayout = {
  config: Record<string, unknown>;
  createdAt: string;
  id: string;
  isActive: boolean;
  name: string;
  screenId: string;
  seatCount: number;
  seatDefs?: Array<SeatDefinition>;
  updatedAt: string;
};

export type SeatLayoutPayload = {
  config?: Record<string, unknown>;
  isActive?: boolean;
  name: string;
  screenId: string;
  seatDefs?: Array<SeatDefinitionPayload>;
};

export type SeatLayoutUpdatePayload = Partial<SeatLayoutPayload>;

export type ListSeatLayoutsQuery = {
  screenId?: string;
};
