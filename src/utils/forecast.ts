import { chartMetricKeys } from "../types/chart.js";
import type { ChartMetricKey } from "../types/chart.js";
import type { ForecastComparison, WeatherDay } from "../types/weather.js";

type AverageBucket = {
  apparentTemperatureMax: number[];
  apparentTemperatureMin: number[];
  date: string;
  precipitation: number[];
  precipitationProbability: number[];
  temperatureMax: number[];
  temperatureMin: number[];
  weatherCode: number[];
  windMax: number[];
};

export const defaultVisibleMetrics: ChartMetricKey[] = [...chartMetricKeys];

export function filterForecast(
  forecast: ForecastComparison,
  selectedDay: string,
  selectedSourceIds: string[] | null
): ForecastComparison {
  const matchingSources = selectedSourceIds
    ? forecast.sources.filter((source) => selectedSourceIds.includes(source.id))
    : forecast.sources;
  const sources = matchingSources.length ? matchingSources : forecast.sources;
  const scopedForecast = {
    ...forecast,
    average: averageForecasts(sources),
    sources
  };

  if (!selectedDay) {
    return scopedForecast;
  }

  return {
    ...scopedForecast,
    average: scopedForecast.average.filter((day) => day.date === selectedDay),
    sources: scopedForecast.sources.map((source) => ({
      ...source,
      days: source.days.filter((day) => day.date === selectedDay)
    }))
  };
}

export function normalizeVisibleMetrics(metrics: ChartMetricKey[]): ChartMetricKey[] {
  const uniqueMetrics = chartMetricKeys.filter((metric) => metrics.includes(metric));
  return uniqueMetrics.length ? uniqueMetrics : defaultVisibleMetrics;
}

export function averageForecasts(sources: ForecastComparison["sources"]): WeatherDay[] {
  const byDate = new Map<string, AverageBucket>();

  for (const source of sources) {
    for (const day of source.days) {
      const bucket = byDate.get(day.date) ?? {
        apparentTemperatureMax: [],
        apparentTemperatureMin: [],
        date: day.date,
        precipitation: [],
        precipitationProbability: [],
        temperatureMax: [],
        temperatureMin: [],
        weatherCode: [],
        windMax: []
      };

      pushIfNumber(bucket.apparentTemperatureMax, day.apparentTemperatureMax);
      pushIfNumber(bucket.apparentTemperatureMin, day.apparentTemperatureMin);
      pushIfNumber(bucket.precipitation, day.precipitation);
      pushIfNumber(bucket.precipitationProbability, day.precipitationProbability);
      pushIfNumber(bucket.temperatureMax, day.temperatureMax);
      pushIfNumber(bucket.temperatureMin, day.temperatureMin);
      pushIfNumber(bucket.weatherCode, day.weatherCode);
      pushIfNumber(bucket.windMax, day.windMax);
      byDate.set(day.date, bucket);
    }
  }

  return [...byDate.values()].slice(0, 7).map((bucket) => ({
    apparentTemperatureMax: average(bucket.apparentTemperatureMax),
    apparentTemperatureMin: average(bucket.apparentTemperatureMin),
    date: bucket.date,
    precipitation: average(bucket.precipitation),
    precipitationProbability: average(bucket.precipitationProbability),
    temperatureMax: average(bucket.temperatureMax),
    temperatureMin: average(bucket.temperatureMin),
    weatherCode: dominantWeatherCode(bucket.weatherCode),
    windMax: average(bucket.windMax)
  }));
}

function pushIfNumber(items: number[], value: number | null | undefined): void {
  if (typeof value === "number" && Number.isFinite(value)) {
    items.push(value);
  }
}

function average(items: number[]): number | null {
  return items.length
    ? Math.round((items.reduce((sum, value) => sum + value, 0) / items.length) * 10) / 10
    : null;
}

function dominantWeatherCode(items: number[]): number | null {
  if (!items.length) {
    return null;
  }

  return items.reduce((highestSeverityCode, code) =>
    weatherSeverity(code) > weatherSeverity(highestSeverityCode) ? code : highestSeverityCode
  );
}

function weatherSeverity(code: number): number {
  if (code >= 95) {
    return 6;
  }

  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return 5;
  }

  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return 4;
  }

  if (code >= 45) {
    return 3;
  }

  if (code >= 3) {
    return 2;
  }

  if (code >= 1) {
    return 1;
  }

  return 0;
}
