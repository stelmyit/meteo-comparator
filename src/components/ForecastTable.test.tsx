import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ForecastTable } from "./ForecastTable.jsx";
import { translations } from "../i18n.js";
import type { WeatherDay } from "../types/weather.js";

describe("ForecastTable", () => {
  it("renders average and source rows", () => {
    render(
      <ForecastTable
        language="pl"
        t={translations.pl}
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
      />
    );

    expect(screen.getByRole("heading", { name: "Porównanie źródeł" })).toBeInTheDocument();
    expect(screen.getByText("Średnia")).toBeInTheDocument();
    expect(screen.getByText("Open-Meteo")).toBeInTheDocument();
    expect(screen.getByText((text) => text.includes("21.0°C / 11.0°C"))).toBeInTheDocument();
  });

  it("renders English labels when selected", () => {
    render(
      <ForecastTable
        language="en"
        t={translations.en}
        forecast={{
          location: { label: "Warsaw", latitude: 52.2, longitude: 21 },
          generatedAt: "2026-05-11T10:00:00Z",
          failedSources: [],
          average: [day("2026-05-11", 20, 10, 1, 12)],
          sources: []
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "Source comparison" })).toBeInTheDocument();
    expect(screen.getByText("Average")).toBeInTheDocument();
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
    date,
    temperatureMax,
    temperatureMin,
    precipitation,
    precipitationProbability: 40,
    windMax
  };
}
