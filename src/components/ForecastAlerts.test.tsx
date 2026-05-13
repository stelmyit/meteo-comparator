import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ForecastAlerts } from "./ForecastAlerts.jsx";
import { translations } from "../i18n.js";
import type { ForecastComparison } from "../types/weather.js";

describe("ForecastAlerts", () => {
  it("renders forecast alerts when thresholds are exceeded", () => {
    render(<ForecastAlerts forecast={forecast()} language="pl" t={translations.pl} />);

    expect(screen.getByRole("heading", { name: "Alerty pogodowe" })).toBeInTheDocument();
    expect(screen.getByText("Upal lub bardzo cieply dzien")).toBeInTheDocument();
    expect(screen.getByText("Mozliwy silniejszy wiatr")).toBeInTheDocument();
  });
});

function forecast(): ForecastComparison {
  return {
    generatedAt: "2026-05-11T10:00:00Z",
    location: { label: "Warszawa", latitude: 52.2, longitude: 21 },
    failedSources: [],
    average: [
      {
        apparentTemperatureMax: 32,
        apparentTemperatureMin: 14,
        date: "2026-05-15",
        precipitation: 0,
        precipitationProbability: 10,
        temperatureMax: 31,
        temperatureMin: 13,
        weatherCode: 1,
        windMax: 14
      },
      {
        apparentTemperatureMax: 21,
        apparentTemperatureMin: 8,
        date: "2026-05-16",
        precipitation: 0,
        precipitationProbability: 15,
        temperatureMax: 20,
        temperatureMin: 8,
        weatherCode: 1,
        windMax: 40
      }
    ],
    sources: []
  };
}
