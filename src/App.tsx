import { useCallback, useEffect, useRef, useState } from "react";

import { ForecastChart } from "./components/ForecastChart.jsx";
import { ForecastTable } from "./components/ForecastTable.jsx";
import { LocationPicker } from "./components/LocationPicker.jsx";
import { SummaryCards } from "./components/SummaryCards.jsx";
import { getInitialStatus, languageOptions, translations } from "./i18n.js";
import { fetchForecast, fetchLocations } from "./services/weatherApi.js";
import { chartMetricKeys } from "./types/chart.js";
import { formatLocation, formatShortDate, formatSourceCount } from "./utils/formatters.js";
import { readUrlState, writeUrlState } from "./utils/urlState.js";
import type { Language, Translations } from "./i18n.js";
import type { ChartMetricKey } from "./types/chart.js";
import type { ForecastComparison, LocationResult } from "./types/weather.js";

export function App() {
  const initialUrlState = useRef(readUrlState());
  const hasInitialized = useRef(false);
  const [language, setLanguage] = useState<Language>(initialUrlState.current.language);
  const t = translations[language];
  const [query, setQuery] = useState(initialUrlState.current.query);
  const [locations, setLocations] = useState<LocationResult[]>([]);
  const [forecast, setForecast] = useState<ForecastComparison | null>(null);
  const [selectedDay, setSelectedDay] = useState(initialUrlState.current.day);
  const [selectedMetric, setSelectedMetric] = useState<ChartMetricKey>(
    initialUrlState.current.metric
  );
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
          query: nextQuery
        });
      }

      setStatus(
        language === "pl" ? `Pobieram prognozy dla: ${label}` : `Loading forecasts for: ${label}`
      );

      try {
        const data = await fetchForecast(location, label);
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
    [language, query, selectedDay, selectedMetric, t]
  );

  const searchForLocations = useCallback(
    async (nextQuery: string) => {
      const cleaned = nextQuery.trim();

      if (!cleaned) {
        setStatus(language === "pl" ? "Podaj nazwę miasta." : "Enter a city name.");
        return;
      }

      setStatus(t.searchingLocation);
      setLocations([]);
      writeUrlState({
        day: selectedDay,
        language,
        location: null,
        metric: selectedMetric,
        query: cleaned
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
    [language, loadForecast, selectedDay, selectedMetric, t]
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

  function handleLanguageChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextLanguage = event.target.value as Language;
    setLanguage(nextLanguage);
    writeUrlState({
      language: nextLanguage,
      metric: selectedMetric,
      location: forecast
        ? {
            id: forecast.location.label,
            name: forecast.location.label,
            latitude: forecast.location.latitude,
            longitude: forecast.location.longitude
          }
        : null,
      day: selectedDay,
      query
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
      location: forecast
        ? {
            id: forecast.location.label,
            name: forecast.location.label,
            latitude: forecast.location.latitude,
            longitude: forecast.location.longitude
          }
        : null,
      query
    });
  }

  function handleMetricChange(metric: ChartMetricKey) {
    setSelectedMetric(metric);
    writeUrlState({
      day: selectedDay,
      language,
      metric,
      location: forecast
        ? {
            id: forecast.location.label,
            name: forecast.location.label,
            latitude: forecast.location.latitude,
            longitude: forecast.location.longitude
          }
        : null,
      query
    });
  }

  const visibleForecast = forecast ? filterForecastByDay(forecast, selectedDay) : null;

  return (
    <main className="app-shell">
      <section className="topbar" aria-label={t.searchLocations}>
        <div>
          <p className="eyebrow">Meteo Comparator</p>
          <h1>{t.appTitle}</h1>
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
          </section>

          <SummaryCards days={visibleForecast.average} t={t} />
          <section className="chart-section" aria-label={t.chartTitle}>
            <div className="section-heading">
              <h2>{t.chartTitle}</h2>
              <span>{formatSourceCount(visibleForecast.sources.length, language)}</span>
            </div>
            <div className="chart-tabs" role="tablist" aria-label={t.chartTitle}>
              {chartMetricKeys.map((metric) => (
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
          <ForecastTable forecast={visibleForecast} language={language} t={t} />
        </>
      ) : null}
    </main>
  );
}

function filterForecastByDay(
  forecast: ForecastComparison,
  selectedDay: string
): ForecastComparison {
  if (!selectedDay) {
    return forecast;
  }

  return {
    ...forecast,
    average: forecast.average.filter((day) => day.date === selectedDay),
    sources: forecast.sources.map((source) => ({
      ...source,
      days: source.days.filter((day) => day.date === selectedDay)
    }))
  };
}

function getMetricLabel(metric: ChartMetricKey, t: Translations): string {
  const labels: Record<ChartMetricKey, string> = {
    temperatureMax: t.metricTemperatureMax,
    temperatureMin: t.metricTemperatureMin,
    precipitation: t.metricPrecipitation,
    precipitationProbability: t.metricPrecipitationProbability,
    windMax: t.metricWind
  };

  return labels[metric];
}
