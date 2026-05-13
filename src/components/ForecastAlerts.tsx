import { formatShortDate } from "../utils/formatters.js";
import { buildForecastAlerts } from "../utils/alerts.js";
import type { Language, Translations } from "../i18n.js";
import type { ForecastComparison } from "../types/weather.js";

type ForecastAlertsProps = {
  forecast: ForecastComparison;
  language: Language;
  t: Translations;
};

const alertTextMap = {
  cold: "alertCold",
  heat: "alertHeat",
  rain: "alertRain",
  wind: "alertWind"
} as const;

export function ForecastAlerts({ forecast, language, t }: ForecastAlertsProps) {
  const alerts = buildForecastAlerts(forecast.average);

  if (!alerts.length) {
    return null;
  }

  return (
    <section className="alerts-panel" aria-label={t.alertsTitle}>
      <div className="section-heading">
        <h2>{t.alertsTitle}</h2>
      </div>
      <div className="alerts-list">
        {alerts.map((alert) => (
          <article className={`alert-card ${alert.severity}`} key={`${alert.date}-${alert.kind}`}>
            <div className="metric-label">{formatShortDate(alert.date, language)}</div>
            <div className="metric-detail">{t[alertTextMap[alert.kind]]}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
