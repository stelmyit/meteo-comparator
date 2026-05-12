import { describe, expect, it } from "vitest";

import { readUrlState, writeUrlState } from "./urlState.js";

describe("urlState", () => {
  it("reads language, query and selected location from URL", () => {
    window.history.replaceState(
      {},
      "",
      "/?lang=en&q=Gdansk&day=2026-05-12&metric=windMax&lat=54.35&lon=18.65&label=Gdansk%2C%20Poland"
    );

    expect(readUrlState()).toEqual({
      language: "en",
      query: "Gdansk",
      day: "2026-05-12",
      metric: "windMax",
      metrics: [
        "temperatureMax",
        "temperatureMin",
        "apparentTemperatureMax",
        "precipitation",
        "precipitationProbability",
        "windMax"
      ],
      selectedLocation: {
        id: "54.35,18.65",
        name: "Gdansk, Poland",
        latitude: 54.35,
        longitude: 18.65
      },
      sourceIds: null
    });
  });

  it("writes shareable search state to the URL", () => {
    window.history.replaceState({}, "", "/");

    writeUrlState({
      language: "pl",
      day: "2026-05-11",
      metric: "precipitationProbability",
      query: "Warszawa",
      location: {
        id: 1,
        name: "Warszawa",
        admin1: "Województwo mazowieckie",
        country: "Polska",
        latitude: 52.22977,
        longitude: 21.01178
      }
    });

    const params = new URLSearchParams(window.location.search);

    expect(params.get("lang")).toBe("pl");
    expect(params.get("q")).toBe("Warszawa");
    expect(params.get("day")).toBe("2026-05-11");
    expect(params.get("metric")).toBe("precipitationProbability");
    expect(params.get("lat")).toBe("52.22977");
    expect(params.get("lon")).toBe("21.01178");
    expect(params.get("label")).toBe("Warszawa, Województwo mazowieckie, Polska");
  });
});
