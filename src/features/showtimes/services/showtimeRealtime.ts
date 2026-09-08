import { io, type Socket } from "socket.io-client";

import { useAuthStore } from "#/features/auth/store/authStore";
import type { ShowSeatStatus } from "../types/showtimeTypes";

export const showtimeSocketEvents = {
  error: "error",
  holdExpired: "hold:expired",
  requestSeatMap: "seat_map:request",
  seatBlocked: "seat:blocked",
  seatBooked: "seat:booked",
  seatCancelled: "seat:cancelled",
  seatHeld: "seat:held",
  seatMapSnapshot: "seat_map:snapshot",
  seatReleased: "seat:released",
  seatUnblocked: "seat:unblocked",
  sessionExpired: "session:expired",
  showStatusChanged: "show:status_changed",
} as const;

export type SeatMapSnapshotSeat = {
  blockedReason: string | null;
  categoryColor: string | null;
  categoryId: string | null;
  categoryName: string | null;
  id: string;
  isAccessible: boolean;
  isRestricted: boolean;
  positionX: number;
  positionY: number;
  priceMinor: number;
  rowLabel: string;
  section: string | null;
  seatLabel: string;
  status: ShowSeatStatus;
};

export type SeatMapSnapshotPayload = {
  seats: Array<SeatMapSnapshotSeat>;
  showId: string;
};

export type SeatStateChangePayload = {
  rowLabel: string;
  seatId: string;
  seatLabel: string;
  showId: string;
  timestamp: string;
  userId: string | null;
};

export type ShowStatusChangePayload = {
  showId: string;
  status: string;
  timestamp: string;
};

export function createShowtimeSocket(): Socket {
  const socket = io(getSocketBaseUrl(), {
    autoConnect: false,
    transports: ["websocket", "polling"],
    withCredentials: true,
  });

  socket.on(showtimeSocketEvents.sessionExpired, () => {
    useAuthStore.getState().logout();

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  });

  return socket;
}

function getSocketBaseUrl() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!apiBaseUrl) {
    return window.location.origin;
  }

  return apiBaseUrl.replace(/\/api\/v\d+\/?$/, "");
}
