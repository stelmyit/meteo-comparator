import { formatMillimeters, formatPercent, formatTemperature, formatWind } from "./formatters.js";
import type { Translations } from "../i18n.js";
import type { ChartMetricKey } from "../types/chart.js";
import type { WeatherDay } from "../types/weather.js";

export function getMetricLabel(metric: ChartMetricKey, t: Translations): string {
  const labels: Record<ChartMetricKey, string> = {
    temperatureMax: t.metricTemperatureMax,
    temperatureMin: t.metricTemperatureMin,
    apparentTemperatureMax: t.metricApparentTemperature,
    precipitation: t.metricPrecipitation,
    precipitationProbability: t.metricPrecipitationProbability,
    windMax: t.metricWind
  };

  return labels[metric];
}

export function getMetricDetail(metric: ChartMetricKey, t: Translations): string {
  const details: Record<ChartMetricKey, string> = {
    temperatureMax: t.todayAverage,
    temperatureMin: t.todayAverage,
    apparentTemperatureMax: t.max,
    precipitation: t.dailySum,
    precipitationProbability: t.max,
    windMax: t.max
  };

  return details[metric];
}

export function formatMetricValue(metric: ChartMetricKey, day: Partial<WeatherDay>): string {
  const value = day[metric];

  if (metric === "precipitation") {
    return formatMillimeters(value);
  }

  if (metric === "precipitationProbability") {
    return formatPercent(value);
  }

  if (metric === "windMax") {
    return formatWind(value);
  }

  return formatTemperature(value);
}
