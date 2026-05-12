import { describe, expect, it } from "vitest";

import { formatWeatherCondition, getWeatherConditionKind } from "./weatherCondition.js";

describe("weatherCondition", () => {
  it("maps WMO weather codes to visual condition kinds", () => {
    expect(getWeatherConditionKind(null)).toBe("cloudy");
    expect(getWeatherConditionKind(0)).toBe("clear");
    expect(getWeatherConditionKind(3)).toBe("cloudy");
    expect(getWeatherConditionKind(45)).toBe("fog");
    expect(getWeatherConditionKind(61)).toBe("rain");
    expect(getWeatherConditionKind(80)).toBe("rain");
    expect(getWeatherConditionKind(73)).toBe("snow");
    expect(getWeatherConditionKind(85)).toBe("snow");
    expect(getWeatherConditionKind(95)).toBe("storm");
  });

  it("formats condition labels in both supported languages", () => {
    expect(formatWeatherCondition(0, "pl")).toBe("Słonecznie");
    expect(formatWeatherCondition(61, "en")).toBe("Rain");
  });
});
