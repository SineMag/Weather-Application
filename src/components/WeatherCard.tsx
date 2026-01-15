import "./WeatherCard.css";
import { useState } from "react";
import {
  BsCloudRainHeavy,
  BsCloudDrizzle,
  BsCloudSnow,
  BsCloudLightningRain,
  BsWind,
} from "react-icons/bs";
import {
  FaCloud,
  FaSun,
  FaCloudRain,
  FaCloudSun,
  FaSmog,
  FaRegSnowflake,
} from "react-icons/fa";

type ForecastItem = {
  dt?: number;
  dt_txt?: string;
  main?: {
    temp?: number;
    feels_like?: number;
    temp_min?: number;
    temp_max?: number;
    pressure?: number;
    humidity?: number;
  };
  wind?: { speed?: number; deg?: number };
  weather?: { description?: string }[];
};

type ForecastResponse = {
  city?: { name?: string; country?: string };
  list?: ForecastItem[];
};

// Daily forecast types for 1 past day + 7 next days
type DailyDay = {
  date?: string; // ISO date
  temp_min?: number;
  temp_max?: number;
  humidity_mean?: number;
  wind_speed_max?: number;
  wind_dir?: number;
  weather_text?: string;
};

type DailyResponse = {
  city?: { name?: string; country?: string };
  days?: DailyDay[]; // ordered with yesterday first, then next 7
};

type WeatherCardProps = {
  result?: ForecastResponse | null;
  daily?: DailyResponse | null;
  unit?: "metric" | "imperial";
  setUnit?: (u: "metric" | "imperial") => void;
  convertTemp?: (t?: number) => string;
  convertSpeed?: (s?: number) => string;
  windDir?: (deg?: number) => string | undefined;
  convertPressure?: (p?: number) => string;
};

// Weather icon mapping function
const getWeatherIcon = (weatherText?: string, size: number = 48) => {
  if (!weatherText) return <FaCloud size={size} />;

  const text = weatherText.toLowerCase();

  // Clear/Sunny conditions
  if (text.includes("clear") || text.includes("sunny")) {
    return <FaSun size={size} color="#FFA500" />;
  }

  // Cloudy conditions
  if (text.includes("cloud") || text.includes("overcast")) {
    return <FaCloud size={size} color="#708090" />;
  }

  // Rain conditions
  if (
    text.includes("rain") ||
    text.includes("shower") ||
    text.includes("drizzle")
  ) {
    if (text.includes("heavy") || text.includes("violent")) {
      return <BsCloudRainHeavy size={size} color="#4682B4" />;
    } else if (text.includes("drizzle")) {
      return <BsCloudDrizzle size={size} color="#4682B4" />;
    } else {
      return <FaCloudRain size={size} color="#4682B4" />;
    }
  }

  // Snow conditions
  if (text.includes("snow")) {
    if (text.includes("heavy")) {
      return <BsCloudSnow size={size} color="#E0E0E0" />;
    } else {
      return <FaRegSnowflake size={size} color="#E0E0E0" />;
    }
  }

  // Thunderstorm conditions
  if (text.includes("thunder") || text.includes("thunderstorm")) {
    return <BsCloudLightningRain size={size} color="#4B0082" />;
  }

  // Wind conditions
  if (text.includes("wind")) {
    return <BsWind size={size} color="#87CEEB" />;
  }

  // Fog conditions
  if (text.includes("fog") || text.includes("mist")) {
    return <FaSmog size={size} color="#C0C0C0" />;
  }

  // Partly cloudy
  if (text.includes("partly") || text.includes("mainly")) {
    return <FaCloudSun size={size} color="#87CEEB" />;
  }

  // Default icon
  return <FaCloud size={size} color="#708090" />;
};

