import { WeatherIcon } from "./WeatherIcon.jsx";
import { formatDateTime, formatShortDate } from "../utils/formatters.js";
import { formatMetricValue, getMetricLabel } from "../utils/metrics.js";
import { formatWeatherCondition } from "../utils/weatherCondition.js";
import type { Language, Translations } from "../i18n.js";
import type { ChartMetricKey } from "../types/chart.js";
import type { ForecastComparison, WeatherDay } from "../types/weather.js";
import type { UnitSystem } from "../utils/units.js";

type ForecastTableProps = {
  forecast: ForecastComparison;
  language: Language;
  metrics: ChartMetricKey[];
  t: Translations;
  units: UnitSystem;
};

type SourceRowProps = {
  days: WeatherDay[];
  language: Language;
  metrics: ChartMetricKey[];
  name: string;
  source?: boolean;
  t: Translations;
  units: UnitSystem;
};

export function ForecastTable({ forecast, language, metrics, t, units }: ForecastTableProps) {
  const days = forecast.average.map((day) => day.date);

  return (
    <section className="table-section" aria-label={t.tableTitle}>
      <div className="section-heading">
        <h2>{t.tableTitle}</h2>
        <span>
          {t.updatedAt}: {formatDateTime(forecast.generatedAt, language)}
        </span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t.source}</th>
              {days.map((day) => (
                <th key={day}>{formatShortDate(day, language)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SourceRow
              days={forecast.average}
              language={language}
              metrics={metrics}
              name={language === "pl" ? "Srednia" : "Average"}
              t={t}
              units={units}
            />
            {forecast.sources.map((source) => (
              <SourceRow
                days={source.days}
                key={source.id}
                language={language}
                metrics={metrics}
                name={source.name}
                source
                t={t}
                units={units}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SourceRow({ days, language, metrics, name, source = false, t, units }: SourceRowProps) {
  return (
    <tr>
      <td className={source ? "source-name" : undefined}>{name}</td>
      {days.map((day) => {
        const conditionLabel = formatWeatherCondition(day.weatherCode, language);

        return (
          <td key={day.date}>
            <div className="table-weather">
              <WeatherIcon code={day.weatherCode} label={conditionLabel} />
              <span>{conditionLabel}</span>
            </div>
            {metrics.map((metric) => (
              <div className="table-metric" key={metric}>
                <span>{getMetricLabel(metric, t)}</span>
                <strong>{formatMetricValue(metric, day, units)}</strong>
              </div>
            ))}
          </td>
        );
      })}
    </tr>
  );
}
