import { afterEach, describe, expect, it, vi } from "vitest";

import {
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
          date: "2026-05-11",
          temperatureMax: 12,
          temperatureMin: 10,
          precipitation: 0.6,
          precipitationProbability: null,
          windMax: 10.8
        },
        {
          date: "2026-05-12",
          temperatureMax: 8,
          temperatureMin: 8,
          precipitation: 1.2,
          precipitationProbability: null,
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
          temperature_2m_max: [20.34],
          temperature_2m_min: [10.12],
          precipitation_sum: [1.26],
          precipitation_probability_max: [65],
          windspeed_10m_max: [14.44]
        }
      })
    } as Response);

    const result = await getOpenMeteoForecast(52.2, 21);

    expect(result.id).toBe("open-meteo");
    expect(result.days).toEqual([
      {
        date: "2026-05-11",
        temperatureMax: 20.3,
        temperatureMin: 10.1,
        precipitation: 1.3,
        precipitationProbability: 65,
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
});

function samplePoint(
  time: string,
  temperature: number,
  windSpeed: number,
  precipitation1h?: number,
  precipitation6h?: number
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
              details: {
                precipitation_amount: precipitation1h
              }
            },
      next_6_hours:
        precipitation6h === undefined
          ? undefined
          : {
              details: {
                precipitation_amount: precipitation6h
              }
            }
    }
  };
}
