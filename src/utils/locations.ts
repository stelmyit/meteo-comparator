import { formatLocation } from "./formatters.js";
import type { ForecastComparison, LocationResult } from "../types/weather.js";

const savedLocationsKey = "meteoComparator.savedLocations";
const recentLocationsKey = "meteoComparator.recentLocations";
const recentLocationsLimit = 5;
const savedLocationsLimit = 8;

export type StoredLocation = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  name: string;
};

export function createStoredLocation(
  location: Pick<LocationResult, "name" | "latitude" | "longitude" | "admin1" | "country">
): StoredLocation {
  const label = formatLocation(location);

  return {
    id: `${location.latitude},${location.longitude},${label}`,
    label,
    latitude: location.latitude,
    longitude: location.longitude,
    name: location.name
  };
}

export function createStoredLocationFromForecast(forecast: ForecastComparison): StoredLocation {
  return {
    id: `${forecast.location.latitude},${forecast.location.longitude},${forecast.location.label}`,
    label: forecast.location.label,
    latitude: forecast.location.latitude,
    longitude: forecast.location.longitude,
    name: forecast.location.label.split(",")[0] ?? forecast.location.label
  };
}

export function readSavedLocations(): StoredLocation[] {
  return readLocationsFromStorage(savedLocationsKey);
}

export function readRecentLocations(): StoredLocation[] {
  return readLocationsFromStorage(recentLocationsKey);
}

export function writeSavedLocations(locations: StoredLocation[]): void {
  window.localStorage.setItem(
    savedLocationsKey,
    JSON.stringify(locations.slice(0, savedLocationsLimit))
  );
}

export function writeRecentLocations(locations: StoredLocation[]): void {
  window.localStorage.setItem(
    recentLocationsKey,
    JSON.stringify(locations.slice(0, recentLocationsLimit))
  );
}

export function toggleSavedLocation(
  current: StoredLocation[],
  location: StoredLocation
): StoredLocation[] {
  if (current.some((item) => item.id === location.id)) {
    return current.filter((item) => item.id !== location.id);
  }

  return [location, ...current.filter((item) => item.id !== location.id)].slice(
    0,
    savedLocationsLimit
  );
}

export function pushRecentLocation(
  current: StoredLocation[],
  location: StoredLocation
): StoredLocation[] {
  return [location, ...current.filter((item) => item.id !== location.id)].slice(
    0,
    recentLocationsLimit
  );
}

export function storedLocationToLocationResult(location: StoredLocation): LocationResult {
  return {
    id: location.id,
    latitude: location.latitude,
    longitude: location.longitude,
    name: location.name
  };
}

function readLocationsFromStorage(key: string): StoredLocation[] {
  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isStoredLocation);
  } catch {
    return [];
  }
}

function isStoredLocation(value: unknown): value is StoredLocation {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<StoredLocation>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.label === "string" &&
    typeof candidate.latitude === "number" &&
    typeof candidate.longitude === "number" &&
    typeof candidate.name === "string"
  );
}
