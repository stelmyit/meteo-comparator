import { describe, expect, it } from "vitest";

import { averageForecasts, numberOrNull, round } from "./aggregation.js";
import type { WeatherDay, WeatherSource } from "./types.js";

describe("weather aggregation", () => {
  it("averages daily forecasts by date and ignores missing values", () => {
    const result = averageForecasts([
      source("one", [
        {
          date: "2026-05-11",
          temperatureMax: 20,
          temperatureMin: 10,
          precipitation: 2,
          precipitationProbability: 40,
          windMax: 12
        },
        {
          date: "2026-05-12",
          temperatureMax: 18,
          temperatureMin: 8,
          precipitation: 0,
          precipitationProbability: null,
          windMax: 10
        }
      ]),
      source("two", [
        {
          date: "2026-05-11",
          temperatureMax: 22,
          temperatureMin: null,
          precipitation: 4,
          precipitationProbability: 60,
          windMax: 16
        }
      ])
    ]);

    expect(result).toEqual([
      {
        date: "2026-05-11",
        temperatureMax: 21,
        temperatureMin: 10,
        precipitation: 3,
        precipitationProbability: 50,
        windMax: 14
      },
      {
        date: "2026-05-12",
        temperatureMax: 18,
        temperatureMin: 8,
        precipitation: 0,
        precipitationProbability: null,
        windMax: 10
      }
    ]);
  });

  it("rounds values and turns non-finite provider readings into nulls", () => {
    expect(round(12.26)).toBe(12.3);
    expect(numberOrNull(5.04)).toBe(5);
    expect(numberOrNull(undefined)).toBeNull();
  });
});

function source(id: string, days: WeatherDay[]): WeatherSource {
  return {
    id,
    name: id,
    updatedAt: "2026-05-11T10:00:00Z",
    days
  };
}
