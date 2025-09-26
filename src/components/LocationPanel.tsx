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
  favorite?: boolean
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
  onDeleteSearch?: (id?: number) => void
  onToggleFavorite?: (item: SearchItem) => void
  onClearAll?: () => void
  showPrevious?: boolean
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
  onDeleteSearch,
  onToggleFavorite,
  onClearAll,
  showPrevious = true,
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

      <div style={{ display: 'flex', gap: 8, marginTop: 12, marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => onClearAll?.()}
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer' }}
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
                <li key={s.id} className="prev-search-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{s.city}</strong>{s.country ? `, ${s.country}` : ''}
                    <span className="prev-search-time" style={{ marginLeft: 8 }}>
                      {s.timestamp ? new Date(s.timestamp).toLocaleString() : ''}
                    </span>
                  </div>
                  <div style={{ display: 'inline-flex', gap: 8 }}>
                    <button
                      type="button"
                      title={s.favorite ? 'Unfavorite' : 'Mark favorite'}
                      onClick={() => onToggleFavorite?.(s)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                        background: s.favorite ? '#fde68a' : '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      {s.favorite ? '★' : '☆'}
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => onDeleteSearch?.(s.id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid #fca5a5',
                        background: '#fee2e2',
                        color: '#7f1d1d',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
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
  )
}
