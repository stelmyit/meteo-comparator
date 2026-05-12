import { describe, expect, it } from "vitest";

import {
  formatLocation,
  formatMillimeters,
  formatSourceCount,
  formatTemperature,
  formatWind
} from "./formatters.js";

describe("formatters", () => {
  it("formats complete and partial locations", () => {
    expect(
      formatLocation({
        name: "Warszawa",
        admin1: "Wojewodztwo mazowieckie",
        country: "Polska"
      })
    ).toBe("Warszawa, Wojewodztwo mazowieckie, Polska");

    expect(formatLocation({ name: "Gdansk", country: "Polska" })).toBe("Gdansk, Polska");
  });

  it("formats numeric weather values", () => {
    expect(formatTemperature(19.34)).toBe("19.3°C");
    expect(formatMillimeters(2)).toBe("2.0 mm");
    expect(formatWind(14.82)).toBe("14.8 km/h");
  });

  it("uses placeholders for missing values", () => {
    expect(formatTemperature(null)).toBe("-");
    expect(formatMillimeters(undefined)).toBe("-");
    expect(formatWind(Number.NaN)).toBe("-");
  });

  it("formats Polish source count labels", () => {
    expect(formatSourceCount(1, "pl")).toBe("1 zrodlo");
    expect(formatSourceCount(2, "pl")).toBe("2 zrodla");
    expect(formatSourceCount(5, "pl")).toBe("5 zrodel");
    expect(formatSourceCount(1, "en")).toBe("1 source");
    expect(formatSourceCount(2, "en")).toBe("2 sources");
  });
});
