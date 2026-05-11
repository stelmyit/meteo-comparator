import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./providers.js", () => ({
  getOpenMeteoForecast: vi.fn(),
  getMetNorwayForecast: vi.fn()
}));

const { getOpenMeteoForecast, getMetNorwayForecast } = await import("./providers.js");
const { getForecastComparison } = await import("./service.js");
import type { WeatherSource } from "./types.js";

const openMeteoMock = vi.mocked(getOpenMeteoForecast);
const metNorwayMock = vi.mocked(getMetNorwayForecast);

describe("getForecastComparison", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns sources, average forecast and location metadata", async () => {
    openMeteoMock.mockResolvedValue(source("open-meteo", "Open-Meteo", 20));
    metNorwayMock.mockResolvedValue(source("met-norway", "MET Norway", 22));

    const result = await getForecastComparison({
      latitude: 52.2,
      longitude: 21,
      label: "Warszawa"
    });

    expect(result.location).toEqual({ latitude: 52.2, longitude: 21, label: "Warszawa" });
    expect(result.sources).toHaveLength(2);
    expect(result.average[0]?.temperatureMax).toBe(21);
    expect(result.failedSources).toEqual([]);
  });

  it("keeps successful sources when one provider fails", async () => {
    openMeteoMock.mockResolvedValue(source("open-meteo", "Open-Meteo", 20));
    metNorwayMock.mockRejectedValue(new Error("MET Norway timeout"));

    const result = await getForecastComparison({
      latitude: 52.2,
      longitude: 21,
      label: "Warszawa"
    });

    expect(result.sources).toHaveLength(1);
    expect(result.failedSources).toEqual(["MET Norway timeout"]);
  });

  it("uses a fallback message for non-error provider failures", async () => {
    openMeteoMock.mockRejectedValue("timeout");
    metNorwayMock.mockRejectedValue("offline");

    const result = await getForecastComparison({
      latitude: 52.2,
      longitude: 21,
      label: "Warszawa"
    });

    expect(result.failedSources).toEqual(["Nieznany błąd źródła", "Nieznany błąd źródła"]);
  });
});

function source(id: string, name: string, temperatureMax: number): WeatherSource {
  return {
    id,
    name,
    updatedAt: "2026-05-11T10:00:00Z",
    days: [
      {
        date: "2026-05-11",
        temperatureMax,
        temperatureMin: 10,
        precipitation: 1,
        precipitationProbability: 30,
        windMax: 12
      }
    ]
  };
}
