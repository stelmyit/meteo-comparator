import {
  formatDateTime,
  formatMillimeters,
  formatShortDate,
  formatTemperature,
  formatWind
} from "../utils/formatters.js";
import type { Language, Translations } from "../i18n.js";
import type { ForecastComparison, WeatherDay } from "../types/weather.js";

type ForecastTableProps = {
  forecast: ForecastComparison;
  language: Language;
  t: Translations;
};

type SourceRowProps = {
  days: WeatherDay[];
  name: string;
  source?: boolean;
};

export function ForecastTable({ forecast, language, t }: ForecastTableProps) {
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
            <SourceRow days={forecast.average} name={language === "pl" ? "Średnia" : "Average"} />
            {forecast.sources.map((source) => (
              <SourceRow days={source.days} key={source.id} name={source.name} source />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SourceRow({ days, name, source = false }: SourceRowProps) {
  return (
    <tr>
      <td className={source ? "source-name" : undefined}>{name}</td>
      {days.map((day) => (
        <td key={day.date}>
          {formatTemperature(day.temperatureMax)} / {formatTemperature(day.temperatureMin)}
          <br />
          {formatMillimeters(day.precipitation)}, {formatWind(day.windMax)}
        </td>
      ))}
    </tr>
  );
}
