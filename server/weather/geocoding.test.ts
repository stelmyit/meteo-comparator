import { afterEach, describe, expect, it, vi } from "vitest";

import { searchLocations } from "./geocoding.js";

describe("searchLocations", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps Open-Meteo geocoding results to the app location contract", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 756135,
            name: "Warszawa",
            country: "Polska",
            admin1: "Województwo mazowieckie",
            latitude: 52.22977,
            longitude: 21.01178,
            timezone: "Europe/Warsaw",
            population: 1790658
          }
        ]
      })
    } as Response);

    await expect(searchLocations("Warszawa")).resolves.toEqual([
      {
        id: 756135,
        name: "Warszawa",
        country: "Polska",
        admin1: "Województwo mazowieckie",
        latitude: 52.22977,
        longitude: 21.01178,
        timezone: "Europe/Warsaw"
      }
    ]);
  });

  it("returns an empty list when the API has no results field", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({})
    } as Response);

    await expect(searchLocations("Atlantyda")).resolves.toEqual([]);
  });
});
