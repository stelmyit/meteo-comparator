import { describe, expect, it } from "vitest";

import { buildPlannerRecommendations } from "./planner.js";
import type { WeatherDay } from "../types/weather.js";

describe("planner", () => {
  it("picks the most suitable day for each activity", () => {
    const recommendations = buildPlannerRecommendations([
      day("2026-05-15", 17, 0, 20, 10),
      day("2026-05-16", 22, 0, 10, 5),
      day("2026-05-17", 25, 2, 35, 16)
    ]);

    expect(recommendations).toEqual([
      expect.objectContaining({ activity: "walk", date: "2026-05-16" }),
      expect.objectContaining({ activity: "outdoor", date: "2026-05-16" }),
      expect.objectContaining({ activity: "trip", date: "2026-05-16" })
    ]);
  });

  it("skips days without enough data", () => {
    const recommendations = buildPlannerRecommendations([
      {
        apparentTemperatureMax: null,
        apparentTemperatureMin: null,
        date: "2026-05-15",
        precipitation: null,
        precipitationProbability: null,
        temperatureMax: null,
        temperatureMin: null,
        weatherCode: null,
        windMax: null
      }
    ]);

    expect(recommendations).toEqual([]);
  });

  it("can choose different best days for different activities", () => {
    const recommendations = buildPlannerRecommendations([
      day("2026-05-15", 21, 0, 5, 7),
      day("2026-05-16", 17, 0, 10, 3),
      day("2026-05-17", 24, 0, 0, 2)
    ]);

    expect(recommendations).toContainEqual(
      expect.objectContaining({ activity: "walk", date: "2026-05-15" })
    );
    expect(recommendations).toContainEqual(
      expect.objectContaining({ activity: "outdoor", date: "2026-05-16" })
    );
    expect(recommendations).toContainEqual(
      expect.objectContaining({ activity: "trip", date: "2026-05-17" })
    );
  });
});

function day(
  date: string,
  temperatureMax: number,
  precipitation: number,
  precipitationProbability: number,
  windMax: number
): WeatherDay {
  return {
    apparentTemperatureMax: temperatureMax + 1,
    apparentTemperatureMin: temperatureMax - 7,
    date,
    precipitation,
    precipitationProbability,
    temperatureMax,
    temperatureMin: temperatureMax - 8,
    weatherCode: precipitation > 0 ? 61 : 1,
    windMax
  };
}
