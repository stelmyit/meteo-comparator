export type Language = "pl" | "en";

export type Translations = {
  allDays: string;
  appTitle: string;
  calmestDay: string;
  chartTitle: string;
  condition: string;
  confidenceHint: string;
  confidenceHigh: string;
  confidenceLow: string;
  confidenceMedium: string;
  confidenceTitle: string;
  dailySum: string;
  dataFilters: string;
  day: string;
  driestDay: string;
  forecastInsights: string;
  language: string;
  location: string;
  max: string;
  maxTemperature: string;
  metricApparentTemperature: string;
  metricPrecipitation: string;
  metricPrecipitationProbability: string;
  metricTemperatureMax: string;
  metricTemperatureMin: string;
  metricWind: string;
  minTemperature: string;
  noForecastError: string;
  noLocationError: string;
  noResults: string;
  parameterFilters: string;
  partialFailure: (sources: string) => string;
  precipitation: string;
  ready: (label: string) => string;
  recentLocations: string;
  removeLocation: string;
  saveLocation: string;
  savedLocation: string;
  savedLocations: string;
  search: string;
  searchLocations: string;
  searchingLocation: string;
  source: string;
  sourceFilters: string;
  tableTitle: string;
  todayAverage: string;
  updatedAt: string;
  warmestDay: string;
  wind: string;
};

export const translations: Record<Language, Translations> = {
  pl: {
    allDays: "Wszystkie dni",
    appTitle: "Porownaj prognozy pogody",
    calmestDay: "Najspokojniejszy dzien",
    chartTitle: "Wykres",
    condition: "Warunki",
    confidenceHint: "Na podstawie roznic miedzy modelami",
    confidenceHigh: "Wysoka zgodnosc",
    confidenceLow: "Niska zgodnosc",
    confidenceMedium: "Srednia zgodnosc",
    confidenceTitle: "Pewnosc prognozy",
    dailySum: "suma dzienna",
    dataFilters: "Filtry danych",
    day: "Dzien",
    driestDay: "Najsuchszy dzien",
    forecastInsights: "Szybkie wnioski",
    language: "Jezyk",
    location: "Lokalizacja",
    max: "maksymalny",
    maxTemperature: "Temp. maks.",
    metricApparentTemperature: "Temp. odczuwalna",
    metricPrecipitation: "Opad",
    metricPrecipitationProbability: "Szansa opadow",
    metricTemperatureMax: "Temp. maks.",
    metricTemperatureMin: "Temp. min.",
    metricWind: "Wiatr",
    minTemperature: "Temp. min.",
    noForecastError: "Nie udalo sie pobrac prognozy.",
    noLocationError: "Nie udalo sie wyszukac lokalizacji.",
    noResults: "Nie znaleziono pasujacej lokalizacji.",
    parameterFilters: "Parametry",
    partialFailure: (sources) => `Gotowe. Czesc zrodel nie odpowiedziala: ${sources}`,
    precipitation: "Opad",
    ready: (label) => `Gotowe. Porownano prognozy dla: ${label}`,
    recentLocations: "Ostatnie miejsca",
    removeLocation: "Usun lokalizacje",
    saveLocation: "Zapisz miejsce",
    savedLocation: "Miejsce zapisane",
    savedLocations: "Zapisane miejsca",
    search: "Szukaj",
    searchLocations: "Wyszukiwarka lokalizacji",
    searchingLocation: "Szukam lokalizacji...",
    source: "Zrodlo",
    sourceFilters: "Zrodla",
    tableTitle: "Porownanie zrodel",
    todayAverage: "srednia na dzis",
    updatedAt: "Aktualizacja",
    warmestDay: "Najcieplejszy dzien",
    wind: "Wiatr"
  },
  en: {
    allDays: "All days",
    appTitle: "Compare weather forecasts",
    calmestDay: "Calmest day",
    chartTitle: "Chart",
    condition: "Condition",
    confidenceHint: "Based on how closely the models match",
    confidenceHigh: "High agreement",
    confidenceLow: "Low agreement",
    confidenceMedium: "Mixed agreement",
    confidenceTitle: "Forecast confidence",
    dailySum: "daily total",
    dataFilters: "Data filters",
    day: "Day",
    driestDay: "Driest day",
    forecastInsights: "Quick insights",
    language: "Language",
    location: "Location",
    max: "maximum",
    maxTemperature: "Max temp.",
    metricApparentTemperature: "Feels like",
    metricPrecipitation: "Precipitation",
    metricPrecipitationProbability: "Precip. chance",
    metricTemperatureMax: "Max temp.",
    metricTemperatureMin: "Min temp.",
    metricWind: "Wind",
    minTemperature: "Min temp.",
    noForecastError: "Could not load the forecast.",
    noLocationError: "Could not search for the location.",
    noResults: "No matching location found.",
    parameterFilters: "Parameters",
    partialFailure: (sources) => `Done. Some sources did not respond: ${sources}`,
    precipitation: "Precipitation",
    ready: (label) => `Done. Compared forecasts for: ${label}`,
    recentLocations: "Recent places",
    removeLocation: "Remove location",
    saveLocation: "Save place",
    savedLocation: "Saved place",
    savedLocations: "Saved places",
    search: "Search",
    searchLocations: "Location search",
    searchingLocation: "Searching for locations...",
    source: "Source",
    sourceFilters: "Sources",
    tableTitle: "Source comparison",
    todayAverage: "average today",
    updatedAt: "Updated",
    warmestDay: "Warmest day",
    wind: "Wind"
  }
};

export const languageOptions: Array<{ code: Language; label: string }> = [
  { code: "pl", label: "Polski" },
  { code: "en", label: "English" }
];

export function getInitialStatus(language: Language): string {
  return language === "pl"
    ? "Wpisz miasto i pobierz prognozy z publicznych API."
    : "Enter a city and fetch forecasts from public APIs.";
}
