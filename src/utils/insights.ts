import type { ChartMetricKey } from "../types/chart.js";
import type { ForecastComparison, WeatherDay } from "../types/weather.js";

export type ConfidenceLevel = "high" | "medium" | "low";

export type DailyConfidence = {
  date: string;
  level: ConfidenceLevel;
  spread: number | null;
};

export type ForecastInsight = {
  date: string;
  label: "warmest" | "driest" | "calmest";
  value: number | null;
};

export function buildDailyConfidence(
  forecast: ForecastComparison,
  metric: ChartMetricKey
): DailyConfidence[] {
  return forecast.average.map((day) => {
    const values = forecast.sources
      .map((source) => source.days.find((item) => item.date === day.date)?.[metric])
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

    const spread = calculateSpread(values);

    return {
      date: day.date,
      level: getConfidenceLevel(metric, spread),
      spread
    };
  });
}

export function buildForecastInsights(days: WeatherDay[]): ForecastInsight[] {
  return [
    buildInsight(days, "warmest", "temperatureMax", "max"),
    buildInsight(days, "driest", "precipitation", "min"),
    buildInsight(days, "calmest", "windMax", "min")
  ].filter((item): item is ForecastInsight => item !== null);
}

export function getConfidenceSummary(levels: ConfidenceLevel[]): ConfidenceLevel {
  if (!levels.length) {
    return "medium";
  }

  const score = levels.reduce((sum, level) => sum + confidenceScore(level), 0) / levels.length;

  if (score >= 2.4) {
    return "high";
  }

  if (score >= 1.6) {
    return "medium";
  }

  return "low";
}

function buildInsight(
  days: WeatherDay[],
  label: ForecastInsight["label"],
  metric: keyof Pick<WeatherDay, "temperatureMax" | "precipitation" | "windMax">,
  mode: "max" | "min"
): ForecastInsight | null {
  const candidates = days.filter(
    (day): day is WeatherDay & Record<typeof metric, number> =>
      typeof day[metric] === "number" && Number.isFinite(day[metric])
  );

  if (!candidates.length) {
    return null;
  }

  const first = candidates[0];

  if (!first) {
    return null;
  }

  const selected = candidates.reduce((best, day) => {
    return mode === "max"
      ? day[metric] > best[metric]
        ? day
        : best
      : day[metric] < best[metric]
        ? day
        : best;
  }, first);

  return {
    date: selected.date,
    label,
    value: selected[metric]
  };
}

function calculateSpread(values: number[]): number | null {
  if (values.length < 2) {
    return null;
  }

  return Math.round((Math.max(...values) - Math.min(...values)) * 10) / 10;
}

function getConfidenceLevel(metric: ChartMetricKey, spread: number | null): ConfidenceLevel {
  if (spread === null) {
    return "medium";
  }

  const [highThreshold, mediumThreshold] = confidenceThresholds[metric];

  if (spread <= highThreshold) {
    return "high";
  }

  if (spread <= mediumThreshold) {
    return "medium";
  }

  return "low";
}

function confidenceScore(level: ConfidenceLevel): number {
  if (level === "high") {
    return 3;
  }

  if (level === "medium") {
    return 2;
  }

  return 1;
}

const confidenceThresholds: Record<ChartMetricKey, [number, number]> = {
  apparentTemperatureMax: [2.5, 5],
  precipitation: [2, 6],
  precipitationProbability: [15, 35],
  temperatureMax: [2, 4],
  temperatureMin: [2, 4],
  windMax: [8, 16]
};