export default function WeatherCard({
  result,
  daily,
  unit = "metric",
  setUnit,
  convertTemp,
  convertSpeed,
  windDir,
  convertPressure,
}: WeatherCardProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHourlyCard, setSelectedHourlyCard] = useState<string | null>(
    null
  );
  return (
    <div className="weatherCard">
      {/* Daily cards: show if provided */}
      {daily && setUnit && convertTemp && convertSpeed && windDir && (
        <div>
          <h2>
            {daily.city?.name}, {daily.city?.country}
          </h2>
          <button
            className="unit-toggle"
            onClick={() => setUnit(unit === "metric" ? "imperial" : "metric")}
          >
            Switch to {unit === "metric" ? "°F / km/h" : "°C / km/h"}
          </button>

          <div className="daily-grid">
            {daily.days
              ?.filter((d) => {
                // Filter out past dates - only keep today and future dates
                if (!d.date) return false;
                const itemDate = new Date(d.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Set to start of day for comparison
                itemDate.setHours(0, 0, 0, 0);
                return itemDate >= today;
              })
              .map((d, idx) => {
                const isToday = (() => {
                  if (!d.date) return false;
                  const itemDate = new Date(d.date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  itemDate.setHours(0, 0, 0, 0);
                  return itemDate.getTime() === today.getTime();
                })();

                const isSelected = selectedDate === d.date;

                return (
                  <div
                    key={idx}
                    className={`day-card ${isToday ? "today-card" : ""} ${
                      isSelected ? "selected-card" : ""
                    }`}
                    onClick={() => setSelectedDate(d.date || null)}
                  >
                    <div
                      className={`day-title ${isToday ? "today-title" : ""} ${
                        isSelected ? "selected-title" : ""
                      }`}
                    >
                      {isToday ? (
                        <div className="today-header">
                          <div className="today-icon">
                            {getWeatherIcon(d.weather_text, 64)}
                          </div>
                          <div className="today-text">
                            <div className="today-label">Today</div>
                            <div className="today-date">
                              {d.date
                                ? (() => {
                                    const date = new Date(d.date);
                                    const months = [
                                      "Jan",
                                      "Feb",
                                      "Mar",
                                      "Apr",
                                      "May",
                                      "Jun",
                                      "Jul",
                                      "Aug",
                                      "Sep",
                                      "Oct",
                                      "Nov",
                                      "Dec",
                                    ];
                                    return `${date.getDate()} ${
                                      months[date.getMonth()]
                                    } ${date.getFullYear()}`;
                                  })()
                                : "-"}
                            </div>
                          </div>
                        </div>
                      ) : isSelected ? (
                        <div className="selected-header">
                          <div className="selected-icon">
                            {getWeatherIcon(d.weather_text, 64)}
                          </div>
                          <div className="selected-text">
                            <div className="selected-label">
                              {d.date
                                ? (() => {
                                    const date = new Date(d.date);
                                    const days = [
                                      "Sunday",
                                      "Monday",
                                      "Tuesday",
                                      "Wednesday",
                                      "Thursday",
                                      "Friday",
                                      "Saturday",
                                    ];
                                    return days[date.getDay()];
                                  })()
                                : "-"}
                            </div>
                            <div className="selected-date">
                              {d.date
                                ? (() => {
                                    const date = new Date(d.date);
                                    const months = [
                                      "Jan",
                                      "Feb",
                                      "Mar",
                                      "Apr",
                                      "May",
                                      "Jun",
                                      "Jul",
                                      "Aug",
                                      "Sep",
                                      "Oct",
                                      "Nov",
                                      "Dec",
                                    ];
                                    return `${date.getDate()} ${
                                      months[date.getMonth()]
                                    } ${date.getFullYear()}`;
                                  })()
                                : "-"}
                            </div>
                          </div>
                        </div>
                      ) : d.date ? (
                        (() => {
                          const date = new Date(d.date);
                          const days = [
                            "Sunday",
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                          ];
                          const months = [
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December",
                          ];
                          return `${days[date.getDay()]}, ${date.getDate()} ${
                            months[date.getMonth()]
                          } ${date.getFullYear()}`;
                        })()
                      ) : (
                        "-"
                      )}
                    </div>
                    <div
                      className={`temps ${isToday ? "today-temps" : ""} ${
                        isSelected ? "selected-temps" : ""
                      }`}
                    >
                      {convertTemp?.(d.temp_max)} / {convertTemp?.(d.temp_min)}
                    </div>
                    <div
                      className={`desc ${isToday ? "today-desc" : ""} ${
                        isSelected ? "selected-desc" : ""
                      }`}
                    >
                      {d.weather_text || "-"}
                    </div>
                    <div className="meta">
                      <div>
                        Humidity:{" "}
                        {typeof d.humidity_mean === "number"
                          ? `${d.humidity_mean}%`
                          : "-"}
                      </div>
                      <div>
                        Wind: {convertSpeed?.(d.wind_speed_max)}{" "}
                        {windDir?.(d.wind_dir)}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      {result &&
        setUnit &&
        convertTemp &&
        convertSpeed &&
        windDir &&
        convertPressure && (
          <div>
            <h2>
              {result.city?.name}, {result.city?.country}
            </h2>
            <button
              className="unit-toggle"
              onClick={() => setUnit(unit === "metric" ? "imperial" : "metric")}
            >
              Switch to {unit === "metric" ? "°F / mph" : "°C / km/h"}
            </button>

            <div className="hourly-grid">
              {result.list
                ?.reduce(
                  (
                    groups: Array<{ date: string; items: ForecastItem[] }>,
                    item
                  ) => {
                    const itemDate = item.dt_txt
                      ? new Date(item.dt_txt).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown";

                    let group = groups.find((g) => g.date === itemDate);
                    if (!group) {
                      group = { date: itemDate, items: [] };
                      groups.push(group);
                    }
                    group.items.push(item);
                    return groups;
                  },
                  []
                )
                .map((group, groupIdx) => (
                  <div key={groupIdx}>
                    <h3 className="hourly-date-separator">{group.date}</h3>
                    <div className="hourly-cards-row">
                      {group.items.map((item, idx) => {
                        const cardId = `${groupIdx}-${idx}`;
                        const isSelected = selectedHourlyCard === cardId;

                        // Check if this is the current hour
                        const isNow = (() => {
                          if (!item.dt_txt) return false;
                          const itemDate = new Date(item.dt_txt);
                          const now = new Date();
                          // Check if it's the same hour (within 30 minutes tolerance)
                          const diffMinutes =
                            Math.abs(now.getTime() - itemDate.getTime()) /
                            (1000 * 60);
                          return diffMinutes <= 30;
                        })();

                        return (
                          <div
                            key={idx}
                            className={`hour-card ${
                              isSelected ? "hour-selected-card" : ""
                            } ${isNow ? "hour-now-card" : ""}`}
                            aria-label={`Forecast for ${item.dt_txt}`}
                            onClick={() => setSelectedHourlyCard(cardId)}
                          >
                            <div
                              className={`hour-time ${
                                isSelected ? "hour-selected-time" : ""
                              } ${isNow ? "hour-now-time" : ""}`}
                            >
                              {isNow
                                ? "Now"
                                : item.dt_txt
                                ? new Date(item.dt_txt).toLocaleTimeString(
                                    undefined,
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : "-"}
                            </div>
                            <div
                              className={`hour-temp ${
                                isSelected ? "hour-selected-temp" : ""
                              } ${isNow ? "hour-now-temp" : ""}`}
                            >
                              {convertTemp(item.main?.temp)}
                            </div>
                            <div
                              className={`hour-desc ${
                                isSelected ? "hour-selected-desc" : ""
                              } ${isNow ? "hour-now-desc" : ""}`}
                            >
                              {item.weather?.[0]?.description || "—"}
                            </div>
                            {/* Add weather icon for current hour */}
                            {isNow && (
                              <div className="hour-weather-icon">
                                {getWeatherIcon(
                                  item.weather?.[0]?.description,
                                  32
                                )}
                              </div>
                            )}
                            <div className="hour-meta">
                              <div>
                                <span className="badge">Wind</span>{" "}
                                {convertSpeed(item.wind?.speed)}{" "}
                                {windDir(item.wind?.deg)}
                              </div>
                              <div>
                                <span className="badge">Pressure</span>{" "}
                                {convertPressure(item.main?.pressure)}
                              </div>
                              <div>
                                <span className="badge">Humidity</span>{" "}
                                {typeof item.main?.humidity === "number"
                                  ? `${item.main?.humidity}%`
                                  : "—"}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
    </div>
  );
}
