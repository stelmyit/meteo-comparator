import { afterEach, describe, expect, it, vi } from "vitest";

import { drawWeatherChart } from "./chart.js";
import type { WeatherDay } from "../types/weather.js";

describe("drawWeatherChart", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns early when canvas context is unavailable", () => {
    const canvas = document.createElement("canvas");
    vi.spyOn(canvas, "getContext").mockReturnValue(null);

    expect(() =>
      drawWeatherChart(canvas, [day("2026-05-11", { temperatureMax: 20 })], "pl", "temperatureMax")
    ).not.toThrow();
  });

  it("clears the canvas and skips drawing when there are no numeric values", () => {
    const canvas = document.createElement("canvas");
    const context = canvasContext();
    vi.spyOn(canvas, "getContext").mockReturnValue(context);

    drawWeatherChart(canvas, [day("2026-05-11", { windMax: null })], "pl", "windMax");

    expect(context.clearRect).toHaveBeenCalled();
    expect(context.stroke).not.toHaveBeenCalled();
  });

  it("draws lines and points while skipping missing values", () => {
    const canvas = document.createElement("canvas");
    Object.defineProperty(canvas, "clientWidth", { configurable: true, value: 700 });
    const context = canvasContext();
    vi.spyOn(canvas, "getContext").mockReturnValue(context);

    drawWeatherChart(
      canvas,
      [
        day("2026-05-11", { precipitationProbability: 20 }),
        day("2026-05-12", { precipitationProbability: null }),
        day("2026-05-13", { precipitationProbability: 80 })
      ],
      "en",
      "precipitationProbability"
    );

    expect(context.moveTo).toHaveBeenCalled();
    expect(context.lineTo).toHaveBeenCalled();
    expect(context.arc).toHaveBeenCalledTimes(2);
  });
});

function canvasContext() {
  return {
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    scale: vi.fn(),
    stroke: vi.fn()
  } as unknown as CanvasRenderingContext2D;
}

function day(date: string, overrides: Partial<Omit<WeatherDay, "date">>): WeatherDay {
  const base: WeatherDay = {
    apparentTemperatureMax: null,
    apparentTemperatureMin: null,
    date,
    temperatureMax: null,
    temperatureMin: null,
    precipitation: null,
    precipitationProbability: null,
    weatherCode: null,
    windMax: null
  };

  return { ...base, ...overrides };
}
