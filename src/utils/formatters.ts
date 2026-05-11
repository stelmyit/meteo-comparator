import type { LocationResult } from "../types/weather.js";
import type { Language } from "../i18n.js";

export function formatLocation(
  location: Pick<LocationResult, "name" | "admin1" | "country">
): string {
  return [location.name, location.admin1, location.country].filter(Boolean).join(", ");
}

export function formatTemperature(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(1)}°C` : "-";
}

export function formatMillimeters(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(1)} mm` : "-";
}

export function formatPercent(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(0)}%` : "-";
}

export function formatWind(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(1)} km/h` : "-";
}

export function formatSourceCount(count: number, language: Language): string {
  if (language === "en") {
    return count === 1 ? "1 source" : `${count} sources`;
  }

  if (count === 1) {
    return "1 źródło";
  }

  if (count > 1 && count < 5) {
    return `${count} źródła`;
  }

  return `${count} źródeł`;
}

export function formatShortDate(date: string, language: Language): string {
  return new Intl.DateTimeFormat(language === "pl" ? "pl-PL" : "en-US", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(`${date}T12:00:00`));
}

export function formatDateTime(date: string, language: Language): string {
  return new Intl.DateTimeFormat(language === "pl" ? "pl-PL" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
}
