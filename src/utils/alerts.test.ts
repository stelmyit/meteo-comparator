import { describe, expect, it } from "vitest";

import { buildForecastAlerts } from "./alerts.js";
import type { WeatherDay } from "../types/weather.js";

describe("alerts", () => {
  it("builds alerts from hot, cold, rainy and windy days", () => {
    const alerts = buildForecastAlerts([
      day("2026-05-15", 31, 12, 20, 10, 10),
      day("2026-05-16", 18, 2, 80, 12, 3),
      day("2026-05-17", 20, 8, 20, 36, 0)
    ]);

    expect(alerts).toEqual([
      { date: "2026-05-15", kind: "heat", severity: "warning" },
      { date: "2026-05-15", kind: "rain", severity: "warning" },
      { date: "2026-05-16", kind: "cold", severity: "info" },
      { date: "2026-05-16", kind: "rain", severity: "warning" },
      { date: "2026-05-17", kind: "wind", severity: "warning" }
    ]);
  });

  it("returns no alerts when thresholds are not reached", () => {
    expect(buildForecastAlerts([day("2026-05-15", 22, 10, 30, 12, 1)])).toEqual([]);
  });
});

function day(
  date: string,
  temperatureMax: number,
  temperatureMin: number,
  precipitationProbability: number,
  windMax: number,
  precipitation: number
): WeatherDay {
  return {
    apparentTemperatureMax: temperatureMax + 1,
    apparentTemperatureMin: temperatureMin - 1,
    date,
    precipitation,
    precipitationProbability,
    temperatureMax,
    temperatureMin,
    weatherCode: precipitation > 0 ? 61 : 1,
    windMax
  };
}
