import { chartMetricKeys } from "../types/chart.js";
import type { ChartMetricKey } from "../types/chart.js";
import type { ForecastComparison, WeatherDay } from "../types/weather.js";
import { convertPrecipitation, convertTemperature, convertWind } from "./units.js";
import type { UnitSystem } from "./units.js";

const exportMetricLabels: Record<ChartMetricKey, string> = {
  apparentTemperatureMax: "apparentTemperatureMax",
  precipitation: "precipitation",
  precipitationProbability: "precipitationProbability",
  temperatureMax: "temperatureMax",
  temperatureMin: "temperatureMin",
  windMax: "windMax"
};

export function buildForecastCsv(
  forecast: ForecastComparison,
  metrics: ChartMetricKey[],
  selectedDay: string,
  units: UnitSystem
): string {
  const rows = [
    [
      "date",
      "sourceId",
      "sourceName",
      "locationLabel",
      "units",
      ...metrics.map((metric) => exportMetricLabels[metric]),
      "weatherCode"
    ]
  ];

  for (const source of forecast.sources) {
    for (const day of source.days) {
      if (selectedDay && day.date !== selectedDay) {
        continue;
      }

      rows.push([
        day.date,
        source.id,
        source.name,
        forecast.location.label,
        units,
        ...metrics.map((metric) => formatMetricValue(day, metric, units)),
        typeof day.weatherCode === "number" ? String(day.weatherCode) : ""
      ]);
    }
  }

  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}

export function buildForecastExportPayload(
  forecast: ForecastComparison,
  metrics: ChartMetricKey[],
  selectedDay: string,
  units: UnitSystem
): Record<string, unknown> {
  return {
    exportedAt: new Date().toISOString(),
    location: forecast.location,
    selectedDay,
    metrics,
    units,
    average: filterDays(forecast.average, selectedDay).map((day) => pickMetrics(day, metrics, units)),
    sources: forecast.sources.map((source) => ({
      id: source.id,
      name: source.name,
      updatedAt: source.updatedAt,
      days: filterDays(source.days, selectedDay).map((day) => pickMetrics(day, metrics, units))
    }))
  };
}

export function getExportFileBaseName(forecast: ForecastComparison, selectedDay: string): string {
  const safeLabel = forecast.location.label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = selectedDay || "all-days";

  return `forecast-${safeLabel || "location"}-${suffix}`;
}

function filterDays(days: WeatherDay[], selectedDay: string): WeatherDay[] {
  return selectedDay ? days.filter((day) => day.date === selectedDay) : days;
}

function pickMetrics(
  day: WeatherDay,
  metrics: ChartMetricKey[],
  units: UnitSystem
): Record<string, number | string> {
  const picked: Record<string, number | string> = {
    date: day.date,
    weatherCode: day.weatherCode ?? ""
  };

  for (const metric of chartMetricKeys) {
    if (!metrics.includes(metric)) {
      continue;
    }

    picked[metric] = normalizeValue(day[metric], metric, units) ?? "";
  }

  return picked;
}

function formatMetricValue(day: WeatherDay, metric: ChartMetricKey, units: UnitSystem): string {
  const value = normalizeValue(day[metric], metric, units);
  return typeof value === "number" ? String(Number(value.toFixed(2))) : "";
}

function normalizeValue(
  value: number | null | undefined,
  metric: ChartMetricKey,
  units: UnitSystem
) {
  if (typeof value !== "number" || !Number.isFinite(value) || units === "metric") {
    return value;
  }

  if (
    metric === "temperatureMax" ||
    metric === "temperatureMin" ||
    metric === "apparentTemperatureMax"
  ) {
    return convertTemperature(value);
  }

  if (metric === "precipitation") {
    return convertPrecipitation(value);
  }

  if (metric === "windMax") {
    return convertWind(value);
  }

  return value;
}

function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}
