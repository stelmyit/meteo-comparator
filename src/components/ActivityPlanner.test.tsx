import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ActivityPlanner } from "./ActivityPlanner.jsx";
import { translations } from "../i18n.js";
import type { ForecastComparison } from "../types/weather.js";

describe("ActivityPlanner", () => {
  it("renders activity recommendations", () => {
    render(<ActivityPlanner forecast={forecast()} language="pl" t={translations.pl} />);

    expect(screen.getByText("Na spacer")).toBeInTheDocument();
    expect(screen.getByText("Na aktywnosc na zewnatrz")).toBeInTheDocument();
    expect(screen.getByText("Na krotki wyjazd")).toBeInTheDocument();
  });

  it("returns nothing when the forecast has no usable days", () => {
    const { container } = render(
      <ActivityPlanner
        forecast={{
          generatedAt: "2026-05-11T10:00:00Z",
          location: { label: "Warszawa", latitude: 52.2, longitude: 21 },
          failedSources: [],
          average: [],
          sources: []
        }}
        language="pl"
        t={translations.pl}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});

function forecast(): ForecastComparison {
  return {
    generatedAt: "2026-05-11T10:00:00Z",
    location: { label: "Warszawa", latitude: 52.2, longitude: 21 },
    failedSources: [],
    average: [
      day("2026-05-15", 17, 0, 20, 10),
      day("2026-05-16", 22, 0, 10, 5),
      day("2026-05-17", 25, 2, 35, 16)
    ],
    sources: []
  };
}

function day(
  date: string,
  temperatureMax: number,
  precipitation: number,
  precipitationProbability: number,
  windMax: number
) {
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
