import { formatShortDate } from "./formatters.js";
import type { Language } from "../i18n.js";
import type { ChartMetricKey } from "../types/chart.js";
import type { WeatherDay } from "../types/weather.js";

type ChartMetricConfig = {
  color: string;
  floorAtZero: boolean;
  label: string;
  unit: string;
};

const chartMetricConfig: Record<ChartMetricKey, ChartMetricConfig> = {
  temperatureMax: {
    color: "#0f766e",
    floorAtZero: false,
    label: "maximum temperature",
    unit: "°C"
  },
  temperatureMin: {
    color: "#2563eb",
    floorAtZero: false,
    label: "minimum temperature",
    unit: "°C"
  },
  precipitation: {
    color: "#0284c7",
    floorAtZero: true,
    label: "precipitation",
    unit: "mm"
  },
  precipitationProbability: {
    color: "#7c3aed",
    floorAtZero: true,
    label: "precipitation probability",
    unit: "%"
  },
  windMax: {
    color: "#b45309",
    floorAtZero: true,
    label: "maximum wind",
    unit: "km/h"
  }
};

export function drawWeatherChart(
  canvas: HTMLCanvasElement,
  days: WeatherDay[],
  language: Language,
  metric: ChartMetricKey
): void {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const config = chartMetricConfig[metric];
  const width = canvas.clientWidth || 1120;
  const height = Math.max(260, Math.round(width * 0.32));
  const scale = window.devicePixelRatio || 1;

  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.style.height = `${height}px`;
  context.scale(scale, scale);

  const padding = { top: 24, right: 24, bottom: 52, left: 64 };
  const values = days
    .map((day) => day[metric])
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  context.clearRect(0, 0, width, height);

  if (!values.length) {
    return;
  }

  const { min, max } = getValueRange(values, config);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const xStep = plotWidth / Math.max(days.length - 1, 1);

  context.strokeStyle = "#dce2dd";
  context.lineWidth = 1;
  context.font = "14px Inter, sans-serif";
  context.fillStyle = "#647067";

  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (plotHeight / 4) * i;
    const value = max - ((max - min) / 4) * i;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.fillText(formatAxisValue(value, config.unit), 12, y + 4);
  }

  context.beginPath();
  let hasStartedLine = false;
  days.forEach((day, index) => {
    const value = day[metric];

    if (typeof value !== "number" || !Number.isFinite(value)) {
      return;
    }

    const { x, y } = getPointPosition(value, index, { max, min, padding, plotHeight, xStep });

    if (!hasStartedLine) {
      context.moveTo(x, y);
      hasStartedLine = true;
    } else {
      context.lineTo(x, y);
    }
  });
  context.strokeStyle = config.color;
  context.lineWidth = 4;
  context.stroke();

  days.forEach((day, index) => {
    const value = day[metric];

    if (typeof value !== "number" || !Number.isFinite(value)) {
      return;
    }

    const { x, y } = getPointPosition(value, index, { max, min, padding, plotHeight, xStep });

    context.fillStyle = config.color;
    context.beginPath();
    context.arc(x, y, 6, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#17201b";
    context.fillText(formatShortDate(day.date, language), x - 24, height - 20);
  });
}

export function getChartMetricLabel(metric: ChartMetricKey): string {
  return chartMetricConfig[metric].label;
}

function getValueRange(
  values: number[],
  config: Pick<ChartMetricConfig, "floorAtZero" | "unit">
): { max: number; min: number } {
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  if (config.unit === "%") {
    return { min: 0, max: 100 };
  }

  if (config.floorAtZero) {
    const max = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 1;
    return { min: 0, max };
  }

  const min = Math.floor(minValue - 2);
  const max = Math.ceil(maxValue + 2);

  if (min === max) {
    return { min: min - 1, max: max + 1 };
  }

  return { min, max };
}

function getPointPosition(
  value: number,
  index: number,
  {
    max,
    min,
    padding,
    plotHeight,
    xStep
  }: {
    max: number;
    min: number;
    padding: { top: number; left: number };
    plotHeight: number;
    xStep: number;
  }
): { x: number; y: number } {
  return {
    x: padding.left + index * xStep,
    y: padding.top + ((max - value) / (max - min)) * plotHeight
  };
}

function formatAxisValue(value: number, unit: string): string {
  return `${Math.round(value)} ${unit}`;
}
