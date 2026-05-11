import { getWeatherConditionKind } from "../utils/weatherCondition.js";

type WeatherIconProps = {
  code: number | null | undefined;
  label: string;
};

export function WeatherIcon({ code, label }: WeatherIconProps) {
  const kind = getWeatherConditionKind(code);

  return (
    <span aria-label={label} className={`weather-icon ${kind}`} role="img">
      <span className="sun-shape" />
      <span className="cloud-shape" />
      <span className="rain-shape" />
      <span className="snow-shape" />
    </span>
  );
}
