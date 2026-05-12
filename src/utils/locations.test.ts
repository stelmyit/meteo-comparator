import { describe, expect, it } from "vitest";

import {
  createStoredLocation,
  pushRecentLocation,
  readRecentLocations,
  readSavedLocations,
  toggleSavedLocation,
  writeRecentLocations,
  writeSavedLocations
} from "./locations.js";

describe("location storage utilities", () => {
  it("stores saved locations and toggles duplicates", () => {
    const warsaw = createStoredLocation({
      admin1: "Mazowieckie",
      country: "Poland",
      latitude: 52.23,
      longitude: 21.01,
      name: "Warsaw"
    });

    const saved = toggleSavedLocation([], warsaw);
    writeSavedLocations(saved);

    expect(readSavedLocations()).toEqual(saved);
    expect(toggleSavedLocation(saved, warsaw)).toEqual([]);
  });

  it("keeps recent locations unique and ordered", () => {
    const warsaw = createStoredLocation({
      country: "Poland",
      latitude: 52.23,
      longitude: 21.01,
      name: "Warsaw"
    });
    const gdansk = createStoredLocation({
      country: "Poland",
      latitude: 54.35,
      longitude: 18.65,
      name: "Gdansk"
    });

    const recents = pushRecentLocation(pushRecentLocation([warsaw], gdansk), warsaw);
    writeRecentLocations(recents);

    expect(readRecentLocations()).toEqual([warsaw, gdansk]);
  });
});
