import WeatherCard from "./WeatherCard";
import { FaTrash, FaSave } from "react-icons/fa";

export type DailyPayload = {
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
} | null;

// Minimal hourly forecast shape compatible with WeatherCard

type SearchItem = {
  id?: number;
  city?: string;
  country?: string;
  timestamp?: string;
  favorite?: boolean;
};

type LocationPanelProps = {
  daily: DailyPayload;
  result?: any | null;
  viewMode?: "daily" | "hourly";
  unit: "metric" | "imperial";
  setUnit: (u: "metric" | "imperial") => void;
  convertTemp: (t?: number) => string;
  convertSpeed: (s?: number) => string;
  windDir: (deg?: number) => string | undefined;
  convertPressure: (p?: number) => string;
  previous: SearchItem[];
  onDeleteSearch?: (id?: number) => void;
  onSelectSaved?: (item: SearchItem) => void;
  onClearAll?: () => void;
  onSaveCurrent?: () => void;
  showPrevious?: boolean;
};

export default function LocationPanel({
  daily,
  result,
  viewMode = "daily",
  unit,
  setUnit,
  convertTemp,
  convertSpeed,
  windDir,
  convertPressure,
  previous,
  onDeleteSearch,
  onSelectSaved,
  onClearAll,
  onSaveCurrent,
  showPrevious = false,
}: LocationPanelProps) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2>Current Location Weather</h2>
        {daily?.city?.name && (
          <button
            type="button"
            onClick={() => onSaveCurrent?.()}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #86efac",
              background: "#dcfce7",
              color: "#166534",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 500,
            }}
            title="Save current location"
          >
            <FaSave size={14} /> Save Location
          </button>
        )}
      </div>
      {viewMode === "daily" ? (
        daily ? (
          <WeatherCard
            daily={daily || undefined}
            unit={unit}
            setUnit={setUnit}
            convertTemp={convertTemp}
            convertSpeed={convertSpeed}
            windDir={windDir}
            convertPressure={convertPressure}
          />
        ) : (
          <p>Search for a city to view location details.</p>
        )
      ) : result ? (
        <WeatherCard
          result={result || undefined}
          unit={unit}
          setUnit={setUnit}
          convertTemp={convertTemp}
          convertSpeed={convertSpeed}
          windDir={windDir}
          convertPressure={convertPressure}
        />
      ) : (
        <p>Search for a city to view hourly forecast.</p>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => onClearAll?.()}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            cursor: "pointer",
          }}
        >
          Clear Previous Searches
        </button>
      </div>

      {showPrevious && (
        <div className="prev-searches">
          <h3>Previous searches</h3>
          {previous?.length ? (
            <ul>
              {previous.map((s) => (
                <li
                  key={s.id}
                  className="prev-search-item"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => onSelectSaved?.(s)}
                      style={{
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                      title="Load this location"
                    >
                      {s.city}
                    </button>
                    {s.country ? `, ${s.country}` : ""}
                    <span
                      className="prev-search-time"
                      style={{ marginLeft: 8 }}
                    >
                      {s.timestamp
                        ? (() => {
                            const date = new Date(s.timestamp);
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
                        : ""}
                    </span>
                  </div>
                  <div style={{ display: "inline-flex", gap: 8 }}>
                    <button
                      type="button"
                      title="View"
                      onClick={() => onSelectSaved?.(s)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                        color: "var(--text)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        fontWeight: 500,
                      }}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => onDeleteSearch?.(s.id)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid #fca5a5",
                        background: "#fee2e2",
                        color: "#7f1d1d",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <FaTrash size={14} /> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No previous searches.</p>
          )}
        </div>
      )}
    </div>
  );
}
