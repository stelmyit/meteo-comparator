import type { ApiError, ForecastComparison, LocationResult } from "../types/weather.js";

export async function fetchLocations(query: string): Promise<LocationResult[]> {
  const data = await fetchJson<{ results: LocationResult[] }>(
    `/api/geocode?q=${encodeURIComponent(query)}`
  );
  return data.results;
}

export async function fetchForecast(
  location: Pick<LocationResult, "latitude" | "longitude">,
  label: string
): Promise<ForecastComparison> {
  const url = `/api/forecast?lat=${location.latitude}&lon=${location.longitude}&label=${encodeURIComponent(
    label
  )}`;

  return fetchJson(url);
}

async function fetchJson<T = ApiError & Record<string, unknown>>(url: string): Promise<T> {
  const response = await fetch(url);
  const data = (await response.json()) as T & ApiError;

  if (!response.ok) {
    throw new Error(data.error ?? "Wystąpił błąd pobierania danych.");
  }

  return data;
}
