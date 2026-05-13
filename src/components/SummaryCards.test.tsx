import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SummaryCards } from "./SummaryCards.jsx";
import { translations } from "../i18n.js";

describe("SummaryCards", () => {
  it("renders averaged values for the first forecast day in metric units", () => {
    render(
      <SummaryCards
        days={[
          {
            apparentTemperatureMax: 21.32,
            apparentTemperatureMin: 10.12,
            date: "2026-05-11",
            temperatureMax: 20.32,
            temperatureMin: 11.12,
            precipitation: 7.08,
            precipitationProbability: 50,
            weatherCode: 61,
            windMax: 18.44
          }
        ]}
        language="pl"
        metrics={["temperatureMax", "temperatureMin", "precipitation", "windMax"]}
        t={translations.pl}
        units="metric"
      />
    );

    expect(screen.getByText("20.3°C")).toBeInTheDocument();
    expect(screen.getByText("11.1°C")).toBeInTheDocument();
    expect(screen.getByText("7.1 mm")).toBeInTheDocument();
    expect(screen.getByText("18.4 km/h")).toBeInTheDocument();
  });

  it("renders imperial values when selected", () => {
    render(
      <SummaryCards
        days={[
          {
            apparentTemperatureMax: 21.32,
            apparentTemperatureMin: 10.12,
            date: "2026-05-11",
            temperatureMax: 20,
            temperatureMin: 10,
            precipitation: 25.4,
            precipitationProbability: 50,
            weatherCode: 61,
            windMax: 16.09344
          }
        ]}
        language="en"
        metrics={["temperatureMax", "precipitation", "windMax"]}
        t={translations.en}
        units="imperial"
      />
    );

    expect(screen.getByText("68.0°F")).toBeInTheDocument();
    expect(screen.getByText("1.0 in")).toBeInTheDocument();
    expect(screen.getByText("10.0 mph")).toBeInTheDocument();
  });
});
