import { formatShortDate } from "../utils/formatters.js";
import { buildPlannerRecommendations } from "../utils/planner.js";
import type { Language, Translations } from "../i18n.js";
import type { ForecastComparison } from "../types/weather.js";

type ActivityPlannerProps = {
  forecast: ForecastComparison;
  language: Language;
  t: Translations;
};

const activityLabelMap = {
  outdoor: "bestForOutdoor",
  trip: "bestForTrip",
  walk: "bestForWalk"
} as const;

export function ActivityPlanner({ forecast, language, t }: ActivityPlannerProps) {
  const recommendations = buildPlannerRecommendations(forecast.average);

  if (!recommendations.length) {
    return null;
  }

  return (
    <section className="planner-grid" aria-label={t.activityPlanner}>
      {recommendations.map((item) => (
        <article className="metric-card planner-card" key={item.activity}>
          <div className="metric-label">{t[activityLabelMap[item.activity]]}</div>
          <div className="metric-value">{formatShortDate(item.date, language)}</div>
          <div className="metric-detail">{t.plannerHint}</div>
        </article>
      ))}
    </section>
  );
}
