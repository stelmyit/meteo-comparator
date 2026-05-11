import { describe, expect, it } from "vitest";

import { averageForecasts, filterForecast, normalizeVisibleMetrics } from "./forecast.js";
import type { ForecastComparison, WeatherDay, WeatherSource } from "../types/weather.js";

describe("forecast utilities", () => {
  it("filters sources, recomputes averages and scopes days", () => {
    const forecast = comparison([
      source("one", [day("2026-05-11", 20, 1), day("2026-05-12", 18, 0)]),
      source("two", [day("2026-05-11", 24, 61)])
    ]);

    const result = filterForecast(forecast, "2026-05-11", ["two"]);

    expect(result.sources).toHaveLength(1);
    expect(result.average).toEqual([day("2026-05-11", 24, 61)]);
  });

  it("averages numeric values and picks the most severe weather code", () => {
    const result = averageForecasts([
      source("one", [day("2026-05-11", 20, 1)]),
      source("two", [day("2026-05-11", 24, 3)]),
      source("three", [day("2026-05-11", 22, 45)]),
      source("four", [day("2026-05-11", 22, 51)]),
      source("five", [day("2026-05-11", 22, 71)]),
      source("six", [day("2026-05-11", 22, 95)]),
      source("seven", [day("2026-05-11", 22, 0)])
    ]);

    expect(result[0]?.temperatureMax).toBe(22);
    expect(result[0]?.weatherCode).toBe(95);
  });

  it("normalizes empty metric selections to defaults", () => {
    expect(normalizeVisibleMetrics([])).toContain("temperatureMax");
    expect(normalizeVisibleMetrics(["windMax"])).toEqual(["windMax"]);
  });
});

function comparison(sources: WeatherSource[]): ForecastComparison {
  return {
    average: averageForecasts(sources),
    failedSources: [],
    generatedAt: "2026-05-11T10:00:00Z",
    location: { label: "Warszawa", latitude: 52.2, longitude: 21 },
    sources
  };
}

function source(id: string, days: WeatherDay[]): WeatherSource {
  return {
    days,
    id,
    name: id,
    updatedAt: "2026-05-11T10:00:00Z"
  };
}

function day(date: string, temperatureMax: number, weatherCode: number): WeatherDay {
  return {
    apparentTemperatureMax: temperatureMax + 1,
    apparentTemperatureMin: temperatureMax - 10,
    date,
    precipitation: weatherCode > 50 ? 4 : 0,
    precipitationProbability: null,
    temperatureMax,
    temperatureMin: temperatureMax - 8,
    weatherCode,
    windMax: 12
  };
}
