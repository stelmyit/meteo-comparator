import { fetchJson } from "./http.js";
import type { LocationResult, OpenMeteoGeocodingResponse } from "./types.js";

export async function searchLocations(query: string): Promise<LocationResult[]> {
  const searchUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  searchUrl.searchParams.set("name", query);
  searchUrl.searchParams.set("count", "6");
  searchUrl.searchParams.set("language", "pl");
  searchUrl.searchParams.set("format", "json");

  const data = await fetchJson<OpenMeteoGeocodingResponse>(searchUrl);

  return (data.results ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    country: item.country,
    admin1: item.admin1,
    latitude: item.latitude,
    longitude: item.longitude,
    timezone: item.timezone
  }));
}
