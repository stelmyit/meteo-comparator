import { formatShortDate } from "../utils/formatters.js";
import { formatMetricValue } from "../utils/metrics.js";
import {
  buildDailyConfidence,
  buildForecastInsights,
  getConfidenceSummary
} from "../utils/insights.js";
import type { Language, Translations } from "../i18n.js";
import type { ChartMetricKey } from "../types/chart.js";
import type { ForecastComparison } from "../types/weather.js";

type ForecastInsightsProps = {
  forecast: ForecastComparison;
  language: Language;
  metric: ChartMetricKey;
  t: Translations;
};

export function ForecastInsights({ forecast, language, metric, t }: ForecastInsightsProps) {
  const confidence = buildDailyConfidence(forecast, metric);
  const summaryLevel = getConfidenceSummary(confidence.map((item) => item.level));
  const insights = buildForecastInsights(forecast.average);

  return (
    <section className="insights-grid" aria-label={t.forecastInsights}>
      <article className="metric-card insight-featured">
        <div className="metric-label">{t.confidenceTitle}</div>
        <div className={`confidence-pill ${summaryLevel}`}>
          {t[`confidence${capitalize(summaryLevel)}`]}
        </div>
        <div className="metric-detail">{t.confidenceHint}</div>
        <div className="confidence-list">
          {confidence.map((item) => (
            <div className="confidence-row" key={item.date}>
              <span>{formatShortDate(item.date, language)}</span>
              <strong>{t[`confidence${capitalize(item.level)}`]}</strong>
            </div>
          ))}
        </div>
      </article>
      {insights.map((insight) => (
        <article className="metric-card insight-card" key={insight.label}>
          <div className="metric-label">{t[insightLabelMap[insight.label]]}</div>
          <div className="metric-value">
            {formatMetricValue(insightMetricMap[insight.label], {
              [insightMetricMap[insight.label]]: insight.value
            })}
          </div>
          <div className="metric-detail">{formatShortDate(insight.date, language)}</div>
        </article>
      ))}
    </section>
  );
}

const insightMetricMap: Record<"warmest" | "driest" | "calmest", ChartMetricKey> = {
  warmest: "temperatureMax",
  driest: "precipitation",
  calmest: "windMax"
};

const insightLabelMap = {
  warmest: "warmestDay",
  driest: "driestDay",
  calmest: "calmestDay"
} as const;

function capitalize(value: "high" | "medium" | "low"): "High" | "Medium" | "Low" {
  if (value === "high") {
    return "High";
  }

  if (value === "medium") {
    return "Medium";
  }

  return "Low";
}
