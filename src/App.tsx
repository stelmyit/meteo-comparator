import { useCallback, useEffect, useRef, useState } from "react";

import { ForecastChart } from "./components/ForecastChart.jsx";
import { ForecastInsights } from "./components/ForecastInsights.jsx";
import { ForecastTable } from "./components/ForecastTable.jsx";
import { LocationCollections } from "./components/LocationCollections.jsx";
import { LocationPicker } from "./components/LocationPicker.jsx";
import { SummaryCards } from "./components/SummaryCards.jsx";
import { getInitialStatus, languageOptions, translations } from "./i18n.js";
import { fetchForecast, fetchLocations } from "./services/weatherApi.js";
import { chartMetricKeys } from "./types/chart.js";
import { formatLocation, formatShortDate, formatSourceCount } from "./utils/formatters.js";
import {
  defaultVisibleMetrics,
  filterForecast,
  normalizeVisibleMetrics
} from "./utils/forecast.js";
import {
  createStoredLocationFromForecast,
  pushRecentLocation,
  readRecentLocations,
  readSavedLocations,
  storedLocationToLocationResult,
  toggleSavedLocation,
  writeRecentLocations,
  writeSavedLocations
} from "./utils/locations.js";
import { getMetricLabel } from "./utils/metrics.js";
import { readUrlState, writeUrlState } from "./utils/urlState.js";
import type { Language } from "./i18n.js";
import type { ChartMetricKey } from "./types/chart.js";
import type { ForecastComparison, LocationResult } from "./types/weather.js";
import type { StoredLocation } from "./utils/locations.js";

