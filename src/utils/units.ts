export type UnitSystem = "metric" | "imperial";

export function convertTemperature(value: number): number {
  return (value * 9) / 5 + 32;
}

export function convertPrecipitation(value: number): number {
  return value / 25.4;
}

export function convertWind(value: number): number {
  return value / 1.609344;
}
