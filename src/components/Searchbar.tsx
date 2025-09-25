import { useState } from 'react'

type ForecastItem = {
  dt?: number
  dt_txt?: string
  main?: {
    temp?: number
    feels_like?: number
    temp_min?: number
    temp_max?: number
    pressure?: number
    humidity?: number
  }
  wind?: { speed?: number; deg?: number }
  weather?: { description?: string }[]
}

type ForecastResponse = {
  city?: { name?: string; country?: string }
  list?: ForecastItem[]
}

export default function Searchbar() {
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ForecastResponse | null>(null)
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric') // default °C

  // 🔹 replace with your MockAPI project base URL
  const mockBase = 'https://<YOUR_PROJECT>.mockapi.io'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    const query = city.trim()
    if (!query) {
      setError('Please enter a city name.')
      return
    }

    setLoading(true)
    try {
      const url = `${mockBase}/forecasts?city.name=${encodeURIComponent(query)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`MockAPI request failed: ${res.status}`)
      const arr = await res.json()
      if (!arr.length) throw new Error('No mock data for that city.')
      setResult(arr[0] as ForecastResponse)
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch weather')
    } finally {
      setLoading(false)
    }
  }

  const windDir = (deg?: number) => {
    if (typeof deg !== 'number') return undefined
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    return dirs[Math.round(deg / 45) % 8]
  }

  // conversions
  const convertTemp = (t?: number) =>
    typeof t !== 'number'
      ? '-'
      : unit === 'metric'
      ? `${t.toFixed(1)} °C`
      : `${((t * 9) / 5 + 32).toFixed(1)} °F`

  const convertSpeed = (s?: number) =>
    typeof s !== 'number'
      ? '-'
      : unit === 'metric'
      ? `${s.toFixed(1)} m/s`
      : `${(s * 2.23694).toFixed(1)} mph`

  const convertPressure = (p?: number) =>
    typeof p !== 'number'
      ? '-'
      : unit === 'metric'
      ? `${p.toFixed(0)} hPa`
      : `${(p * 0.02953).toFixed(2)} inHg`

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <div role="alert">{error}</div>}

      {result && (
        <div>
          <h2>
            {result.city?.name}, {result.city?.country}
          </h2>
          <button onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}>
            Switch to {unit === 'metric' ? '°F / mph' : '°C / m/s'}
          </button>

          <ul>
            {result.list?.map((item, idx) => (
              <li key={idx}>
                <strong>{item.dt_txt}</strong> – {convertTemp(item.main?.temp)} (
                {item.weather?.[0]?.description}) | Wind: {convertSpeed(item.wind?.speed)}{' '}
                {windDir(item.wind?.deg)} | Pressure: {convertPressure(item.main?.pressure)} | Humidity:{' '}
                {item.main?.humidity}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
