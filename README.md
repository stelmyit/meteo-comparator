# Meteo Comparator

Meteo Comparator is a React and TypeScript application for comparing public weather
forecasts. A user selects a location, the backend fetches forecasts from multiple
public providers, normalizes them into a shared daily format, and the UI shows both
source-level values and averaged results.

## Documentation Tabs

[Business Documentation](#business-documentation) |
[Technical Requirements](#technical-requirements) |
[Technical Documentation](#technical-documentation) |
[CICD](#cicd)

## Business Documentation

### Problem

Weather forecasts can differ noticeably between providers, especially for
precipitation, minimum temperatures, apparent temperature, and wind. Users who plan
travel, outdoor events, field work, or logistics often need to check several
websites and manually compare the differences.

### Solution

The application aggregates forecasts from several public sources and presents:

- daily forecasts for the selected location,
- an averaged forecast calculated from available sources,
- per-provider values in a comparison table,
- chart tabs for temperature, apparent temperature, precipitation probability,
  precipitation volume, and wind,
- filters for visible providers and metrics,
- weather condition icons derived from provider weather codes,
- shareable URLs that preserve language, query, location, selected day, metric,
  visible metrics, and visible sources.

### Value

- Reduces the time needed to compare weather forecasts.
- Makes the forecast more resilient to outliers from a single provider.
- Presents weather data in a readable form for non-technical users.
- Creates a foundation for alerts, recommendations, and future provider
  integrations.

### Current Data Sources

- Open-Meteo Best Match for geocoding and daily forecasts.
- DWD ICON through Open-Meteo model endpoints.
- ECMWF IFS through Open-Meteo model endpoints.
- MET Norway compact forecast, normalized from hourly timeseries to daily values.

## Technical Requirements

### Runtime

- Node.js 18 or newer.
- npm.

### Local Setup

```bash
npm install
```

Run the API in one terminal:

```bash
npm run dev:api
```

Run the frontend in another terminal:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` by default. Vite proxies `/api`
requests to `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

The frontend is built into `dist`, and the backend is compiled into
`dist-server`. `npm start` runs the compiled backend.

### Quality Gates

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Tests use Vitest with V8 coverage. The required minimum coverage is 90% for
statements, branches, functions, and lines.

## Technical Documentation

### Architecture

The project is split into two layers:

- `src/` contains the React and TypeScript frontend powered by Vite.
- `server/` contains a lightweight Node.js and TypeScript backend that hides
  external API integrations and normalizes weather data.

### Backend Modules

- `server/index.ts` exposes API routes and serves the production frontend.
- `server/weather/geocoding.ts` searches locations.
- `server/weather/providers.ts` integrates weather providers and normalizes
  external responses.
- `server/weather/aggregation.ts` calculates averaged daily forecasts.
- `server/weather/service.ts` orchestrates providers and handles partial
  failures.
- `server/weather/types.ts` defines backend weather contracts.

### Frontend Modules

- `src/App.tsx` owns the main application state, URL synchronization, filters,
  and data loading.
- `src/services/weatherApi.ts` wraps API requests for the frontend.
- `src/components/` contains the chart, table, location picker, summary cards,
  and weather icon components.
- `src/types/` defines frontend data contracts.
- `src/utils/` contains chart preparation, forecast filtering, URL state,
  formatters, metric metadata, and weather condition mapping.

### URL State

The app stores the current search state in query parameters so a link can be
shared or restored after restart:

- `lang` for UI language,
- `q` for search query,
- `lat`, `lon`, and `label` for the selected location,
- `day` for the selected forecast day,
- `metric` for the active chart tab,
- `metrics` for visible metric filters,
- `sources` for visible data source filters.

### Adding A Weather Provider

Add a provider function in `server/weather/providers.ts` that returns a
`WeatherSource`:

```ts
{
  id: "provider-id",
  name: "Provider name",
  updatedAt: "2026-05-12T10:00:00Z",
  days: [
    {
      date: "2026-05-12",
      temperatureMax: 20.1,
      temperatureMin: 10.2,
      apparentTemperatureMax: 19.4,
      apparentTemperatureMin: 8.8,
      precipitation: 1.4,
      precipitationProbability: 30,
      weatherCode: 2,
      windMax: 18.6
    }
  ]
}
```

Then register the provider in `server/weather/service.ts`. Aggregation works
automatically as long as daily fields match the shared contract.

## CICD

### Pull Request Pipeline

GitHub Actions configuration lives in `.github/workflows/pr-checks.yml`.
For every pull request to `main` or `master`, the pipeline runs:

- dependency installation with `npm ci`,
- Prettier check,
- ESLint,
- TypeScript typecheck,
- production build,
- unit tests with minimum 90% coverage.

### Pre-Commit Checks

The project uses Husky and lint-staged. Before each commit:

- Prettier formats staged `js`, `jsx`, `ts`, `tsx`, `json`, `css`, `md`, `yml`,
  and `yaml` files,
- ESLint runs with autofix for staged `js`, `jsx`, `ts`, and `tsx` files.

Install hooks with:

```bash
npm run prepare
```