export function App() {
  const initialUrlState = useRef(readUrlState());
  const hasInitialized = useRef(false);
  const [language, setLanguage] = useState<Language>(initialUrlState.current.language);
  const t = translations[language];
  const [query, setQuery] = useState(initialUrlState.current.query);
  const [locations, setLocations] = useState<LocationResult[]>([]);
  const [forecast, setForecast] = useState<ForecastComparison | null>(null);
  const [selectedDay, setSelectedDay] = useState(initialUrlState.current.day);
  const [selectedMetrics, setSelectedMetrics] = useState<ChartMetricKey[]>(
    normalizeVisibleMetrics(initialUrlState.current.metrics)
  );
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[] | null>(
    initialUrlState.current.sourceIds
  );
  const [selectedMetric, setSelectedMetric] = useState<ChartMetricKey>(
    initialUrlState.current.metrics.includes(initialUrlState.current.metric)
      ? initialUrlState.current.metric
      : (initialUrlState.current.metrics[0] ?? defaultVisibleMetrics[0] ?? "temperatureMax")
  );
  const [savedLocations, setSavedLocations] = useState(() => readSavedLocations());
  const [recentLocations, setRecentLocations] = useState(() => readRecentLocations());
  const [status, setStatus] = useState(getInitialStatus(language));

  const loadForecast = useCallback(
    async (location: LocationResult, options: { nextQuery?: string; syncUrl?: boolean } = {}) => {
      const label = formatLocation(location);
      const nextQuery = options.nextQuery ?? query;

      if (options.syncUrl !== false) {
        writeUrlState({
          day: selectedDay,
          language,
          location,
          metric: selectedMetric,
          metrics: selectedMetrics,
          query: nextQuery,
          sourceIds: selectedSourceIds
        });
      }

      setStatus(
        language === "pl" ? `Pobieram prognozy dla: ${label}` : `Loading forecasts for: ${label}`
      );

      try {
        const data = await fetchForecast(location, label);
        const storedLocation = createStoredLocationFromForecast(data);
        const nextRecentLocations = pushRecentLocation(readRecentLocations(), storedLocation);

        writeRecentLocations(nextRecentLocations);
        setRecentLocations(nextRecentLocations);
        setForecast(data);
        setStatus(
          data.failedSources.length
            ? t.partialFailure(data.failedSources.join(", "))
            : t.ready(label)
        );
      } catch (error) {
        setForecast(null);
        setStatus(error instanceof Error ? error.message : t.noForecastError);
      }
    },
    [language, query, selectedDay, selectedMetric, selectedMetrics, selectedSourceIds, t]
  );

  const searchForLocations = useCallback(
    async (nextQuery: string) => {
      const cleaned = nextQuery.trim();

      if (!cleaned) {
        setStatus(language === "pl" ? "Podaj nazwe miasta." : "Enter a city name.");
        return;
      }

      setStatus(t.searchingLocation);
      setLocations([]);
      writeUrlState({
        day: selectedDay,
        language,
        location: null,
        metric: selectedMetric,
        metrics: selectedMetrics,
        query: cleaned,
        sourceIds: selectedSourceIds
      });

      try {
        const results = await fetchLocations(cleaned);
        setLocations(results);

        if (!results.length) {
          setForecast(null);
          setStatus(t.noResults);
          return;
        }

        const firstResult = results[0];

        if (firstResult) {
          await loadForecast(firstResult, { nextQuery: cleaned });
        }
      } catch (error) {
        setStatus(error instanceof Error ? error.message : t.noLocationError);
      }
    },
    [language, loadForecast, selectedDay, selectedMetric, selectedMetrics, selectedSourceIds, t]
  );

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    if (initialUrlState.current.selectedLocation) {
      const selectedLocation = initialUrlState.current.selectedLocation;
      setLocations([selectedLocation]);
      void loadForecast(selectedLocation, {
        nextQuery: initialUrlState.current.query,
        syncUrl: false
      });
      return;
    }

    void searchForLocations(initialUrlState.current.query);
  }, [loadForecast, searchForLocations]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void searchForLocations(query);
  }

  function handleCollectionLocationSelect(location: StoredLocation) {
    const nextLocation = storedLocationToLocationResult(location);
    setQuery(location.name);
    setLocations([nextLocation]);
    void loadForecast(nextLocation, { nextQuery: location.name });
  }

  function handleLanguageChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextLanguage = event.target.value as Language;
    setLanguage(nextLanguage);
    writeUrlState({
      language: nextLanguage,
      metric: selectedMetric,
      metrics: selectedMetrics,
      location: forecast
        ? {
            id: forecast.location.label,
            name: forecast.location.label,
            latitude: forecast.location.latitude,
            longitude: forecast.location.longitude
          }
        : null,
      day: selectedDay,
      query,
      sourceIds: selectedSourceIds
    });
    setStatus((currentStatus) =>
      currentStatus === getInitialStatus(language) ? getInitialStatus(nextLanguage) : currentStatus
    );
  }

  function handleDayChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextDay = event.target.value;
    setSelectedDay(nextDay);
    writeUrlState({
      day: nextDay,
      language,
      metric: selectedMetric,
      metrics: selectedMetrics,
      location: forecast
        ? {
            id: forecast.location.label,
            name: forecast.location.label,
            latitude: forecast.location.latitude,
            longitude: forecast.location.longitude
          }
        : null,
      query,
      sourceIds: selectedSourceIds
    });
  }

  function handleMetricChange(metric: ChartMetricKey) {
    setSelectedMetric(metric);
    writeUrlState({
      day: selectedDay,
      language,
      metric,
      metrics: selectedMetrics,
      location: forecast
        ? {
            id: forecast.location.label,
            name: forecast.location.label,
            latitude: forecast.location.latitude,
            longitude: forecast.location.longitude
          }
        : null,
      query,
      sourceIds: selectedSourceIds
    });
  }

  function handleMetricVisibilityChange(metric: ChartMetricKey) {
    const nextMetrics = selectedMetrics.includes(metric)
      ? selectedMetrics.filter((item) => item !== metric)
      : chartMetricKeys.filter((item) => [...selectedMetrics, metric].includes(item));

    if (!nextMetrics.length) {
      return;
    }

    const nextSelectedMetric = nextMetrics.includes(selectedMetric)
      ? selectedMetric
      : (nextMetrics[0] ?? "temperatureMax");
    setSelectedMetrics(nextMetrics);
    setSelectedMetric(nextSelectedMetric);
    writeUrlState({
      day: selectedDay,
      language,
      metric: nextSelectedMetric,
      metrics: nextMetrics,
      location: currentForecastLocation(forecast),
      query,
      sourceIds: selectedSourceIds
    });
  }

  function handleSourceVisibilityChange(sourceId: string) {
    if (!forecast) {
      return;
    }

    const currentSourceIds = selectedSourceIds ?? forecast.sources.map((source) => source.id);
    const nextSourceIds = currentSourceIds.includes(sourceId)
      ? currentSourceIds.filter((item) => item !== sourceId)
      : [...currentSourceIds, sourceId];

    if (!nextSourceIds.length) {
      return;
    }

    setSelectedSourceIds(nextSourceIds);
    writeUrlState({
      day: selectedDay,
      language,
      metric: selectedMetric,
      metrics: selectedMetrics,
      location: currentForecastLocation(forecast),
      query,
      sourceIds: nextSourceIds
    });
  }

  function handleToggleSavedLocation() {
    if (!forecast) {
      return;
    }

    const location = createStoredLocationFromForecast(forecast);
    const nextSavedLocations = toggleSavedLocation(savedLocations, location);
    setSavedLocations(nextSavedLocations);
    writeSavedLocations(nextSavedLocations);
  }

  function handleRemoveSavedLocation(id: string) {
    const nextSavedLocations = savedLocations.filter((location) => location.id !== id);
    setSavedLocations(nextSavedLocations);
    writeSavedLocations(nextSavedLocations);
  }

  const visibleForecast = forecast
    ? filterForecast(forecast, selectedDay, selectedSourceIds)
    : null;
  const visibleSourceIds = visibleForecast?.sources.map((source) => source.id) ?? [];
  const isCurrentLocationSaved = forecast
    ? savedLocations.some(
        (location) => location.id === createStoredLocationFromForecast(forecast).id
      )
    : false;

  return (
    <main className="app-shell">
      <section className="topbar" aria-label={t.searchLocations}>
        <div>
          <p className="eyebrow">Meteo Comparator</p>
          <h1>{t.appTitle}</h1>
          {forecast ? (
            <button
              className="save-location-button"
              onClick={handleToggleSavedLocation}
              type="button"
            >
              {isCurrentLocationSaved ? t.savedLocation : t.saveLocation}
            </button>
          ) : null}
        </div>
        <div className="controls">
          <label className="language-select">
            <span>{t.language}</span>
            <select value={language} onChange={handleLanguageChange}>
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <form className="search" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="location-input">
              {t.location}
            </label>
            <input
              id="location-input"
              name="location"
              type="search"
              value={query}
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit">{t.search}</button>
          </form>
        </div>
      </section>

      <section className="status" role="status">
        {status}
      </section>

      <LocationCollections
        onRemoveSaved={handleRemoveSavedLocation}
        onSelect={handleCollectionLocationSelect}
        recentLocations={recentLocations}
        savedLocations={savedLocations}
        t={t}
      />
      <LocationPicker locations={locations} onSelect={loadForecast} />

      {forecast && visibleForecast ? (
        <>
          <section className="filterbar">
            <label className="day-select">
              <span>{t.day}</span>
              <select value={selectedDay} onChange={handleDayChange}>
                <option value="">{t.allDays}</option>
                {forecast.average.map((day) => (
                  <option key={day.date} value={day.date}>
                    {formatShortDate(day.date, language)}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="filter-group">
              <legend>{t.sourceFilters}</legend>
              <div className="filter-options">
                {forecast.sources.map((source) => (
                  <label className="filter-option" key={source.id}>
                    <input
                      checked={visibleSourceIds.includes(source.id)}
                      disabled={
                        visibleSourceIds.length === 1 && visibleSourceIds.includes(source.id)
                      }
                      onChange={() => handleSourceVisibilityChange(source.id)}
                      type="checkbox"
                    />
                    <span>{source.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="filter-group">
              <legend>{t.parameterFilters}</legend>
              <div className="filter-options">
                {chartMetricKeys.map((metric) => (
                  <label className="filter-option" key={metric}>
                    <input
                      checked={selectedMetrics.includes(metric)}
                      disabled={selectedMetrics.length === 1 && selectedMetrics.includes(metric)}
                      onChange={() => handleMetricVisibilityChange(metric)}
                      type="checkbox"
                    />
                    <span>{getMetricLabel(metric, t)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <SummaryCards
            days={visibleForecast.average}
            language={language}
            metrics={selectedMetrics}
            t={t}
          />
          <ForecastInsights
            forecast={visibleForecast}
            language={language}
            metric={selectedMetric}
            t={t}
          />
          <section className="chart-section" aria-label={t.chartTitle}>
            <div className="section-heading">
              <h2>{t.chartTitle}</h2>
              <span>{formatSourceCount(visibleForecast.sources.length, language)}</span>
            </div>
            <div className="chart-tabs" role="tablist" aria-label={t.chartTitle}>
              {selectedMetrics.map((metric) => (
                <button
                  aria-selected={selectedMetric === metric}
                  className={selectedMetric === metric ? "chart-tab active" : "chart-tab"}
                  key={metric}
                  onClick={() => handleMetricChange(metric)}
                  role="tab"
                  type="button"
                >
                  {getMetricLabel(metric, t)}
                </button>
              ))}
            </div>
            <ForecastChart
              days={visibleForecast.average}
              language={language}
              metric={selectedMetric}
            />
          </section>
          <ForecastTable
            forecast={visibleForecast}
            language={language}
            metrics={selectedMetrics}
            t={t}
          />
        </>
      ) : null}
    </main>
  );
}

function currentForecastLocation(forecast: ForecastComparison | null): LocationResult | null {
  return forecast
    ? {
        id: forecast.location.label,
        name: forecast.location.label,
        latitude: forecast.location.latitude,
        longitude: forecast.location.longitude
      }
    : null;
}
