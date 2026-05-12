import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getDwdIconForecast,
  getEcmwfForecast,
  getMetNorwayForecast,
  getOpenMeteoForecast,
  normalizeMetNorwayForecast
} from "./providers.js";

describe("MET Norway normalization", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("groups hourly readings into daily min, max, wind and precipitation values", () => {
    const result = normalizeMetNorwayForecast({
      properties: {
        meta: { updated_at: "2026-05-11T09:00:00Z" },
        timeseries: [
          samplePoint("2026-05-11T00:00:00Z", 10, 2, 0.2),
          samplePoint("2026-05-11T01:00:00Z", 12, 3, 0.4),
          samplePoint("2026-05-12T00:00:00Z", 8, 1.5, 1.2)
        ]
      }
    });

    expect(result).toEqual({
      id: "met-norway",
      name: "MET Norway",
      updatedAt: "2026-05-11T09:00:00Z",
      days: [
        {
          apparentTemperatureMax: null,
          apparentTemperatureMin: null,
          date: "2026-05-11",
          temperatureMax: 12,
          temperatureMin: 10,
          precipitation: 0.6,
          precipitationProbability: null,
          weatherCode: 61,
          windMax: 10.8
        },
        {
          apparentTemperatureMax: null,
          apparentTemperatureMin: null,
          date: "2026-05-12",
          temperatureMax: 8,
          temperatureMin: 8,
          precipitation: 1.2,
          precipitationProbability: null,
          weatherCode: 61,
          windMax: 5.4
        }
      ]
    });
  });

  it("uses six-hour precipitation only at block boundaries when hourly data is missing", () => {
    const result = normalizeMetNorwayForecast({
      properties: {
        meta: { updated_at: "2026-05-11T09:00:00Z" },
        timeseries: [
          samplePoint("2026-05-11T00:00:00Z", 10, 2, undefined, 4),
          samplePoint("2026-05-11T01:00:00Z", 11, 2, undefined, 4),
          samplePoint("2026-05-11T06:00:00Z", 13, 4, undefined, 2)
        ]
      }
    });

    expect(result.days[0]?.precipitation).toBe(6);
  });

  it("maps MET Norway symbols to weather condition codes", () => {
    const result = normalizeMetNorwayForecast({
      properties: {
        meta: { updated_at: "2026-05-11T09:00:00Z" },
        timeseries: [
          samplePoint("2026-05-11T00:00:00Z", 10, 2, 0, undefined, "clearsky_day"),
          samplePoint("2026-05-12T00:00:00Z", 10, 2, 0, undefined, "partlycloudy_day"),
          samplePoint("2026-05-13T00:00:00Z", 10, 2, 0, undefined, "fog"),
          samplePoint("2026-05-14T00:00:00Z", 10, 2, 0, undefined, "snow"),
          samplePoint("2026-05-15T00:00:00Z", 10, 2, 0, undefined, "thunderstorm"),
          samplePoint("2026-05-16T00:00:00Z", 10, 2, 0, undefined, "cloudy"),
          samplePoint("2026-05-17T00:00:00Z", 10, 2, 0, undefined, "fair_day")
        ]
      }
    });

    expect(result.days.map((day) => day.weatherCode)).toEqual([0, 2, 45, 73, 95, 3, 0]);
  });

  it("keeps unknown MET Norway symbols empty", () => {
    const result = normalizeMetNorwayForecast({
      properties: {
        meta: { updated_at: "2026-05-11T09:00:00Z" },
        timeseries: [
          samplePoint("2026-05-11T00:00:00Z", 10, 2),
          samplePoint("2026-05-12T00:00:00Z", 10, 2, 0, undefined, "mystery")
        ]
      }
    });

    expect(result.days[0]?.weatherCode).toBeNull();
    expect(result.days[1]?.weatherCode).toBeNull();
  });
});

describe("provider clients", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps Open-Meteo daily forecast payloads", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        daily: {
          time: ["2026-05-11"],
          apparent_temperature_max: [21.45],
          apparent_temperature_min: [9.01],
          weather_code: [61],
          temperature_2m_max: [20.34],
          temperature_2m_min: [10.12],
          precipitation_sum: [1.26],
          precipitation_probability_max: [65],
          wind_speed_10m_max: [14.44]
        }
      })
    } as Response);

    const result = await getOpenMeteoForecast(52.2, 21);

    expect(result.id).toBe("open-meteo");
    expect(result.days).toEqual([
      {
        apparentTemperatureMax: 21.5,
        apparentTemperatureMin: 9,
        date: "2026-05-11",
        temperatureMax: 20.3,
        temperatureMin: 10.1,
        precipitation: 1.3,
        precipitationProbability: 65,
        weatherCode: 61,
        windMax: 14.4
      }
    ]);
  });

  it("requests and normalizes MET Norway forecasts", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        properties: {
          meta: { updated_at: "2026-05-11T09:00:00Z" },
          timeseries: [samplePoint("2026-05-11T00:00:00Z", 10, 2, 0.2)]
        }
      })
    } as Response);

    const result = await getMetNorwayForecast(52.22977, 21.01178);

    expect(result.name).toBe("MET Norway");
    expect(fetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        headers: expect.objectContaining({
          "User-Agent": expect.stringContaining("meteo-comparator")
        })
      })
    );
  });

  it("requests additional Open-Meteo model endpoints", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        daily: {
          time: ["2026-05-11"],
          apparent_temperature_max: [22],
          apparent_temperature_min: [8],
          weather_code: [3],
          temperature_2m_max: [21],
          temperature_2m_min: [9],
          precipitation_sum: [0],
          wind_speed_10m_max: [12]
        }
      })
    } as Response);

    const dwdResult = await getDwdIconForecast(52.2, 21);
    const ecmwfResult = await getEcmwfForecast(52.2, 21);

    expect(dwdResult.name).toBe("DWD ICON");
    expect(ecmwfResult.name).toBe("ECMWF IFS");
    expect(ecmwfResult.days[0]?.precipitationProbability).toBeNull();
    expect(String(vi.mocked(fetch).mock.calls[0]?.[0])).toContain("/v1/dwd-icon");
    expect(String(vi.mocked(fetch).mock.calls[1]?.[0])).toContain("/v1/ecmwf");
  });
});

function samplePoint(
  time: string,
  temperature: number,
  windSpeed: number,
  precipitation1h?: number,
  precipitation6h?: number,
  symbolCode = "rain"
) {
  return {
    time,
    data: {
      instant: {
        details: {
          air_temperature: temperature,
          wind_speed: windSpeed
        }
      },
      next_1_hours:
        precipitation1h === undefined
          ? undefined
          : {
              summary: {
                symbol_code: symbolCode
              },
              details: {
                precipitation_amount: precipitation1h
              }
            },
      next_6_hours:
        precipitation6h === undefined
          ? undefined
          : {
              summary: {
                symbol_code: symbolCode
              },
              details: {
                precipitation_amount: precipitation6h
              }
            }
    }
  };
}
