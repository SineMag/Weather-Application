import WeatherCard from './WeatherCard'

export type DailyPayload = {
  city?: { name?: string; country?: string }
  days?: Array<{
    date?: string
    temp_min?: number
    temp_max?: number
    humidity_mean?: number
    wind_speed_max?: number
    wind_dir?: number
    weather_text?: string
  }>
} | null

// Minimal hourly forecast shape compatible with WeatherCard

type SearchItem = {
  id?: number
  city?: string
  country?: string
  timestamp?: string
}

type LocationPanelProps = {
  daily: DailyPayload
  unit: 'metric' | 'imperial'
  setUnit: (u: 'metric' | 'imperial') => void
  convertTemp: (t?: number) => string
  convertSpeed: (s?: number) => string
  windDir: (deg?: number) => string | undefined
  convertPressure: (p?: number) => string
  previous: SearchItem[]
}

export default function LocationPanel({
  daily,
  unit,
  setUnit,
  convertTemp,
  convertSpeed,
  windDir,
  convertPressure,
  previous,
}: LocationPanelProps) {
  return (
    <div>
      <h2>Current Location Weather</h2>
      {daily ? (
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
      )}

      <div className="prev-searches">
        <h3>Previous searches</h3>
        {previous?.length ? (
          <ul>
            {previous.map((s) => (
              <li key={s.id} className="prev-search-item">
                <strong>{s.city}</strong>{s.country ? `, ${s.country}` : ''}
                <span className="prev-search-time">
                  {s.timestamp ? new Date(s.timestamp).toLocaleString() : ''}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No previous searches.</p>
        )}
      </div>
    </div>
  )
}
