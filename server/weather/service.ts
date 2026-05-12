import { averageForecasts } from "./aggregation.js";
import {
  getDwdIconForecast,
  getEcmwfForecast,
  getMetNorwayForecast,
  getOpenMeteoForecast
} from "./providers.js";
import type { ForecastComparison } from "./types.js";

type ForecastComparisonInput = {
  latitude: number;
  longitude: number;
  label: string;
};

export async function getForecastComparison({
  latitude,
  longitude,
  label
}: ForecastComparisonInput): Promise<ForecastComparison> {
  const providers = await Promise.allSettled([
    getOpenMeteoForecast(latitude, longitude),
    getDwdIconForecast(latitude, longitude),
    getEcmwfForecast(latitude, longitude),
    getMetNorwayForecast(latitude, longitude)
  ]);

  const sources = providers
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);

  const failedSources = providers
    .filter((result) => result.status === "rejected")
    .map((result) =>
      result.reason instanceof Error ? result.reason.message : "Nieznany błąd źródła"
    );

  return {
    location: { label, latitude, longitude },
    generatedAt: new Date().toISOString(),
    sources,
    average: averageForecasts(sources),
    failedSources
  };
}
