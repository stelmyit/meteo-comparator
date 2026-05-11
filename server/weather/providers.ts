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
  winds: number[];
};

export async function getOpenMeteoForecast(
  latitude: number,
  longitude: number
): Promise<WeatherSource> {
  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", String(latitude));
  forecastUrl.searchParams.set("longitude", String(longitude));
  forecastUrl.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max"
  );
  forecastUrl.searchParams.set("forecast_days", "7");
  forecastUrl.searchParams.set("timezone", "auto");

  const data = await fetchJson<OpenMeteoForecastResponse>(forecastUrl);

  return {
    id: "open-meteo",
    name: "Open-Meteo",
    updatedAt: new Date().toISOString(),
    days: data.daily.time.map((date, index) => ({
      date,
      temperatureMax: numberOrNull(data.daily.temperature_2m_max[index]),
      temperatureMin: numberOrNull(data.daily.temperature_2m_min[index]),
      precipitation: numberOrNull(data.daily.precipitation_sum[index]),
      precipitationProbability: numberOrNull(data.daily.precipitation_probability_max[index]),
      windMax: numberOrNull(data.daily.windspeed_10m_max[index])
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
    const next1h = item.data.next_1_hours?.details;
    const next6h = item.data.next_6_hours?.details;
    const hour = Number(item.time.slice(11, 13));
    const record = grouped.get(date) ?? {
      temperatures: [],
      precipitation: 0,
      winds: []
    };

    record.temperatures.push(details.air_temperature);
    record.winds.push(details.wind_speed * 3.6);

    const hourlyPrecipitation = next1h?.precipitation_amount;

    if (typeof hourlyPrecipitation === "number" && Number.isFinite(hourlyPrecipitation)) {
      record.precipitation += hourlyPrecipitation;
    } else if (hour % 6 === 0) {
      record.precipitation += next6h?.precipitation_amount ?? 0;
    }

    grouped.set(date, record);
  }

  return {
    id: "met-norway",
    name: "MET Norway",
    updatedAt: data.properties.meta.updated_at,
    days: [...grouped.entries()].slice(0, 7).map(([date, record]) => ({
      date,
      temperatureMax: round(Math.max(...record.temperatures)),
      temperatureMin: round(Math.min(...record.temperatures)),
      precipitation: round(record.precipitation),
      precipitationProbability: null,
      windMax: round(Math.max(...record.winds))
    }))
  };
}

export { averageForecasts };
