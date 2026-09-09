import { describe, expect, it } from "vitest";

import { getSocketBaseUrl } from "../utils/showtimeSocketUtils";

describe("showtime socket utilities", () => {
  it("falls back to the current origin when API base URL is missing", () => {
    expect(getSocketBaseUrl(undefined, "http://localhost:5174")).toBe("http://localhost:5174");
  });

  it("removes versioned API suffix from socket base URL", () => {
    expect(getSocketBaseUrl("http://localhost:3000/api/v1", "http://localhost:5174")).toBe(
      "http://localhost:3000",
    );
  });

  it("removes trailing slash after versioned API suffix", () => {
    expect(getSocketBaseUrl("https://api.977cinema.test/api/v2/", "http://localhost:5174")).toBe(
      "https://api.977cinema.test",
    );
  });
});
