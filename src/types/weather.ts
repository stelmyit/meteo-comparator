export type WeatherDay = {
  date: string;
  temperatureMax: number | null;
  temperatureMin: number | null;
  precipitation: number | null;
  precipitationProbability: number | null;
  windMax: number | null;
};

export type WeatherSource = {
  id: string;
  name: string;
  updatedAt: string;
  days: WeatherDay[];
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

export type ApiError = {
  error?: string;
};
