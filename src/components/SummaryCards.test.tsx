import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SummaryCards } from "./SummaryCards.jsx";
import { translations } from "../i18n.js";

describe("SummaryCards", () => {
  it("renders averaged values for the first forecast day", () => {
    render(
      <SummaryCards
        t={translations.pl}
        days={[
          {
            date: "2026-05-11",
            temperatureMax: 20.32,
            temperatureMin: 11.12,
            precipitation: 7.08,
            precipitationProbability: 50,
            windMax: 18.44
          }
        ]}
      />
    );

    expect(screen.getByText("20.3°C")).toBeInTheDocument();
    expect(screen.getByText("11.1°C")).toBeInTheDocument();
    expect(screen.getByText("7.1 mm")).toBeInTheDocument();
    expect(screen.getByText("18.4 km/h")).toBeInTheDocument();
  });

  it("renders placeholders when there is no forecast day yet", () => {
    render(<SummaryCards days={[]} t={translations.en} />);

    expect(screen.getAllByText("-")).toHaveLength(4);
  });
});
