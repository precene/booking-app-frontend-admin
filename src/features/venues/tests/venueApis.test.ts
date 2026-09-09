import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "#/shared/services/apiClient";
import { screensApi } from "../services/screensApi";
import { seatCategoriesApi } from "../services/seatCategoriesApi";
import { seatLayoutsApi } from "../services/seatLayoutsApi";
import { venuesApi } from "../services/venuesApi";

vi.mock("#/shared/services/apiClient", () => ({
  apiClient: {
    delete: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedApiClient = vi.mocked(apiClient);

describe("venue api wrappers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists venues with cleaned query params", async () => {
    const data = { data: { items: [] }, message: "OK" };
    mockedApiClient.get.mockResolvedValueOnce({ data });

    await expect(
      venuesApi.list({ active: "true", cityId: "city-1", limit: 10, page: 1, q: "" }),
    ).resolves.toBe(data);

    expect(mockedApiClient.get).toHaveBeenCalledWith("/admin/venues", {
      params: {
        active: "true",
        cityId: "city-1",
        limit: 10,
        page: 1,
      },
    });
  });

  it("gets venue details", async () => {
    const data = { data: { venue: { id: "venue-1" } }, message: "OK" };
    mockedApiClient.get.mockResolvedValueOnce({ data });

    await expect(venuesApi.get("venue-1")).resolves.toBe(data);

    expect(mockedApiClient.get).toHaveBeenCalledWith("/admin/venues/venue-1");
  });

  it("creates a venue with backend-supported fields", async () => {
    const data = { data: { venue: { id: "venue-1" } }, message: "Created" };
    const payload = {
      active: true,
      address: "221B Baker Street",
      cityId: "city-1",
      contactEmail: null,
      contactPhone: "020 7946 0000",
      name: "977Cinema London",
    };
    mockedApiClient.post.mockResolvedValueOnce({ data });

    await expect(venuesApi.create(payload)).resolves.toBe(data);

    expect(mockedApiClient.post).toHaveBeenCalledWith("/admin/venues", payload);
  });

  it("updates a venue with partial fields", async () => {
    const data = { data: { venue: { id: "venue-1" } }, message: "Updated" };
    const payload = { active: false, name: "977Cinema Central" };
    mockedApiClient.patch.mockResolvedValueOnce({ data });

    await expect(venuesApi.update("venue-1", payload)).resolves.toBe(data);

    expect(mockedApiClient.patch).toHaveBeenCalledWith("/admin/venues/venue-1", payload);
  });

  it("creates a venue setup with screens, layout, and categories", async () => {
    const data = { data: { setup: { venue: { id: "venue-1" } } }, message: "Created" };
    const payload = {
      active: true,
      address: "221B Baker Street",
      cityId: "city-1",
      contactPhone: "020 7946 0000",
      name: "977Cinema London",
      screens: [
        {
          active: true,
          layout: {
            config: { columns: 2, rows: 1 },
            name: "Default Layout",
            seatDefs: [
              {
                categoryId: "category-1",
                isActive: true,
                positionX: 1,
                positionY: 1,
                rowLabel: "A",
                seatLabel: "A1",
              },
            ],
          },
          name: "Screen 1",
          screenType: "flat" as const,
          sortOrder: 0,
        },
      ],
      seatCategories: [
        {
          color: "#10b981",
          defaultPriceMinor: 1200,
          name: "Standard",
        },
      ],
    };
    mockedApiClient.post.mockResolvedValueOnce({ data });

    await expect(venuesApi.createSetup(payload)).resolves.toBe(data);

    expect(mockedApiClient.post).toHaveBeenCalledWith("/admin/venue-setups", payload);
  });
});

describe("screen api wrappers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists screens by venue id", async () => {
    const data = { data: { screens: [] }, message: "OK" };
    mockedApiClient.get.mockResolvedValueOnce({ data });

    await expect(screensApi.list({ active: "true", venueId: "venue-1" })).resolves.toBe(data);

    expect(mockedApiClient.get).toHaveBeenCalledWith("/admin/screens", {
      params: {
        active: "true",
        venueId: "venue-1",
      },
    });
  });

  it("creates a screen", async () => {
    const data = { data: { screen: { id: "screen-1" } }, message: "Created" };
    const payload = {
      active: true,
      name: "Screen 1",
      screenType: "flat" as const,
      sortOrder: 0,
      venueId: "venue-1",
    };
    mockedApiClient.post.mockResolvedValueOnce({ data });

    await expect(screensApi.create(payload)).resolves.toBe(data);

    expect(mockedApiClient.post).toHaveBeenCalledWith("/admin/screens", payload);
  });

  it("updates a screen", async () => {
    const data = { data: { screen: { id: "screen-1" } }, message: "Updated" };
    const payload = { active: false, name: "Screen 2" };
    mockedApiClient.patch.mockResolvedValueOnce({ data });

    await expect(screensApi.update("screen-1", payload)).resolves.toBe(data);

    expect(mockedApiClient.patch).toHaveBeenCalledWith("/admin/screens/screen-1", payload);
  });
});

