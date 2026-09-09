import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "#/features/auth/store/authStore";
import { createShowtimeSocket, showtimeSocketEvents } from "../services/showtimeRealtime";

const socketHandlers = new Map<string, () => void>();
const socket = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  emit: vi.fn(),
  on: vi.fn((event: string, handler: () => void) => {
    socketHandlers.set(event, handler);
    return socket;
  }),
};

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => socket),
}));

vi.mock("#/features/auth/store/authStore", () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

describe("showtime realtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    socketHandlers.clear();
    vi.stubGlobal("window", {
      location: {
        href: "http://localhost:5174/showtimes/show-1",
        origin: "http://localhost:5174",
        pathname: "/showtimes/show-1",
      },
    });
  });

  it("keeps socket event names stable", () => {
    expect(showtimeSocketEvents).toEqual({
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
    });
  });

  it("creates a socket that does not auto-connect and uses credentials", async () => {
    const { io } = await import("socket.io-client");

    createShowtimeSocket();

    expect(io).toHaveBeenCalledWith("http://localhost:3001", {
      autoConnect: false,
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  });

  it("logs out and redirects when session expires", () => {
    const logout = vi.fn();
    vi.mocked(useAuthStore.getState).mockReturnValue({ logout });

    createShowtimeSocket();
    socketHandlers.get(showtimeSocketEvents.sessionExpired)?.();

    expect(logout).toHaveBeenCalled();
    expect(window.location.href).toBe("/login");
  });
});
