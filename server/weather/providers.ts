import { averageForecasts, numberOrNull, round } from "./aggregation.js";
import { fetchJson } from "./http.js";
import type {
  MetNorwayForecastResponse,
  OpenMeteoForecastResponse,
  WeatherSource
} from "./types.js";

type MetNorwayDailyRecord = {
  temperatures: number[];
  precipitation: number;
  weatherCodes: number[];
  winds: number[];
};

type OpenMeteoProviderConfig = {
  dailyVariables: string[];
  endpoint: string;
  id: string;
  name: string;
};

const openMeteoDailyVariables = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "apparent_temperature_max",
  "apparent_temperature_min",
  "precipitation_sum",
  "precipitation_probability_max",
  "wind_speed_10m_max"
];

const ecmwfDailyVariables = openMeteoDailyVariables.filter(
  (variable) => variable !== "precipitation_probability_max"
);

export async function getOpenMeteoForecast(
  latitude: number,
  longitude: number
): Promise<WeatherSource> {
  return getOpenMeteoModelForecast(latitude, longitude, {
    dailyVariables: openMeteoDailyVariables,
    endpoint: "https://api.open-meteo.com/v1/forecast",
    id: "open-meteo",
    name: "Open-Meteo Best Match"
  });
}

export async function getDwdIconForecast(
  latitude: number,
  longitude: number
): Promise<WeatherSource> {
  return getOpenMeteoModelForecast(latitude, longitude, {
    dailyVariables: openMeteoDailyVariables,
    endpoint: "https://api.open-meteo.com/v1/dwd-icon",
    id: "dwd-icon",
    name: "DWD ICON"
  });
}

export async function getEcmwfForecast(
  latitude: number,
  longitude: number
): Promise<WeatherSource> {
  return getOpenMeteoModelForecast(latitude, longitude, {
    dailyVariables: ecmwfDailyVariables,
    endpoint: "https://api.open-meteo.com/v1/ecmwf",
    id: "ecmwf",
    name: "ECMWF IFS"
  });
}

export async function getOpenMeteoModelForecast(
  latitude: number,
  longitude: number,
  config: OpenMeteoProviderConfig
): Promise<WeatherSource> {
  const forecastUrl = new URL(config.endpoint);
  forecastUrl.searchParams.set("latitude", String(latitude));
  forecastUrl.searchParams.set("longitude", String(longitude));
  forecastUrl.searchParams.set("daily", config.dailyVariables.join(","));
  forecastUrl.searchParams.set("forecast_days", "7");
  forecastUrl.searchParams.set("timezone", "auto");

  const data = await fetchJson<OpenMeteoForecastResponse>(forecastUrl);

  return {
    id: config.id,
    name: config.name,
    updatedAt: new Date().toISOString(),
    days: data.daily.time.map((date, index) => ({
      apparentTemperatureMax: numberOrNull(data.daily.apparent_temperature_max?.[index]),
      apparentTemperatureMin: numberOrNull(data.daily.apparent_temperature_min?.[index]),
      date,
      temperatureMax: numberOrNull(data.daily.temperature_2m_max[index]),
      temperatureMin: numberOrNull(data.daily.temperature_2m_min[index]),
      precipitation: numberOrNull(data.daily.precipitation_sum[index]),
      precipitationProbability: numberOrNull(data.daily.precipitation_probability_max?.[index]),
      weatherCode: numberOrNull(data.daily.weather_code?.[index]),
      windMax: numberOrNull(
        data.daily.wind_speed_10m_max?.[index] ?? data.daily.windspeed_10m_max?.[index]
      )
    }))
  };
}

export async function getMetNorwayForecast(
  latitude: number,
  longitude: number
): Promise<WeatherSource> {
  const forecastUrl = new URL("https://api.met.no/weatherapi/locationforecast/2.0/compact");
  forecastUrl.searchParams.set("lat", latitude.toFixed(4));
  forecastUrl.searchParams.set("lon", longitude.toFixed(4));

  const data = await fetchJson<MetNorwayForecastResponse>(forecastUrl, {
    headers: {
      "User-Agent": "meteo-comparator/0.1 github.com/local-development"
    }
  });

  return normalizeMetNorwayForecast(data);
}

export function normalizeMetNorwayForecast(data: MetNorwayForecastResponse): WeatherSource {
  const grouped = new Map<string, MetNorwayDailyRecord>();

  for (const item of data.properties.timeseries) {
    const date = item.time.slice(0, 10);
    const details = item.data.instant.details;
    const next1h = item.data.next_1_hours;
    const next6h = item.data.next_6_hours;
    const hour = Number(item.time.slice(11, 13));
    const record = grouped.get(date) ?? {
      temperatures: [],
      precipitation: 0,
      weatherCodes: [],
      winds: []
    };

    record.temperatures.push(details.air_temperature);
    record.winds.push(details.wind_speed * 3.6);

    const weatherCode = metNorwaySymbolToWeatherCode(
      next1h?.summary?.symbol_code ?? next6h?.summary?.symbol_code
    );

    if (weatherCode !== null) {
      record.weatherCodes.push(weatherCode);
    }

    const hourlyPrecipitation = next1h?.details.precipitation_amount;

    if (typeof hourlyPrecipitation === "number" && Number.isFinite(hourlyPrecipitation)) {
      record.precipitation += hourlyPrecipitation;
    } else if (hour % 6 === 0) {
      record.precipitation += next6h?.details.precipitation_amount ?? 0;
    }

    grouped.set(date, record);
  }

  return {
    id: "met-norway",
    name: "MET Norway",
    updatedAt: data.properties.meta.updated_at,
    days: [...grouped.entries()].slice(0, 7).map(([date, record]) => ({
      apparentTemperatureMax: null,
      apparentTemperatureMin: null,
      date,
      temperatureMax: round(Math.max(...record.temperatures)),
      temperatureMin: round(Math.min(...record.temperatures)),
      precipitation: round(record.precipitation),
      precipitationProbability: null,
      weatherCode: dominantWeatherCode(record.weatherCodes),
      windMax: round(Math.max(...record.winds))
    }))
  };
}

function dominantWeatherCode(items: number[]): number | null {
  return items.length ? Math.max(...items) : null;
}

function metNorwaySymbolToWeatherCode(symbol: string | undefined): number | null {
  if (!symbol) {
    return null;
  }

  if (symbol.includes("thunder")) {
    return 95;
  }

  if (symbol.includes("snow") || symbol.includes("sleet")) {
    return 73;
  }

  if (symbol.includes("rain")) {
    return 61;
  }

  if (symbol.includes("fog")) {
    return 45;
  }

  if (symbol.includes("cloudy")) {
    return symbol.includes("partly") ? 2 : 3;
  }

  if (symbol.includes("clearsky") || symbol.includes("fair")) {
    return 0;
  }

  return null;
}

export { averageForecasts };
