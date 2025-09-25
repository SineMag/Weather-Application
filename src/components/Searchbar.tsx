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

  // Simple mapper for Open‑Meteo weather codes → short text
  const codeToText = (code?: number): string | undefined => {
    const map: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow',
      73: 'Snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Rain showers',
      81: 'Heavy rain showers',
      82: 'Violent rain showers',
      85: 'Snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Thunderstorm with heavy hail',
    }
    return typeof code === 'number' ? map[code] || '—' : undefined
  }

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
      // 🔹 1) Geocode city name → lat/lon (Open‑Meteo geocoding API)
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query
      )}&count=1&language=en&format=json`
      const geoRes = await fetch(geoUrl)
      const geo = await geoRes.json()
      const place = geo?.results?.[0]
      if (!place) {
        throw new Error('City not found. Try another city name.')
      }

      const { latitude, longitude, name, country } = place

      // 🔹 2) Fetch 3‑day hourly forecast with units matching your converters
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,weather_code` +
        `&forecast_days=3&timezone=auto&wind_speed_unit=ms`
      const res = await fetch(forecastUrl)
      const data = await res.json()

      if (!res.ok) {
        const providerMsg = data?.reason || data?.error || 'Open‑Meteo request failed'
        throw new Error(`${providerMsg}: ${res.status}`)
      }

      const times: string[] = data?.hourly?.time || []
      const temp: number[] = data?.hourly?.temperature_2m || []
      const feels: number[] = data?.hourly?.apparent_temperature || []
      const rh: number[] = data?.hourly?.relative_humidity_2m || []
      const p: number[] = data?.hourly?.pressure_msl || []
      const ws: number[] = data?.hourly?.wind_speed_10m || []
      const wd: number[] = data?.hourly?.wind_direction_10m || []
      const wc: number[] = data?.hourly?.weather_code || []

      // Downsample to every 2 hours by taking every 2nd index
      const entries = times.map((t, i) => ({ t, i }))
      const list: ForecastItem[] = entries
        .filter(({ i }) => i % 2 === 0)
        .map(({ t, i }) => ({
          dt: Math.floor(new Date(t).getTime() / 1000),
          dt_txt: t,
          main: {
            temp: temp[i],
            feels_like: feels[i],
            temp_min: undefined, // Not provided per-hour; keeping undefined
            temp_max: undefined,
            pressure: p[i],
            humidity: rh[i],
          },
          wind: { speed: ws[i], deg: wd[i] },
          weather: [{ description: codeToText(wc[i]) }],
        }))

      const transformed: ForecastResponse = {
        city: { name, country },
        list,
      }

      setResult(transformed)
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
      ? `${(s * 3.6).toFixed(1)} km/h`
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
            Switch to {unit === 'metric' ? '°F / mph' : '°C / km/h'}
          </button>

          <ul>
            {result.list?.slice(0, 12).map((item, idx) => (
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
