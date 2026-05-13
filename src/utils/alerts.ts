import type { WeatherDay } from "../types/weather.js";

export type ForecastAlertKind = "heat" | "cold" | "rain" | "wind";

export type ForecastAlert = {
  date: string;
  kind: ForecastAlertKind;
  severity: "info" | "warning";
};

export function buildForecastAlerts(days: WeatherDay[]): ForecastAlert[] {
  return days.flatMap((day) => {
    const alerts: ForecastAlert[] = [];

    if (typeof day.temperatureMax === "number" && day.temperatureMax >= 30) {
      alerts.push({ date: day.date, kind: "heat", severity: "warning" });
    }

    if (typeof day.temperatureMin === "number" && day.temperatureMin <= 3) {
      alerts.push({ date: day.date, kind: "cold", severity: "info" });
    }

    if (
      (typeof day.precipitationProbability === "number" && day.precipitationProbability >= 70) ||
      (typeof day.precipitation === "number" && day.precipitation >= 10)
    ) {
      alerts.push({ date: day.date, kind: "rain", severity: "warning" });
    }

    if (typeof day.windMax === "number" && day.windMax >= 35) {
      alerts.push({ date: day.date, kind: "wind", severity: "warning" });
    }

    return alerts;
  });
}
