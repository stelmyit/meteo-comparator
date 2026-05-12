import { describe, expect, it } from "vitest";

import { buildDailyConfidence, buildForecastInsights, getConfidenceSummary } from "./insights.js";
import type { ForecastComparison, WeatherDay, WeatherSource } from "../types/weather.js";

describe("forecast insights", () => {
  it("calculates daily confidence from source spread", () => {
    const forecast = comparison([
      source("one", [day("2026-05-11", 20, 1, 12)]),
      source("two", [day("2026-05-11", 21.2, 1, 13)]),
      source("three", [day("2026-05-11", 27, 1, 21)])
    ]);

    const result = buildDailyConfidence(forecast, "temperatureMax");

    expect(result[0]).toEqual({
      date: "2026-05-11",
      level: "low",
      spread: 7
    });
    expect(getConfidenceSummary(result.map((item) => item.level))).toBe("low");
  });

  it("builds warmest, driest and calmest day insights", () => {
    const result = buildForecastInsights([
      day("2026-05-11", 20, 4, 18),
      day("2026-05-12", 25, 0, 22),
      day("2026-05-13", 23, 1, 9)
    ]);

    expect(result).toEqual([
      { date: "2026-05-12", label: "warmest", value: 25 },
      { date: "2026-05-12", label: "driest", value: 0 },
      { date: "2026-05-13", label: "calmest", value: 9 }
    ]);
  });
});

function comparison(sources: WeatherSource[]): ForecastComparison {
  return {
    average: [day("2026-05-11", 22, 1, 15)],
    failedSources: [],
    generatedAt: "2026-05-11T10:00:00Z",
    location: { label: "Warsaw", latitude: 52.23, longitude: 21.01 },
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

function day(
  date: string,
  temperatureMax: number,
  precipitation: number,
  windMax: number
): WeatherDay {
  return {
    apparentTemperatureMax: temperatureMax - 1,
    apparentTemperatureMin: temperatureMax - 9,
    date,
    precipitation,
    precipitationProbability: precipitation > 0 ? 60 : 20,
    temperatureMax,
    temperatureMin: temperatureMax - 8,
    weatherCode: precipitation > 0 ? 61 : 1,
    windMax
  };
}
