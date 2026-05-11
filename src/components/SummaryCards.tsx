import { formatMillimeters, formatTemperature, formatWind } from "../utils/formatters.js";
import type { Translations } from "../i18n.js";
import type { WeatherDay } from "../types/weather.js";

type SummaryCardsProps = {
  days: WeatherDay[];
  t: Translations;
};

export function SummaryCards({ days, t }: SummaryCardsProps) {
  const today: Partial<WeatherDay> = days[0] ?? {};
  const cards = [
    {
      label: t.maxTemperature,
      value: formatTemperature(today.temperatureMax),
      detail: t.todayAverage
    },
    {
      label: t.minTemperature,
      value: formatTemperature(today.temperatureMin),
      detail: t.todayAverage
    },
    {
      label: t.precipitation,
      value: formatMillimeters(today.precipitation),
      detail: t.dailySum
    },
    {
      label: t.wind,
      value: formatWind(today.windMax),
      detail: t.max
    }
  ];

  return (
    <section className="summary-grid" aria-label={t.todayAverage}>
      {cards.map((card) => (
        <article className="metric-card" key={card.label}>
          <div className="metric-label">{card.label}</div>
          <div className="metric-value">{card.value}</div>
          <div className="metric-detail">{card.detail}</div>
        </article>
      ))}
    </section>
  );
}
