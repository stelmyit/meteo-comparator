import type { Translations } from "../i18n.js";
import type { StoredLocation } from "../utils/locations.js";

type LocationCollectionsProps = {
  onRemoveSaved: (id: string) => void;
  onSelect: (location: StoredLocation) => void;
  savedLocations: StoredLocation[];
  recentLocations: StoredLocation[];
  t: Translations;
};

export function LocationCollections({
  onRemoveSaved,
  onSelect,
  savedLocations,
  recentLocations,
  t
}: LocationCollectionsProps) {
  if (!savedLocations.length && !recentLocations.length) {
    return null;
  }

  return (
    <section className="collections" aria-label={t.savedLocations}>
      {savedLocations.length ? (
        <div className="collection-block">
          <div className="collection-heading">{t.savedLocations}</div>
          <div className="collection-chips">
            {savedLocations.map((location) => (
              <div className="collection-chip" key={location.id}>
                <button
                  className="collection-chip-button"
                  onClick={() => onSelect(location)}
                  type="button"
                >
                  {location.label}
                </button>
                <button
                  aria-label={`${t.removeLocation}: ${location.label}`}
                  className="collection-chip-remove"
                  onClick={() => onRemoveSaved(location.id)}
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {recentLocations.length ? (
        <div className="collection-block">
          <div className="collection-heading">{t.recentLocations}</div>
          <div className="collection-chips">
            {recentLocations.map((location) => (
              <button
                className="collection-chip-button secondary"
                key={location.id}
                onClick={() => onSelect(location)}
                type="button"
              >
                {location.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
