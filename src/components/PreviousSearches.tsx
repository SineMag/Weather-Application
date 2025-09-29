import React from 'react'

export type PreviousSearch = {
  id?: number
  city?: string
  country?: string
  timestamp?: string
  favorite?: boolean
  weather?: any
}

type PreviousSearchesProps = {
  items: PreviousSearch[]
  onDelete?: (id?: number) => void
  onToggleFavorite?: (item: PreviousSearch) => void
  onSelect?: (item: PreviousSearch) => void
}

export default function PreviousSearches({ items, onDelete, onToggleFavorite, onSelect }: PreviousSearchesProps) {
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Previous searches</h2>
      {items?.length ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
          {items.map((s) => (
            <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.06)' }}>
              <div>
                <button
                  type="button"
                  onClick={() => onSelect?.(s)}
                  style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 600 }}
                  title="Load this location"
                >
                  {s.city}
                </button>{s.country ? `, ${s.country}` : ''}
                <span style={{ marginLeft: 8, color: 'var(--muted)' }}>{s.timestamp ? new Date(s.timestamp).toLocaleString() : ''}</span>
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
                  onClick={() => onDelete?.(s.id)}
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
        <p style={{ color: 'var(--muted)' }}>No previous searches.</p>
      )}
    </div>
  )
}
