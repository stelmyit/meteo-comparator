import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ForecastTable } from "./ForecastTable.jsx";
import { translations } from "../i18n.js";
import type { WeatherDay } from "../types/weather.js";

describe("ForecastTable", () => {
  it("renders average and source rows", () => {
    render(
      <ForecastTable
        forecast={{
          location: { label: "Warszawa", latitude: 52.2, longitude: 21 },
          generatedAt: "2026-05-11T10:00:00Z",
          failedSources: [],
          average: [day("2026-05-11", 20, 10, 1, 12)],
          sources: [
            {
              id: "open-meteo",
              name: "Open-Meteo",
              updatedAt: "2026-05-11T10:00:00Z",
              days: [day("2026-05-11", 21, 11, 2, 14)]
            }
          ]
        }}
        language="pl"
        metrics={["temperatureMax", "temperatureMin", "precipitation", "windMax"]}
        t={translations.pl}
        units="metric"
      />
    );

    expect(screen.getByRole("heading", { name: "Porownanie zrodel" })).toBeInTheDocument();
    expect(screen.getByText("Srednia")).toBeInTheDocument();
    expect(screen.getByText("Open-Meteo")).toBeInTheDocument();
    expect(screen.getByText("21.0°C")).toBeInTheDocument();
    expect(screen.getByText("11.0°C")).toBeInTheDocument();
  });

  it("renders imperial values when selected", () => {
    render(
      <ForecastTable
        forecast={{
          location: { label: "Warsaw", latitude: 52.2, longitude: 21 },
          generatedAt: "2026-05-11T10:00:00Z",
          failedSources: [],
          average: [day("2026-05-11", 20, 10, 25.4, 16.09344)],
          sources: []
        }}
        language="en"
        metrics={["temperatureMax", "precipitation", "windMax"]}
        t={translations.en}
        units="imperial"
      />
    );

    expect(screen.getByRole("heading", { name: "Source comparison" })).toBeInTheDocument();
    expect(screen.getByText("Average")).toBeInTheDocument();
    expect(screen.getByText("68.0°F")).toBeInTheDocument();
    expect(screen.getByText("1.0 in")).toBeInTheDocument();
    expect(screen.getByText("10.0 mph")).toBeInTheDocument();
  });
});

function day(
  date: string,
  temperatureMax: number,
  temperatureMin: number,
  precipitation: number,
  windMax: number
): WeatherDay {
  return {
    apparentTemperatureMax: temperatureMax + 1,
    apparentTemperatureMin: temperatureMin - 1,
    date,
    temperatureMax,
    temperatureMin,
    precipitation,
    precipitationProbability: 40,
    weatherCode: precipitation > 0 ? 61 : 1,
    windMax
  };
}
