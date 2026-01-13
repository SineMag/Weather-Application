import { useEffect, useState, useMemo } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import LocationPanel from "./components/LocationPanel";
import Snackbar from "./components/Snackbar";
import Settings from "./layout/Settings";
import Error404Page from "./layout/Error404Page";
import Searchbar from "./components/Searchbar";
import PreviousSearches from "./components/PreviousSearches";
import type { DailyPayload } from "./components/LocationPanel";

import { MdAcUnit } from "react-icons/md";
import { BsCloudRainHeavy } from "react-icons/bs";
import { FaCloud, FaSun, FaWind, FaBolt } from "react-icons/fa";

type NavItem = "home" | "location" | "map" | "notes" | "settings";

type SearchItem = {
  id?: number;
  city?: string;
  country?: string;
  timestamp?: string;
  favorite?: boolean;
  weather?: any;
};

function App() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [currentSection, setCurrentSection] = useState<NavItem>(
    (localStorage.getItem("activeSection") as NavItem) || "home"
  );
  const [daily, setDaily] = useState<DailyPayload | null>(() => {
    // Try to load cached daily data on startup if offline (with expiration check)
    try {
      const cached = localStorage.getItem("cached_daily");
      if (cached) {
        const cacheData = JSON.parse(cached);
        if (cacheData.expiresAt && Date.now() < cacheData.expiresAt) {
          return cacheData.data;
        } else if (!navigator.onLine && cacheData.data) {
          // Use expired cache if offline (better than nothing)
          return cacheData.data;
        } else {
          // Remove expired cache
          localStorage.removeItem("cached_daily");
        }
      }
    } catch {}
    return null;
  });
  type HourlyResult = {
    city?: { name?: string; country?: string };
    list?: any[];
  } | null;
  const [hourly, setHourly] = useState<HourlyResult>(null);
  const [viewMode, setViewMode] = useState<"daily" | "hourly">(
    () => (localStorage.getItem("view_mode") as "daily" | "hourly") || "daily"
  );
  const [coords, setCoords] = useState<{
    lat: number;
    lon: number;
    name?: string;
    country?: string;
  } | null>(null);
  const [previous, setPrevious] = useState<SearchItem[]>(() => {
    try {
      const raw = localStorage.getItem("previous_searches");
      return raw ? (JSON.parse(raw) as SearchItem[]) : [];
    } catch {
      return [];
    }
  });
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<
    "info" | "warning" | "error" | "success"
  >("info");

  // -------------------------
  // Helpers
  // -------------------------
  const windDir = (deg?: number) => {
    if (typeof deg !== "number") return undefined;
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  };

  const convertTemp = (t?: number) =>
    typeof t !== "number"
      ? "-"
      : unit === "metric"
      ? `${t.toFixed(1)} °C`
      : `${((t * 9) / 5 + 32).toFixed(1)} °F`;

  const convertSpeed = (s?: number) =>
    typeof s !== "number"
      ? "-"
      : unit === "metric"
      ? `${(s * 3.6).toFixed(1)} km/h`
      : `${(s * 2.23694).toFixed(1)} mph`;

  const convertPressure = (p?: number) =>
    typeof p !== "number"
      ? "-"
      : unit === "metric"
      ? `${p.toFixed(0)} hPa`
      : `${(p * 0.02953).toFixed(2)} inHg`;

  const getBgClass = (text?: string) => {
    const t = (text || "").toLowerCase();
    if (t.includes("thunder")) return "storm";
    if (t.includes("snow")) return "snow";
    if (t.includes("wind")) return "windy";
    if (t.includes("rain") || t.includes("drizzle") || t.includes("shower"))
      return "rain";
    if (t.includes("clear") || t.includes("sun")) return "sunny";
    if (t.includes("cloud")) return "cloudy";
    return "cloudy";
  };

  const getAlert = useMemo(() => {
    if (!daily?.days || daily.days.length < 2) return undefined;

    const today = daily.days[0];
    const tomorrow = daily.days[1];
    const todayText = (today?.weather_text || "").toLowerCase();
    const tomorrowText = (tomorrow?.weather_text || "").toLowerCase();

    // Check for severe weather today
    if (todayText.includes("thunderstorm") || todayText.includes("thunder")) {
      const tomorrowMsg =
        tomorrowText.includes("clear") || tomorrowText.includes("sunny")
          ? " Clear skies expected tomorrow."
          : "";
      return {
        type: "warning" as const,
        message: `Severe weather approaching: ${
          today.weather_text || "Thunderstorm"
        } today.${tomorrowMsg} Stay indoors and avoid open areas.`,
      };
    }

    if (todayText.includes("heavy snow") || todayText.includes("blizzard")) {
      const tomorrowMsg =
        tomorrowText.includes("clear") || tomorrowText.includes("sunny")
          ? " Sunny tomorrow."
          : "";
      return {
        type: "warning" as const,
        message: `Severe weather approaching: ${
          today.weather_text || "Heavy snow"
        } today.${tomorrowMsg} Drive carefully and dress warm.`,
      };
    }

    if (todayText.includes("heavy rain") || todayText.includes("violent")) {
      const tomorrowMsg =
        tomorrowText.includes("clear") || tomorrowText.includes("sunny")
          ? " Sunny tomorrow."
          : "";
      return {
        type: "warning" as const,
        message: `Severe weather approaching: ${
          today.weather_text || "Heavy rain"
        } today.${tomorrowMsg} Avoid travel if possible.`,
      };
    }

    // Check for weather improvements (positive alerts)
    if (
      (todayText.includes("rain") ||
        todayText.includes("cloud") ||
        todayText.includes("snow")) &&
      (tomorrowText.includes("clear") || tomorrowText.includes("sunny"))
    ) {
      return {
        type: "success" as const,
        message: `Good news! ${
          today.weather_text || "Cloudy"
        } today, but sunny tomorrow.`,
      };
    }

    // General weather alerts
    if (
      todayText.includes("rain") ||
      todayText.includes("drizzle") ||
      todayText.includes("shower")
    ) {
      return {
        type: "info" as const,
        message: `Rainy conditions today: ${
          today.weather_text || "Rain"
        }. Carry an umbrella.`,
      };
    }

    if (todayText.includes("snow")) {
      return {
        type: "info" as const,
        message: `Snow conditions today: ${
          today.weather_text || "Snow"
        }. Drive carefully.`,
      };
    }

    if (todayText.includes("wind")) {
      return {
        type: "info" as const,
        message: `Windy conditions today. Secure loose items outdoors.`,
      };
    }

    return undefined;
  }, [daily]);

  // Notify user if alerts are enabled in settings
  useEffect(() => {
    const enabled = localStorage.getItem("notifications_enabled") === "true";
    if (!enabled || !getAlert) return;
    if (!("Notification" in window)) return;

    try {
      if (Notification.permission === "granted") {
        const notification = new Notification("Weather Services Alert", {
          body: getAlert.message,
          icon: "/src/assets/favicon.ico",
          tag: "weather-alert",
          requireInteraction: getAlert.type === "warning",
        });

        // Auto-close after 5 seconds for non-warning alerts
        if (getAlert.type !== "warning") {
          setTimeout(() => notification.close(), 5000);
        }
      } else if (Notification.permission === "default") {
        // Request permission if not yet determined
        Notification.requestPermission().then((permission) => {
          if (permission === "granted" && getAlert) {
            new Notification("Weather Services Alert", {
              body: getAlert.message,
              icon: "/src/assets/favicon.ico",
            });
          }
        });
      }
    } catch (error) {
      console.error("Notification error:", error);
    }
  }, [getAlert]);

  // -------------------------
  // Weather Icon Background Component
  // -------------------------
  const WeatherIconBackground: React.FC<{ weatherText?: string }> = ({
    weatherText,
  }) => {
    const bgClass = getBgClass(weatherText);
    const iconSize = 200;
    const iconStyle: React.CSSProperties = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      opacity: 0.15,
      zIndex: 0,
      pointerEvents: "none",
    };

    switch (bgClass) {
      case "sunny":
        return (
          <FaSun size={iconSize} style={{ ...iconStyle, color: "#FFA500" }} />
        );
      case "cloudy":
        return (
          <FaCloud size={iconSize} style={{ ...iconStyle, color: "#708090" }} />
        );
      case "rain":
        return (
          <BsCloudRainHeavy
            size={iconSize}
            style={{ ...iconStyle, color: "#4682B4" }}
          />
        );
      case "snow":
        return (
          <MdAcUnit
            size={iconSize}
            style={{ ...iconStyle, color: "#E0E0E0" }}
          />
        );
      case "windy":
        return (
          <FaWind size={iconSize} style={{ ...iconStyle, color: "#87CEEB" }} />
        );
      case "storm":
        return (
          <FaBolt size={iconSize} style={{ ...iconStyle, color: "#4B0082" }} />
        );
      default:
        return (
          <FaCloud size={iconSize} style={{ ...iconStyle, color: "#708090" }} />
        );
    }
  };

  // -------------------------
  // Effects
  // -------------------------
  useEffect(() => {
    localStorage.setItem("activeSection", currentSection);
  }, [currentSection]);

  useEffect(() => {
    try {
      localStorage.setItem("view_mode", viewMode);
    } catch {}
  }, [viewMode]);

  useEffect(() => {
    // Persist previous searches to localStorage whenever they change
    try {
      localStorage.setItem("previous_searches", JSON.stringify(previous));
    } catch {}
  }, [previous]);

  // Load weather for a saved/clicked location
  const handleSelectSaved = async (item: {
    city?: string;
    country?: string;
  }) => {
    const name = (item.city || "").trim();
    if (!name) return;
    try {
      // Geocode to get lat/lon (prioritize South African results)
      let geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        name
      )}&count=10&language=en&format=json`;

      // Check if it might be a South African city
      const saCities = [
        "johannesburg",
        "cape town",
        "durban",
        "pretoria",
        "port elizabeth",
        "bloemfontein",
        "nelspruit",
        "kimberley",
        "polokwane",
        "rustenburg",
        "witbank",
      ];
      if (
        saCities.some((city) => name.toLowerCase().includes(city.toLowerCase()))
      ) {
        geoUrl += "&country_codes=ZA";
      }

      const geoRes = await fetch(geoUrl);
      const geo = await geoRes.json();

      // Prioritize South African results if available
      let place = geo?.results?.[0];
      if (geo?.results?.length > 1) {
        const saResult = geo.results.find((r: any) => r.country_code === "ZA");
        if (saResult) place = saResult;
      }

      if (!place) throw new Error("Location not found");
      const { latitude, longitude, country } = place;
      setCoords({ lat: latitude, lon: longitude, name, country });

      // Hourly
      const forecastUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,weather_code` +
        `&forecast_days=3&timezone=auto&wind_speed_unit=ms`;
      const hRes = await fetch(forecastUrl);
      const h = await hRes.json();
      if (!hRes.ok) throw new Error("Failed to fetch hourly");

      const codeToText = (code?: number): string | undefined => {
        const map: Record<number, string> = {
          0: "Clear sky",
          1: "Mainly clear",
          2: "Partly cloudy",
          3: "Overcast",
          45: "Fog",
          48: "Depositing rime fog",
          51: "Light drizzle",
          53: "Moderate drizzle",
          55: "Dense drizzle",
          56: "Light freezing drizzle",
          57: "Dense freezing drizzle",
          61: "Slight rain",
          63: "Rain",
          65: "Heavy rain",
          66: "Light freezing rain",
          67: "Heavy freezing rain",
          71: "Slight snow",
          73: "Snow",
          75: "Heavy snow",
          77: "Snow grains",
          80: "Rain showers",
          81: "Heavy rain showers",
          82: "Violent rain showers",
          85: "Snow showers",
          86: "Heavy snow showers",
          95: "Thunderstorm",
          96: "Thunderstorm with hail",
          99: "Thunderstorm with heavy hail",
        };
        return typeof code === "number" ? map[code] || "—" : undefined;
      };

      const times: string[] = h?.hourly?.time || [];
      const temp: number[] = h?.hourly?.temperature_2m || [];
      const feels: number[] = h?.hourly?.apparent_temperature || [];
      const rh: number[] = h?.hourly?.relative_humidity_2m || [];
      const p: number[] = h?.hourly?.pressure_msl || [];
      const ws: number[] = h?.hourly?.wind_speed_10m || [];
      const wd: number[] = h?.hourly?.wind_direction_10m || [];
      const wc: number[] = h?.hourly?.weather_code || [];

      const entries = times.map((t, i) => ({ t, i }));
      const list = entries
        .filter(({ i }) => i % 2 === 0)
        .map(({ t, i }) => ({
          dt: Math.floor(new Date(t).getTime() / 1000),
          dt_txt: t,
          main: {
            temp: temp[i],
            feels_like: feels[i],
            pressure: p[i],
            humidity: rh[i],
          },
          wind: { speed: ws[i], deg: wd[i] },
          weather: [{ description: codeToText(wc[i]) }],
        }));
      setHourly({ city: { name, country }, list } as any);

      // Daily
      const dailyUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,wind_speed_10m_max,wind_direction_10m_dominant,weather_code` +
        `&forecast_days=7&past_days=1&timezone=auto&wind_speed_unit=ms`;
      const dRes = await fetch(dailyUrl);
      const d = await dRes.json();
      if (!dRes.ok) throw new Error("Failed to fetch daily");

      const dates: string[] = d?.daily?.time || [];
      const tmax: number[] = d?.daily?.temperature_2m_max || [];
      const tmin: number[] = d?.daily?.temperature_2m_min || [];
      const rhm: number[] = d?.daily?.relative_humidity_2m_mean || [];
      const wsMax: number[] = d?.daily?.wind_speed_10m_max || [];
      const wdDom: number[] = d?.daily?.wind_direction_10m_dominant || [];
      const wcode: number[] = d?.daily?.weather_code || [];

      const days = dates.map((date: string, i: number) => ({
        date,
        temp_min: tmin[i],
        temp_max: tmax[i],
        humidity_mean: rhm[i],
        wind_speed_max: wsMax[i],
        wind_dir: wdDom[i],
        weather_text: codeToText(wcode[i]),
      }));
      const dailyData = { city: { name, country }, days };
      setDaily(dailyData);
      // Cache daily data for offline use with expiration (24 hours)
      try {
        const cacheData = {
          data: dailyData,
          timestamp: Date.now(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        };
        localStorage.setItem("cached_daily", JSON.stringify(cacheData));
      } catch {}
      setViewMode("daily");
      setCurrentSection("location");
      setToastType("success");
      setToastMessage(`Loaded ${name}${country ? ", " + country : ""}`);
    } catch (e) {
      setToastType("error");
      setToastMessage("Failed to load saved location");
    }
  };

  // -------------------------
  // Handlers
  // -------------------------
  const handleNavigation = (section: NavItem) => setCurrentSection(section);

  const addSavedLocationFromDaily = async () => {
    if (!daily?.city?.name) {
      setToastType("warning");
      setToastMessage("No current location to save");
      setTimeout(() => setToastMessage(""), 2000);
      return;
    }

    const body: SearchItem = {
      id: Date.now(),
      city: daily.city.name,
      country: daily.city.country,
      timestamp: new Date().toISOString(),
      favorite: false,
      weather: daily.days || [],
    };

    setPrevious((p) =>
      [
        body,
        ...p.filter(
          (x) => !(x.city === body.city && x.country === body.country)
        ),
      ].slice(0, 20)
    );
    setToastType("success");
    setToastMessage(
      `Location saved: ${daily.city.name}${
        daily.city.country ? ", " + daily.city.country : ""
      }`
    );
    setTimeout(() => setToastMessage(""), 2000);
  };

  const clearAllSearches = async () => {
    setPrevious([]);
    setToastType("success");
    setToastMessage("Cleared previous searches");
  };

  const deleteSearch = async (id?: number) => {
    if (!id) return;
    const item = previous.find((s) => s.id === id);
    setPrevious((p) => p.filter((s) => s.id !== id));
    setToastType("success");
    setToastMessage(`Location deleted: ${item?.city || "Location"}`);
    setTimeout(() => setToastMessage(""), 2000);
  };

  // -------------------------
  // Render
  // -------------------------
  const renderMainContent = () => {
    switch (currentSection) {
      case "home":
      case "location":
        return (
          <div className={`${currentSection}-content`}>
            {daily && (
              <div
                className={`weather-bg ${getBgClass(
                  daily.days?.[0]?.weather_text
                )}`}
              >
                <WeatherIconBackground
                  weatherText={daily.days?.[0]?.weather_text}
                />
                {getAlert && (
                  <Snackbar message={getAlert.message} type={getAlert.type} />
                )}
                <LocationPanel
                  daily={daily}
                  result={hourly as any}
                  viewMode={viewMode}
                  unit={unit}
                  setUnit={setUnit}
                  convertTemp={convertTemp}
                  convertSpeed={convertSpeed}
                  windDir={windDir}
                  convertPressure={convertPressure}
                  previous={previous}
                  onDeleteSearch={deleteSearch}
                  onSelectSaved={handleSelectSaved}
                  onClearAll={clearAllSearches}
                  onSaveCurrent={addSavedLocationFromDaily}
                  showPrevious={false}
                />
              </div>
            )}
          </div>
        );
      case "map":
        return (
          <div className="map-content" style={{ display: "grid", gap: 12 }}>
            <h2>Map</h2>
            {coords ? (
              <>
                <div>
                  <strong>{coords.name}</strong>
                  {coords.country ? `, ${coords.country}` : ""}
                </div>
                <iframe
                  title="OpenStreetMap"
                  style={{
                    width: "100%",
                    height: 480,
                    border: 0,
                    borderRadius: 12,
                  }}
                  src={(function () {
                    const d = 0.05;
                    const left = coords.lon - d;
                    const bottom = coords.lat - d;
                    const right = coords.lon + d;
                    const top = coords.lat + d;
                    const bbox = `${left}%2C${bottom}%2C${right}%2C${top}`;
                    const marker = `${coords.lat}%2C${coords.lon}`;
                    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
                  })()}
                  allowFullScreen
                />
                <a
                  href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lon}#map=12/${coords.lat}/${coords.lon}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View larger map
                </a>
              </>
            ) : (
              <p>Select a location from searches to view it on the map.</p>
            )}
          </div>
        );
      case "notes":
        return (
          <PreviousSearches
            items={previous}
            onDelete={deleteSearch}
            onSelect={handleSelectSaved}
          />
        );
      case "settings":
        return (
          <Settings
            onNotify={(msg, type = "info") => {
              setToastType(type);
              setToastMessage(msg);
            }}
          />
        );
      default:
        return <Error404Page />;
    }
  };

  return (
    <div className="app-container">
      <div className="navbar">
        <Navbar activeItem={currentSection} onNavigate={handleNavigation} />
      </div>
      <main className="main-content">
        <div className="topNavBar">
          <Searchbar
            onDaily={async (payload) => {
              setDaily(payload);
              if (!payload?.city?.name) return;

              const body: SearchItem = {
                id: Date.now(),
                city: payload.city.name,
                country: payload.city.country,
                timestamp: new Date().toISOString(),
                favorite:
                  previous.find(
                    (s) =>
                      s.city === payload.city?.name &&
                      s.country === payload.city?.country
                  )?.favorite || false,
                weather: payload.days,
              };

              setPrevious((p) =>
                [
                  body,
                  ...p.filter(
                    (x) => !(x.city === body.city && x.country === body.country)
                  ),
                ].slice(0, 20)
              );
            }}
            onHourly={(payload) => {
              setHourly(payload as any);
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
          <button
            type="button"
            onClick={() => setViewMode("daily")}
            className={viewMode === "daily" ? "active" : ""}
          >
            Daily
          </button>
          <button
            type="button"
            onClick={() => setViewMode("hourly")}
            className={viewMode === "hourly" ? "active" : ""}
          >
            Hourly
          </button>
        </div>
        <div style={{ position: "sticky", top: 16, zIndex: 10 }}>
          <Snackbar message={toastMessage} type={toastType} autoHideMs={2000} />
        </div>
        <div className="content-area">{renderMainContent()}</div>
      </main>
    </div>
  );
}

export default App;
