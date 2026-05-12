import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchForecast, fetchLocations } from "./weatherApi.js";

describe("weatherApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches locations from the geocode endpoint", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        results: [{ name: "Warszawa", latitude: 52.2, longitude: 21 }]
      })
    );

    await expect(fetchLocations("Warszawa")).resolves.toEqual([
      { name: "Warszawa", latitude: 52.2, longitude: 21 }
    ]);
    expect(fetch).toHaveBeenCalledWith("/api/geocode?q=Warszawa");
  });

  it("fetches forecast with coordinates and label", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ sources: [], average: [] }));

    await fetchForecast({ latitude: 52.2, longitude: 21 }, "Warszawa, Polska");

    expect(fetch).toHaveBeenCalledWith("/api/forecast?lat=52.2&lon=21&label=Warszawa%2C%20Polska");
  });

  it("throws API error messages", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ error: "Brak danych" }, false));

    await expect(fetchLocations("Nie ma")).rejects.toThrow("Brak danych");
  });
});

function jsonResponse<T>(body: T, ok = true): Response {
  return {
    ok,
    json: async () => body
  } as Response;
}
