import { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import "./App.css";
import Navbar from "./components/Navbar";
import MainSection from "./layout/MainSection";
import Searchbar from "./components/Searchbar";
import WeatherCard from "./components/WeatherCard";
import LocationPanel from "./components/LocationPanel";
import Snackbar from "./components/Snackbar";
import Settings from "./layout/Settings";
import Error404Page from "./layout/Error404Page";

type NavItem = "home" | "location" | "map" | "notes" | "profile" | "settings";

function App() {
  // Minimal 404 handling: since we don't use a router, any non-root path is treated as 404
  if (typeof window !== 'undefined' && window.location.pathname !== '/') {
    return <Error404Page />;
  }
  const [currentSection, setCurrentSection] = useState<NavItem>(() => {
    const stored = localStorage.getItem("activeSection");
    return (stored as NavItem) || "home";
  });

  // Lifted weather state
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [daily, setDaily] = useState<{
    city?: { name?: string; country?: string };
    days?: Array<{
      date?: string;
      temp_min?: number;
      temp_max?: number;
      humidity_mean?: number;
      wind_speed_max?: number;
      wind_dir?: number;
      weather_text?: string;
    }>;
  } | null>(null);
  type SearchItem = {
    id?: number;
    city?: string;
    country?: string;
    timestamp?: string;
    favorite?: boolean;
  };

  // Clear all previous searches
  const clearAllSearches = async () => {
    try {
      const API = "http://localhost:3001/searches";
      const ids = previous.map((s) => s.id).filter(Boolean) as number[];
      await Promise.all(ids.map((id) => fetch(`${API}/${id}`, { method: 'DELETE' })));
      setPrevious([]);
      setToastType('success');
      setToastMessage('Cleared previous searches');
    } catch {
      setToastType('error');
      setToastMessage('Failed to clear searches');
    }
  };

  // Saved locations handlers
  const addSavedLocation = (loc?: { city?: string; country?: string }) => {
    if (!loc?.city) return;
    setSaved((prev) => {
      const next = [...prev.filter((s) => s.city !== loc.city || s.country !== loc.country), { city: loc.city, country: loc.country }];
      localStorage.setItem('saved_locations', JSON.stringify(next));
      setToastType('success');
      setToastMessage('Saved location');
      return next;
    });
  };

  const removeSavedLocation = (loc?: { city?: string; country?: string }) => {
    if (!loc?.city) return;
    setSaved((prev) => {
      const next = prev.filter((s) => !(s.city === loc.city && s.country === loc.country));
      localStorage.setItem('saved_locations', JSON.stringify(next));
      setToastType('info');
      setToastMessage('Removed saved location');
      return next;
    });
  };
  const [previous, setPrevious] = useState<SearchItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'info' | 'warning' | 'error' | 'success'>('info');
  // Saved locations (in localStorage only)
  type SavedLocation = { city?: string; country?: string };
  const [saved, setSaved] = useState<SavedLocation[]>(() => {
    try {
      const raw = localStorage.getItem('saved_locations');
      return raw ? (JSON.parse(raw) as SavedLocation[]) : [];
    } catch {
      return [];
    }
  });

  // Converters and helpers
  const windDir = (deg?: number) => {
    if (typeof deg !== "number") return undefined;
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  };

  // Build an advisory/alert message based on current weather
  const getAlert = () => {
    const t = (daily?.days?.[0]?.weather_text || "").toLowerCase();
    if (!t) return undefined;
    if (t.includes("thunder"))
      return { type: "warning" as const, message: "Thunderstorm expected. Stay indoors and avoid open areas." };
    if (t.includes("snow"))
      return { type: "warning" as const, message: "Snow conditions expected. Drive carefully and dress warm." };
    if (t.includes("rain") || t.includes("drizzle") || t.includes("shower"))
      return { type: "info" as const, message: "Rainy conditions. Carry an umbrella." };
    if (t.includes("wind"))
      return { type: "info" as const, message: "Windy conditions. Secure loose items outdoors." };
    return undefined;
  };

  const convertTemp = (t?: number) =>
    typeof t !== "number" ? "-" : unit === "metric" ? `${t.toFixed(1)} °C` : `${((t * 9) / 5 + 32).toFixed(1)} °F`;

  const convertSpeed = (s?: number) =>
    typeof s !== "number" ? "-" : unit === "metric" ? `${(s * 3.6).toFixed(1)} km/h` : `${(s * 2.23694).toFixed(1)} mph`;

  const convertPressure = (p?: number) =>
    typeof p !== "number" ? "-" : unit === "metric" ? `${p.toFixed(0)} hPa` : `${(p * 0.02953).toFixed(2)} inHg`;

  useEffect(() => {
    localStorage.setItem("activeSection", currentSection);
  }, [currentSection]);

  // Load previous searches from json-server on mount
  useEffect(() => {
    const API = "http://localhost:3001/searches";
    fetch(API)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => (Array.isArray(rows) ? setPrevious(rows) : setPrevious([])))
      .catch(() => setPrevious([]));
  }, []);

  // CRUD actions for previous searches
  const deleteSearch = async (id?: number) => {
    if (!id) return;
    try {
      const API = "http://localhost:3001/searches";
      await fetch(`${API}/${id}`, { method: "DELETE" });
      setPrevious((p) => p.filter((s) => s.id !== id));
      setToastType('success');
      setToastMessage('Removed from previous searches');
    } catch (_) {
      setToastType('error');
      setToastMessage('Failed to remove search');
    }
  };

  const toggleFavorite = async (item: SearchItem) => {
    if (!item.id) return;
    const next = !item.favorite;
    try {
      const API = "http://localhost:3001/searches";
      const res = await fetch(`${API}/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: next }),
      });
      if (res.ok) {
        setPrevious((p) => p.map((s) => (s.id === item.id ? { ...s, favorite: next } : s)));
        setToastType('success');
        setToastMessage(next ? 'Marked as favorite' : 'Unmarked favorite');
      }
    } catch (_) {
      setToastType('error');
      setToastMessage('Failed to update favorite');
    }
  };

  const handleNavigation = (section: NavItem) => {
    setCurrentSection(section);
    console.log(`Navigated to: ${section}`);
  };

  // Pick a background class for the GIF wrapper based on weather text
  const getBgClass = (text?: string) => {
    const t = (text || "").toLowerCase();
    if (t.includes("thunder")) return "storm";
    if (t.includes("snow")) return "snow";
    if (t.includes("wind")) return "windy";
    if (t.includes("rain") || t.includes("drizzle") || t.includes("shower")) return "rain";
    if (t.includes("clear") || t.includes("sun")) return "sunny";
    if (t.includes("cloud")) return "cloudy";
    return "cloudy";
  };

  const renderMainContent = () => {
    switch (currentSection) {
      case "home":
        return (
          <div className="home-content">
            <MainSection>
              {daily && (
                <div className={`weather-bg ${getBgClass(daily?.days?.[0]?.weather_text)}`}>
                  {getAlert() && (
                    <div className="alert-wrapper">
                      <Snackbar message={getAlert()!.message} type={getAlert()!.type} />
                    </div>
                  )}
                  <LocationPanel
                    daily={daily}
                    unit={unit}
                    setUnit={setUnit}
                    convertTemp={convertTemp}
                    convertSpeed={convertSpeed}
                    windDir={windDir}
                    convertPressure={convertPressure}
                    previous={previous}
                    onDeleteSearch={deleteSearch}
                    onToggleFavorite={toggleFavorite}
                    onClearAll={clearAllSearches}
                    saved={saved}
                    onAddSaved={() => addSavedLocation(daily?.city)}
                    onRemoveSaved={(loc) => removeSavedLocation(loc)}
                  />
                </div>
              )}
            </MainSection>
          </div>
        );
      case "location":
        return (
          <div className="location-content">
            <div className={`weather-bg ${getBgClass(daily?.days?.[0]?.weather_text)}`}>
              {getAlert() && (
                <div className="alert-wrapper">
                  <Snackbar message={getAlert()!.message} type={getAlert()!.type} />
                </div>
              )}
              <LocationPanel
                daily={daily}
                unit={unit}
                setUnit={setUnit}
                convertTemp={convertTemp}
                convertSpeed={convertSpeed}
                windDir={windDir}
                convertPressure={convertPressure}
                previous={previous}
                onDeleteSearch={deleteSearch}
                onToggleFavorite={toggleFavorite}
                onClearAll={clearAllSearches}
                saved={saved}
                onAddSaved={() => addSavedLocation(daily?.city)}
                onRemoveSaved={(loc) => removeSavedLocation(loc)}
              />
            </div>
          </div>
        );
      case "map":
        return (
          <div className="map-content">
            <h2>Weather Map</h2>
            <p>Interactive weather map will be displayed here.</p>
          </div>
        );
      case "notes":
        return (
          <div className="notes-content">
            <h2>Weather Notes</h2>
            <p>Your weather observations and notes will be shown here.</p>
          </div>
        );
      case "profile":
        return (
          <div className="profile-content">
            <h2>User Profile</h2>
            <p>Manage your profile settings and preferences.</p>
          </div>
        );
      case "settings":
        return (
          <div className="settings-content">
            <Settings onNotify={(msg, type = 'info') => { setToastType(type); setToastMessage(msg); }} />
          </div>
        );
      default:
        return (
          <div className="home-content">
            <h2>Weather</h2>
            <p>Hello and Welcome</p>
          </div>
        );
    }
  };

  return (
    <>
      <div className="app-container">
        <div className="navbar">
          <Navbar activeItem={currentSection} onNavigate={handleNavigation} />
        </div>
        <main className="main-content">
          {/* top section with search and profile sections */}
          <div className="topNavBar">
            <div>
              {/* searchbar using city names ..search for weather */}
              <Searchbar
                onDaily={async (payload) => {
                  setDaily(payload);
                  // persist to json-server
                  try {
                    const API = "http://localhost:3001/searches";
                    const body = {
                      city: payload?.city?.name,
                      country: payload?.city?.country,
                      timestamp: new Date().toISOString(),
                    };
                    const res = await fetch(API, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(body),
                    });
                    const saved = await res.json();
                    if (res.ok) setPrevious((p) => [saved, ...p].slice(0, 20));
                  } catch (_) {
                    // ignore persistence errors
                  }
                }}
              />
            </div>
          
          </div>
          {/* Global snackbar */}
          <div style={{ position: 'sticky', top: 16, zIndex: 10 }}>
            <Snackbar message={toastMessage} type={toastType} autoHideMs={3000} />
          </div>
          {/* Dynamic content based on selected navigation */}
          <div className="content-area">{renderMainContent()}</div>
        </main>
      </div>
    </>
  );
}

export default App;
