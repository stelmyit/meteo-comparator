import type { Language } from "../i18n.js";
import { isChartMetricKey } from "../types/chart.js";
import type { ChartMetricKey } from "../types/chart.js";
import type { LocationResult } from "../types/weather.js";

export type UrlState = {
  day: string;
  language: Language;
  metric: ChartMetricKey;
  query: string;
  selectedLocation: LocationResult | null;
};

const defaultQuery = "Warszawa";
const defaultMetric: ChartMetricKey = "temperatureMax";

export function readUrlState(): UrlState {
  const params = new URLSearchParams(window.location.search);
  const language = params.get("lang") === "en" ? "en" : "pl";
  const query = params.get("q")?.trim() || defaultQuery;
  const latitude = Number(params.get("lat"));
  const longitude = Number(params.get("lon"));
  const label = params.get("label")?.trim();
  const day = params.get("day")?.trim() ?? "";
  const metric = params.get("metric");

  return {
    day,
    language,
    metric: isChartMetricKey(metric) ? metric : defaultMetric,
    query,
    selectedLocation:
      Number.isFinite(latitude) && Number.isFinite(longitude) && label
        ? {
            id: `${latitude},${longitude}`,
            name: label,
            latitude,
            longitude
          }
        : null
  };
}

export function writeUrlState({
  language,
  location,
  metric,
  day,
  query
}: {
  day?: string;
  language: Language;
  location?: LocationResult | null;
  metric?: ChartMetricKey;
  query: string;
}): void {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", language);
  url.searchParams.set("q", query.trim() || defaultQuery);
  url.searchParams.set("metric", metric ?? defaultMetric);

  if (day) {
    url.searchParams.set("day", day);
  } else {
    url.searchParams.delete("day");
  }

  if (location) {
    url.searchParams.set("lat", String(location.latitude));
    url.searchParams.set("lon", String(location.longitude));
    url.searchParams.set("label", formatUrlLocationLabel(location));
  } else {
    url.searchParams.delete("lat");
    url.searchParams.delete("lon");
    url.searchParams.delete("label");
  }

  window.history.replaceState({}, "", `${url.pathname}?${url.searchParams.toString()}`);
}

export function formatUrlLocationLabel(location: LocationResult): string {
  return [location.name, location.admin1, location.country].filter(Boolean).join(", ");
}
