import React from 'react'
import './WeatherCard.css'

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
  unit?: 'metric' | 'imperial';
  setUnit?: (u: 'metric' | 'imperial') => void;
  convertTemp?: (t?: number) => string;
  convertSpeed?: (s?: number) => string;
  windDir?: (deg?: number) => string | undefined;
  convertPressure?: (p?: number) => string;
};

export default function WeatherCard({
  result,
  daily,
  unit = 'metric',
  setUnit,
  convertTemp,
  convertSpeed,
  windDir,
  convertPressure,
}: WeatherCardProps) {
  return (
    <div className='weatherCard'>
      {/* Daily cards: show if provided */}
      {daily && setUnit && convertTemp && convertSpeed && windDir && (
        <div>
          <h2>
            {daily.city?.name}, {daily.city?.country}
          </h2>
          <button className='unit-toggle' onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}>
            Switch to {unit === 'metric' ? '°F / km/h' : '°C / km/h'}
          </button>

          <div className='daily-grid'>
            {daily.days?.map((d, idx) => (
              <div key={idx} className='day-card'>
                <div className='day-title'>
                  {d.date ? new Date(d.date).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' }) : '-'}
                </div>
                <div className='temps'>
                  {convertTemp?.(d.temp_max)} / {convertTemp?.(d.temp_min)}
                </div>
                <div className='desc'>{d.weather_text || '-'}</div>
                <div className='meta'>
                  <div>Humidity: {typeof d.humidity_mean === 'number' ? `${d.humidity_mean}%` : '-'}</div>
                  <div>
                    Wind: {convertSpeed?.(d.wind_speed_max)} {windDir?.(d.wind_dir)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {result && setUnit && convertTemp && convertSpeed && windDir && convertPressure && (
        <div>
          <h2>
            {result.city?.name}, {result.city?.country}
          </h2>
          <button className='unit-toggle' onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}>
            Switch to {unit === 'metric' ? '°F / mph' : '°C / km/h'}
          </button>

          <div className='hourly-grid'>
            {result.list?.slice(0, 12).map((item, idx) => (
              <div key={idx} className='hour-card' aria-label={`Forecast for ${item.dt_txt}`}>
                <div className='hour-time'>
                  {item.dt_txt ? new Date(item.dt_txt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '-'}
                </div>
                <div className='hour-temp'>
                  {convertTemp(item.main?.temp)}
                </div>
                <div className='hour-desc'>
                  {item.weather?.[0]?.description || '—'}
                </div>
                <div className='hour-meta'>
                  <div>
                    <span className='badge'>Wind</span> {convertSpeed(item.wind?.speed)} {windDir(item.wind?.deg)}
                  </div>
                  <div>
                    <span className='badge'>Pressure</span> {convertPressure(item.main?.pressure)}
                  </div>
                  <div>
                    <span className='badge'>Humidity</span> {typeof item.main?.humidity === 'number' ? `${item.main?.humidity}%` : '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
