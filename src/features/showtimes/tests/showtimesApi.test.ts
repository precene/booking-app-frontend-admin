import { DateTime } from "luxon";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "#/shared/services/apiClient";
import { showtimesApi } from "../services/showtimesApi";

vi.mock("#/shared/services/apiClient", () => ({
  apiClient: {
    delete: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedApiClient = vi.mocked(apiClient);

describe("showtime api wrappers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists showtimes with cleaned query params", async () => {
    const data = { data: { items: [] }, message: "OK" };
    const from = DateTime.now().plus({ days: 1 }).toUTC().toISO() ?? "";
    mockedApiClient.get.mockResolvedValueOnce({ data });

    await expect(
      showtimesApi.list({
        from,
        limit: 20,
        movieId: "",
        page: 1,
        status: "scheduled",
        venueId: "venue-1",
      }),
    ).resolves.toBe(data);

    expect(mockedApiClient.get).toHaveBeenCalledWith("/admin/shows", {
      params: {
        from,
        limit: 20,
        page: 1,
        status: "scheduled",
        venueId: "venue-1",
      },
    });
  });

  it("gets showtime details", async () => {
    const data = { data: { show: { id: "show-1" } }, message: "OK" };
    mockedApiClient.get.mockResolvedValueOnce({ data });

    await expect(showtimesApi.get("show-1")).resolves.toBe(data);

    expect(mockedApiClient.get).toHaveBeenCalledWith("/admin/shows/show-1");
  });

  it("creates a showtime", async () => {
    const data = { data: { show: { id: "show-1" } }, message: "Created" };
    const startsAt = DateTime.now().plus({ days: 1 }).toUTC().toISO() ?? "";
    const payload = {
      movieId: "movie-1",
      priceOverrides: [{ categoryId: "category-1", priceMinor: 1500 }],
      screenId: "screen-1",
      startsAt,
    };
    mockedApiClient.post.mockResolvedValueOnce({ data });

    await expect(showtimesApi.create(payload)).resolves.toBe(data);

    expect(mockedApiClient.post).toHaveBeenCalledWith("/admin/shows", payload);
  });

  it("updates a showtime", async () => {
    const data = { data: { show: { id: "show-1" } }, message: "Updated" };
    const payload = { status: "live" as const };
    mockedApiClient.patch.mockResolvedValueOnce({ data });

    await expect(showtimesApi.update("show-1", payload)).resolves.toBe(data);

    expect(mockedApiClient.patch).toHaveBeenCalledWith("/admin/shows/show-1", payload);
  });

  it("cancels a showtime through the cancel endpoint", async () => {
    const data = { data: { show: { id: "show-1" } }, message: "Cancelled" };
    mockedApiClient.post.mockResolvedValueOnce({ data });

    await expect(showtimesApi.cancel("show-1")).resolves.toBe(data);

    expect(mockedApiClient.post).toHaveBeenCalledWith("/admin/shows/show-1/cancel");
  });

  it("gets the showtime seat map from the seats endpoint", async () => {
    const data = { data: { seats: [], show: { id: "show-1" } }, message: "OK" };
    mockedApiClient.get.mockResolvedValueOnce({ data });

    await expect(showtimesApi.getSeatMap("show-1")).resolves.toBe(data);

    expect(mockedApiClient.get).toHaveBeenCalledWith("/admin/shows/show-1/seats");
  });

  it("blocks show seats", async () => {
    const data = { data: { seats: [{ id: "seat-1" }] }, message: "Blocked" };
    const payload = { reason: "Maintenance", showSeatIds: ["seat-1"] };
    mockedApiClient.post.mockResolvedValueOnce({ data });

    await expect(showtimesApi.blockSeats("show-1", payload)).resolves.toBe(data);

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      "/admin/shows/show-1/seat-blocks",
      payload,
    );
  });

  it("unblocks a show seat", async () => {
    const data = { data: { seat: { id: "seat-1" } }, message: "Unblocked" };
    mockedApiClient.delete.mockResolvedValueOnce({ data });

    await expect(showtimesApi.unblockSeat("show-1", "seat-1")).resolves.toBe(data);

    expect(mockedApiClient.delete).toHaveBeenCalledWith(
      "/admin/shows/show-1/seat-blocks/seat-1",
    );
  });
});
