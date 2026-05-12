import { formatLocation } from "../utils/formatters.js";
import type { LocationResult } from "../types/weather.js";

type LocationPickerProps = {
  locations: LocationResult[];
  onSelect: (location: LocationResult) => void | Promise<void>;
};

export function LocationPicker({ locations, onSelect }: LocationPickerProps) {
  return (
    <section className="location-list" aria-label="Wyniki wyszukiwania">
      {locations.map((location) => (
        <button
          className="location-button"
          key={`${location.id}-${location.latitude}-${location.longitude}`}
          type="button"
          onClick={() => onSelect(location)}
        >
          {formatLocation(location)}
        </button>
      ))}
    </section>
  );
}
