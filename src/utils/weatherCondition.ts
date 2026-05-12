import type { Language } from "../i18n.js";

export type WeatherConditionKind = "clear" | "cloudy" | "fog" | "rain" | "snow" | "storm";

export function getWeatherConditionKind(code: number | null | undefined): WeatherConditionKind {
  if (typeof code !== "number" || !Number.isFinite(code)) {
    return "cloudy";
  }

  if (code >= 95) {
    return "storm";
  }

  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return "snow";
  }

  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return "rain";
  }

  if (code >= 45) {
    return "fog";
  }

  if (code >= 2) {
    return "cloudy";
  }

  return "clear";
}

export function formatWeatherCondition(
  code: number | null | undefined,
  language: Language
): string {
  const kind = getWeatherConditionKind(code);

  const labels: Record<WeatherConditionKind, Record<Language, string>> = {
    clear: { pl: "Słonecznie", en: "Clear" },
    cloudy: { pl: "Pochmurno", en: "Cloudy" },
    fog: { pl: "Mgła", en: "Fog" },
    rain: { pl: "Opady", en: "Rain" },
    snow: { pl: "Śnieg", en: "Snow" },
    storm: { pl: "Burza", en: "Storm" }
  };

  return labels[kind][language];
}
