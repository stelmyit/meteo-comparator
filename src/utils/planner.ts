import type { WeatherDay } from "../types/weather.js";

export type PlannerActivity = "walk" | "outdoor" | "trip";

export type PlannerRecommendation = {
  activity: PlannerActivity;
  date: string;
  score: number;
};

export function buildPlannerRecommendations(days: WeatherDay[]): PlannerRecommendation[] {
  return [
    pickBestDay(days, "walk"),
    pickBestDay(days, "outdoor"),
    pickBestDay(days, "trip")
  ].filter((item): item is PlannerRecommendation => item !== null);
}

function pickBestDay(days: WeatherDay[], activity: PlannerActivity): PlannerRecommendation | null {
  const candidates = days.filter((day) => isUsableDay(day));

  if (!candidates.length) {
    return null;
  }

  const first = candidates[0];
  if (!first) {
    return null;
  }

  const best = candidates.reduce((selected, day) => {
    return scoreDay(day, activity) > scoreDay(selected, activity) ? day : selected;
  }, first);

  return {
    activity,
    date: best.date,
    score: scoreDay(best, activity)
  };
}

function isUsableDay(day: WeatherDay): boolean {
  return (
    typeof day.temperatureMax === "number" &&
    typeof day.windMax === "number" &&
    typeof day.precipitation === "number"
  );
}

function scoreDay(day: WeatherDay, activity: PlannerActivity): number {
  const temp = day.temperatureMax ?? 0;
  const wind = day.windMax ?? 0;
  const precipitation = day.precipitation ?? 0;
  const rainChance = day.precipitationProbability ?? 0;

  if (activity === "walk") {
    return closeness(temp, 21, 14) - precipitation * 5 - wind * 0.7 - rainChance * 0.12;
  }

  if (activity === "outdoor") {
    return closeness(temp, 18, 16) - precipitation * 6 - wind * 1.1 - rainChance * 0.15;
  }

  return closeness(temp, 23, 18) - precipitation * 4 - wind * 0.5 - rainChance * 0.08;
}

function closeness(value: number, ideal: number, tolerance: number): number {
  return 30 - (Math.abs(value - ideal) / tolerance) * 20;
}