describe("seat layout api wrappers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a seat layout", async () => {
    const data = { data: { layout: { id: "layout-1" } }, message: "Created" };
    const payload = {
      config: { columns: 2, rows: 1 },
      name: "Default Layout",
      screenId: "screen-1",
      seatDefs: [
        {
          categoryId: "category-1",
          isActive: true,
          isAccessible: false,
          isRestricted: false,
          positionX: 1,
          positionY: 1,
          rowLabel: "A",
          seatLabel: "A1",
          section: "Front",
        },
      ],
    };
    mockedApiClient.post.mockResolvedValueOnce({ data });

    await expect(seatLayoutsApi.create(payload)).resolves.toBe(data);

    expect(mockedApiClient.post).toHaveBeenCalledWith("/admin/layouts", payload);
  });

  it("updates a seat layout", async () => {
    const data = { data: { layout: { id: "layout-1" } }, message: "Updated" };
    const payload = {
      name: "Updated Layout",
      seatDefs: [],
    };
    mockedApiClient.patch.mockResolvedValueOnce({ data });

    await expect(seatLayoutsApi.update("layout-1", payload)).resolves.toBe(data);

    expect(mockedApiClient.patch).toHaveBeenCalledWith("/admin/layouts/layout-1", payload);
  });
});

describe("seat category api wrappers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists seat categories by screen id", async () => {
    const data = { data: { items: [] }, message: "OK" };
    mockedApiClient.get.mockResolvedValueOnce({ data });

    await expect(seatCategoriesApi.list({ screenId: "screen-1" })).resolves.toBe(data);

    expect(mockedApiClient.get).toHaveBeenCalledWith("/admin/seat-categories", {
      params: {
        screenId: "screen-1",
      },
    });
  });

  it("creates a seat category", async () => {
    const data = { data: { category: { id: "category-1" } }, message: "Created" };
    const payload = {
      color: "#10b981",
      defaultPriceMinor: 1200,
      name: "Standard",
      screenId: "screen-1",
    };
    mockedApiClient.post.mockResolvedValueOnce({ data });

    await expect(seatCategoriesApi.create(payload)).resolves.toBe(data);

    expect(mockedApiClient.post).toHaveBeenCalledWith("/admin/seat-categories", payload);
  });

  it("updates a seat category", async () => {
    const data = { data: { category: { id: "category-1" } }, message: "Updated" };
    const payload = {
      color: "#ef4444",
      defaultPriceMinor: 1500,
      name: "VIP",
    };
    mockedApiClient.patch.mockResolvedValueOnce({ data });

    await expect(seatCategoriesApi.update("category-1", payload)).resolves.toBe(data);

    expect(mockedApiClient.patch).toHaveBeenCalledWith("/admin/seat-categories/category-1", payload);
  });
});
