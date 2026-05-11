export type WeatherDay = {
  date: string;
  apparentTemperatureMax: number | null;
  apparentTemperatureMin: number | null;
  temperatureMax: number | null;
  temperatureMin: number | null;
  precipitation: number | null;
  precipitationProbability: number | null;
  weatherCode: number | null;
  windMax: number | null;
};

export type WeatherSource = {
  id: string;
  name: string;
  updatedAt: string;
  days: WeatherDay[];
};

export type ForecastComparison = {
  location: {
    label: string;
    latitude: number;
    longitude: number;
  };
  generatedAt: string;
  sources: WeatherSource[];
  average: WeatherDay[];
  failedSources: string[];
};

export type LocationResult = {
  id: number | string;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

export type OpenMeteoGeocodingResponse = {
  results?: Array<LocationResult & Record<string, unknown>>;
};

export type OpenMeteoForecastResponse = {
  daily: {
    time: string[];
    apparent_temperature_max?: number[];
    apparent_temperature_min?: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max?: number[];
    weather_code?: number[];
    wind_speed_10m_max?: number[];
    windspeed_10m_max?: number[];
  };
};

export type MetNorwayForecastResponse = {
  properties: {
    meta: {
      updated_at: string;
    };
    timeseries: MetNorwayPoint[];
  };
};

export type MetNorwayPoint = {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature: number;
        wind_speed: number;
      };
    };
    next_1_hours?: {
      summary?: {
        symbol_code: string;
      };
      details: {
        precipitation_amount: number;
      };
    };
    next_6_hours?: {
      summary?: {
        symbol_code: string;
      };
      details: {
        precipitation_amount: number;
      };
    };
  };
};
