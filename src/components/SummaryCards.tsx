import { WeatherIcon } from "./WeatherIcon.jsx";
import { formatWeatherCondition } from "../utils/weatherCondition.js";
import { formatMetricValue, getMetricDetail, getMetricLabel } from "../utils/metrics.js";
import type { Language, Translations } from "../i18n.js";
import type { ChartMetricKey } from "../types/chart.js";
import type { WeatherDay } from "../types/weather.js";

type SummaryCardsProps = {
  days: WeatherDay[];
  language: Language;
  metrics: ChartMetricKey[];
  t: Translations;
};

export function SummaryCards({ days, language, metrics, t }: SummaryCardsProps) {
  const today: Partial<WeatherDay> = days[0] ?? {};
  const conditionLabel = formatWeatherCondition(today.weatherCode, language);

  return (
    <section className="summary-grid" aria-label={t.todayAverage}>
      <article className="metric-card condition-card">
        <WeatherIcon code={today.weatherCode} label={conditionLabel} />
        <div>
          <div className="metric-label">{t.condition}</div>
          <div className="metric-value condition-value">{conditionLabel}</div>
          <div className="metric-detail">{t.todayAverage}</div>
        </div>
      </article>
      {metrics.map((metric) => (
        <article className="metric-card" key={metric}>
          <div className="metric-label">{getMetricLabel(metric, t)}</div>
          <div className="metric-value">{formatMetricValue(metric, today)}</div>
          <div className="metric-detail">{getMetricDetail(metric, t)}</div>
        </article>
      ))}
    </section>
  );
}
