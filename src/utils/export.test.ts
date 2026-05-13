import { describe, expect, it, vi } from "vitest";

import { buildForecastCsv, buildForecastExportPayload, getExportFileBaseName } from "./export.js";
import type { ForecastComparison } from "../types/weather.js";

describe("export utils", () => {
  it("builds csv rows for the selected metrics and day", () => {
    const forecast = createForecast();

    const csv = buildForecastCsv(forecast, ["temperatureMax", "windMax"], "2026-05-12", "metric");

    expect(csv).toContain(
      "date,sourceId,sourceName,locationLabel,units,temperatureMax,windMax,weatherCode"
    );
    expect(csv).toContain("2026-05-12,open-meteo,Open-Meteo,Warszawa,metric,22,11,1");
    expect(csv).not.toContain("2026-05-11,open-meteo");
  });

  it("builds filtered export payload and file name", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-12T09:30:00Z"));

    const forecast = createForecast();
    const payload = buildForecastExportPayload(forecast, ["temperatureMax"], "", "imperial");

    expect(payload).toMatchObject({
      exportedAt: "2026-05-12T09:30:00.000Z",
      location: forecast.location,
      metrics: ["temperatureMax"],
      units: "imperial"
    });
    expect(getExportFileBaseName(forecast, "2026-05-12")).toBe("forecast-warszawa-2026-05-12");

    vi.useRealTimers();
  });

  it("converts exported values and escapes csv fields in imperial mode", () => {
    const forecast = {
      ...createForecast(),
      location: { label: "New York, NY", latitude: 40.7, longitude: -74 }
    };

    const csv = buildForecastCsv(
      forecast,
      ["temperatureMax", "precipitation", "windMax"],
      "2026-05-11",
      "imperial"
    );

    expect(csv).toContain('"New York, NY"');
    expect(csv).toContain("imperial,68,0.08,4.97,61");
  });
});

function createForecast(): ForecastComparison {
  return {
    generatedAt: "2026-05-11T10:00:00Z",
    location: { label: "Warszawa", latitude: 52.22977, longitude: 21.01178 },
    failedSources: [],
    average: [day("2026-05-11", 20, 10, 2, 8, 61), day("2026-05-12", 22, 11, 0, 10, 1)],
    sources: [
      {
        id: "open-meteo",
        name: "Open-Meteo",
        updatedAt: "2026-05-11T10:00:00Z",
        days: [day("2026-05-11", 20, 10, 2, 8, 61), day("2026-05-12", 22, 11, 0, 11, 1)]
      }
    ]
  };
}

function day(
  date: string,
  temperatureMax: number,
  temperatureMin: number,
  precipitation: number,
  windMax: number,
  weatherCode: number
) {
  return {
    apparentTemperatureMax: temperatureMax + 1,
    apparentTemperatureMin: temperatureMin - 1,
    date,
    precipitation,
    precipitationProbability: precipitation ? 70 : 20,
    temperatureMax,
    temperatureMin,
    weatherCode,
    windMax
  };
}
