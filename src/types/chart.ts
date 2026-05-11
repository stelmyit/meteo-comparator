export const chartMetricKeys = [
  "temperatureMax",
  "temperatureMin",
  "apparentTemperatureMax",
  "precipitation",
  "precipitationProbability",
  "windMax"
] as const;

export type ChartMetricKey = (typeof chartMetricKeys)[number];

export function isChartMetricKey(value: string | null | undefined): value is ChartMetricKey {
  return chartMetricKeys.some((metric) => metric === value);
}
