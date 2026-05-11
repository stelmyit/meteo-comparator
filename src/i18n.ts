export type Language = "pl" | "en";

export type Translations = {
  appTitle: string;
  chartTitle: string;
  condition: string;
  dailySum: string;
  dataFilters: string;
  day: string;
  allDays: string;
  language: string;
  location: string;
  max: string;
  metricApparentTemperature: string;
  metricPrecipitation: string;
  metricPrecipitationProbability: string;
  metricTemperatureMax: string;
  metricTemperatureMin: string;
  metricWind: string;
  maxTemperature: string;
  minTemperature: string;
  noForecastError: string;
  noLocationError: string;
  noResults: string;
  partialFailure: (sources: string) => string;
  precipitation: string;
  ready: (label: string) => string;
  search: string;
  searchLocations: string;
  searchingLocation: string;
  source: string;
  sourceFilters: string;
  parameterFilters: string;
  tableTitle: string;
  todayAverage: string;
  updatedAt: string;
  wind: string;
};

export const translations: Record<Language, Translations> = {
  pl: {
    appTitle: "Porównaj prognozy pogody",
    allDays: "Wszystkie dni",
    chartTitle: "Wykres",
    condition: "Warunki",
    dailySum: "suma dzienna",
    dataFilters: "Filtry danych",
    day: "Dzień",
    language: "Język",
    location: "Lokalizacja",
    max: "maksymalny",
    metricApparentTemperature: "Temp. odczuwalna",
    metricPrecipitation: "Opad",
    metricPrecipitationProbability: "Szansa opadów",
    metricTemperatureMax: "Temp. maks.",
    metricTemperatureMin: "Temp. min.",
    metricWind: "Wiatr",
    maxTemperature: "Temp. maks.",
    minTemperature: "Temp. min.",
    noForecastError: "Nie udało się pobrać prognozy.",
    noLocationError: "Nie udało się wyszukać lokalizacji.",
    noResults: "Nie znaleziono pasującej lokalizacji.",
    partialFailure: (sources) => `Gotowe. Część źródeł nie odpowiedziała: ${sources}`,
    precipitation: "Opad",
    ready: (label) => `Gotowe. Porównano prognozy dla: ${label}`,
    search: "Szukaj",
    searchLocations: "Wyszukiwarka lokalizacji",
    searchingLocation: "Szukam lokalizacji...",
    source: "Źródło",
    sourceFilters: "Źródła",
    parameterFilters: "Parametry",
    tableTitle: "Porównanie źródeł",
    todayAverage: "średnia na dziś",
    updatedAt: "Aktualizacja",
    wind: "Wiatr"
  },
  en: {
    appTitle: "Compare weather forecasts",
    allDays: "All days",
    chartTitle: "Chart",
    condition: "Condition",
    dailySum: "daily total",
    dataFilters: "Data filters",
    day: "Day",
    language: "Language",
    location: "Location",
    max: "maximum",
    metricApparentTemperature: "Feels like",
    metricPrecipitation: "Precipitation",
    metricPrecipitationProbability: "Precip. chance",
    metricTemperatureMax: "Max temp.",
    metricTemperatureMin: "Min temp.",
    metricWind: "Wind",
    maxTemperature: "Max temp.",
    minTemperature: "Min temp.",
    noForecastError: "Could not load the forecast.",
    noLocationError: "Could not search for the location.",
    noResults: "No matching location found.",
    partialFailure: (sources) => `Done. Some sources did not respond: ${sources}`,
    precipitation: "Precipitation",
    ready: (label) => `Done. Compared forecasts for: ${label}`,
    search: "Search",
    searchLocations: "Location search",
    searchingLocation: "Searching for locations...",
    source: "Source",
    sourceFilters: "Sources",
    parameterFilters: "Parameters",
    tableTitle: "Source comparison",
    todayAverage: "average today",
    updatedAt: "Updated",
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
