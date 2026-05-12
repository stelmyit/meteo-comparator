import { chartMetricKeys } from "../types/chart.js";
import type { ChartMetricKey } from "../types/chart.js";
import type { ForecastComparison, WeatherDay } from "../types/weather.js";

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
  selectedDay: string
): string {
  const rows = [
    [
      "date",
      "sourceId",
      "sourceName",
      "locationLabel",
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
        ...metrics.map((metric) => formatMetricValue(day, metric)),
        typeof day.weatherCode === "number" ? String(day.weatherCode) : ""
      ]);
    }
  }

  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}

export function buildForecastExportPayload(
  forecast: ForecastComparison,
  metrics: ChartMetricKey[],
  selectedDay: string
): Record<string, unknown> {
  return {
    exportedAt: new Date().toISOString(),
    location: forecast.location,
    selectedDay,
    metrics,
    average: filterDays(forecast.average, selectedDay),
    sources: forecast.sources.map((source) => ({
      id: source.id,
      name: source.name,
      updatedAt: source.updatedAt,
      days: filterDays(source.days, selectedDay).map((day) => pickMetrics(day, metrics))
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
  metrics: ChartMetricKey[]
): Partial<WeatherDay> & Pick<WeatherDay, "date" | "weatherCode"> {
  const picked: Partial<WeatherDay> & Pick<WeatherDay, "date" | "weatherCode"> = {
    date: day.date,
    weatherCode: day.weatherCode
  };

  for (const metric of chartMetricKeys) {
    if (!metrics.includes(metric)) {
      continue;
    }

    picked[metric] = day[metric];
  }

  return picked;
}

function formatMetricValue(day: WeatherDay, metric: ChartMetricKey): string {
  const value = day[metric];
  return typeof value === "number" ? String(value) : "";
}

function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}
