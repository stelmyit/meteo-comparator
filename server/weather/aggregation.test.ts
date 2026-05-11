import { describe, expect, it } from "vitest";

import { averageForecasts, numberOrNull, round } from "./aggregation.js";
import type { WeatherDay, WeatherSource } from "./types.js";

describe("weather aggregation", () => {
  it("averages daily forecasts by date and ignores missing values", () => {
    const result = averageForecasts([
      source("one", [
        {
          apparentTemperatureMax: 21,
          apparentTemperatureMin: 9,
          date: "2026-05-11",
          temperatureMax: 20,
          temperatureMin: 10,
          precipitation: 2,
          precipitationProbability: 40,
          weatherCode: 1,
          windMax: 12
        },
        {
          apparentTemperatureMax: 19,
          apparentTemperatureMin: 7,
          date: "2026-05-12",
          temperatureMax: 18,
          temperatureMin: 8,
          precipitation: 0,
          precipitationProbability: null,
          weatherCode: 0,
          windMax: 10
        }
      ]),
      source("two", [
        {
          apparentTemperatureMax: 23,
          apparentTemperatureMin: null,
          date: "2026-05-11",
          temperatureMax: 22,
          temperatureMin: null,
          precipitation: 4,
          precipitationProbability: 60,
          weatherCode: 61,
          windMax: 16
        }
      ])
    ]);

    expect(result).toEqual([
      {
        apparentTemperatureMax: 22,
        apparentTemperatureMin: 9,
        date: "2026-05-11",
        temperatureMax: 21,
        temperatureMin: 10,
        precipitation: 3,
        precipitationProbability: 50,
        weatherCode: 61,
        windMax: 14
      },
      {
        apparentTemperatureMax: 19,
        apparentTemperatureMin: 7,
        date: "2026-05-12",
        temperatureMax: 18,
        temperatureMin: 8,
        precipitation: 0,
        precipitationProbability: null,
        weatherCode: 0,
        windMax: 10
      }
    ]);
  });

  it("rounds values and turns non-finite provider readings into nulls", () => {
    expect(round(12.26)).toBe(12.3);
    expect(numberOrNull(5.04)).toBe(5);
    expect(numberOrNull(undefined)).toBeNull();
  });

  it("chooses the most severe weather code for averaged days", () => {
    const result = averageForecasts([
      source("clear", [weatherCodeDay(0)]),
      source("partly", [weatherCodeDay(1)]),
      source("cloudy", [weatherCodeDay(3)]),
      source("fog", [weatherCodeDay(45)]),
      source("rain", [weatherCodeDay(51)]),
      source("snow", [weatherCodeDay(71)]),
      source("storm", [weatherCodeDay(95)])
    ]);

    expect(result[0]?.weatherCode).toBe(95);
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

function weatherCodeDay(weatherCode: number): WeatherDay {
  return {
    apparentTemperatureMax: 20,
    apparentTemperatureMin: 10,
    date: "2026-05-11",
    precipitation: 0,
    precipitationProbability: null,
    temperatureMax: 20,
    temperatureMin: 10,
    weatherCode,
    windMax: 10
  };
}
