import { useEffect, useRef } from "react";

import { drawWeatherChart, getChartMetricLabel } from "../utils/chart.js";
import type { Language } from "../i18n.js";
import type { ChartMetricKey } from "../types/chart.js";
import type { WeatherDay } from "../types/weather.js";
import type { UnitSystem } from "../utils/units.js";

type ForecastChartProps = {
  days: WeatherDay[];
  language: Language;
  metric: ChartMetricKey;
  units: UnitSystem;
};

export function ForecastChart({ days, language, metric, units }: ForecastChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      drawWeatherChart(canvas, days, language, metric, units);
    }
  }, [days, language, metric, units]);

  return <canvas aria-label={`Weather chart: ${getChartMetricLabel(metric)}`} ref={canvasRef} />;
}
