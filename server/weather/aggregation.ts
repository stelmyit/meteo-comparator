import type { WeatherDay, WeatherSource } from "./types.js";

type AverageBucket = {
  date: string;
  temperatureMax: number[];
  temperatureMin: number[];
  precipitation: number[];
  precipitationProbability: number[];
  windMax: number[];
};

export function averageForecasts(sources: WeatherSource[]): WeatherDay[] {
  const byDate = new Map<string, AverageBucket>();

  for (const source of sources) {
    for (const day of source.days) {
      const bucket = byDate.get(day.date) ?? {
        date: day.date,
        temperatureMax: [],
        temperatureMin: [],
        precipitation: [],
        precipitationProbability: [],
        windMax: []
      };

      pushIfNumber(bucket.temperatureMax, day.temperatureMax);
      pushIfNumber(bucket.temperatureMin, day.temperatureMin);
      pushIfNumber(bucket.precipitation, day.precipitation);
      pushIfNumber(bucket.precipitationProbability, day.precipitationProbability);
      pushIfNumber(bucket.windMax, day.windMax);
      byDate.set(day.date, bucket);
    }
  }

  return [...byDate.values()].slice(0, 7).map((bucket) => ({
    date: bucket.date,
    temperatureMax: average(bucket.temperatureMax),
    temperatureMin: average(bucket.temperatureMin),
    precipitation: average(bucket.precipitation),
    precipitationProbability: average(bucket.precipitationProbability),
    windMax: average(bucket.windMax)
  }));
}

export function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function numberOrNull(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? round(value) : null;
}

function pushIfNumber(items: number[], value: number | null | undefined): void {
  if (typeof value === "number" && Number.isFinite(value)) {
    items.push(value);
  }
}

function average(items: number[]): number | null {
  return items.length ? round(items.reduce((sum, value) => sum + value, 0) / items.length) : null;
}
