import type { WeatherDay, WeatherSource } from "./types.js";

type AverageBucket = {
  apparentTemperatureMax: number[];
  apparentTemperatureMin: number[];
  date: string;
  temperatureMax: number[];
  temperatureMin: number[];
  precipitation: number[];
  precipitationProbability: number[];
  weatherCode: number[];
  windMax: number[];
};

export function averageForecasts(sources: WeatherSource[]): WeatherDay[] {
  const byDate = new Map<string, AverageBucket>();

  for (const source of sources) {
    for (const day of source.days) {
      const bucket = byDate.get(day.date) ?? {
        apparentTemperatureMax: [],
        apparentTemperatureMin: [],
        date: day.date,
        temperatureMax: [],
        temperatureMin: [],
        precipitation: [],
        precipitationProbability: [],
        weatherCode: [],
        windMax: []
      };

      pushIfNumber(bucket.apparentTemperatureMax, day.apparentTemperatureMax);
      pushIfNumber(bucket.apparentTemperatureMin, day.apparentTemperatureMin);
      pushIfNumber(bucket.temperatureMax, day.temperatureMax);
      pushIfNumber(bucket.temperatureMin, day.temperatureMin);
      pushIfNumber(bucket.precipitation, day.precipitation);
      pushIfNumber(bucket.precipitationProbability, day.precipitationProbability);
      pushIfNumber(bucket.weatherCode, day.weatherCode);
      pushIfNumber(bucket.windMax, day.windMax);
      byDate.set(day.date, bucket);
    }
  }

  return [...byDate.values()].slice(0, 7).map((bucket) => ({
    apparentTemperatureMax: average(bucket.apparentTemperatureMax),
    apparentTemperatureMin: average(bucket.apparentTemperatureMin),
    date: bucket.date,
    temperatureMax: average(bucket.temperatureMax),
    temperatureMin: average(bucket.temperatureMin),
    precipitation: average(bucket.precipitation),
    precipitationProbability: average(bucket.precipitationProbability),
    weatherCode: dominantWeatherCode(bucket.weatherCode),
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
