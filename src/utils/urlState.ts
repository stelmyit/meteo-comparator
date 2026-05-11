import type { Language } from "../i18n.js";
import { chartMetricKeys, isChartMetricKey } from "../types/chart.js";
import type { ChartMetricKey } from "../types/chart.js";
import type { LocationResult } from "../types/weather.js";

export type UrlState = {
  day: string;
  language: Language;
  metric: ChartMetricKey;
  metrics: ChartMetricKey[];
  query: string;
  selectedLocation: LocationResult | null;
  sourceIds: string[] | null;
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
  const metrics = parseMetrics(params.get("metrics"));
  const sourceIds = params.has("sources") ? parseList(params.get("sources")) : null;

  return {
    day,
    language,
    metric: isChartMetricKey(metric) ? metric : defaultMetric,
    metrics,
    query,
    selectedLocation:
      Number.isFinite(latitude) && Number.isFinite(longitude) && label
        ? {
            id: `${latitude},${longitude}`,
            name: label,
            latitude,
            longitude
          }
        : null,
    sourceIds
  };
}

export function writeUrlState({
  language,
  location,
  metric,
  metrics,
  sourceIds,
  day,
  query
}: {
  day?: string;
  language: Language;
  location?: LocationResult | null;
  metric?: ChartMetricKey;
  metrics?: ChartMetricKey[];
  query: string;
  sourceIds?: string[] | null;
}): void {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", language);
  url.searchParams.set("q", query.trim() || defaultQuery);
  url.searchParams.set("metric", metric ?? defaultMetric);
  writeListParam(url, "metrics", metrics ?? [...chartMetricKeys]);
  writeListParam(url, "sources", sourceIds);

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

function parseMetrics(value: string | null): ChartMetricKey[] {
  const metrics = parseList(value).filter(isChartMetricKey);
  return metrics.length ? metrics : [...chartMetricKeys];
}

function parseList(value: string | null): string[] {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function writeListParam(url: URL, key: string, values: string[] | null | undefined): void {
  if (values?.length) {
    url.searchParams.set(key, values.join(","));
  } else {
    url.searchParams.delete(key);
  }
}
