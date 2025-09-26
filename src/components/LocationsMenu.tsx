export type SavedLocation = { id?: number; city?: string; country?: string; weather?: any };

type LocationsMenuProps = {
  // Backward-compat: original prop for saved items (from API)
  saved?: SavedLocation[];
  // New: complete previous searches list (preferred source)
  previous?: SavedLocation[];
  // New: current location derived from the active daily payload
  current?: SavedLocation | null;
  onAddCurrent: () => void;
  onRemoveSaved: (loc: SavedLocation) => void;
  onSelectSaved: (loc: SavedLocation) => void;
  onClose: () => void;
};

export default function LocationsMenu({ saved, previous, current, onAddCurrent, onRemoveSaved, onSelectSaved, onClose }: LocationsMenuProps) {
  const list = (previous && previous.length ? previous : (saved || []));

  return (
    <div style={{
      background: 'var(--surface, #fff)',
      color: 'inherit',
      border: '1px solid var(--border, #e5e7eb)',
      borderRadius: 12,
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
      width: 300,
      padding: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <strong>Locations</strong>
        <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
          ✕
        </button>
      </div>

      {/* Current location section */}
      {current?.city ? (
        <div style={{
          border: '1px solid var(--border, #e5e7eb)',
          borderRadius: 10,
          padding: 10,
          marginBottom: 10,
          background: 'var(--surface-1, #fafafa)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted, #666)' }}>Current</div>
              <div><strong>{current.city}</strong>{current.country ? `, ${current.country}` : ''}</div>
            </div>
            <div style={{ display: 'inline-flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => onSelectSaved(current)}
                style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
                title="Open current location"
              >
                Open
              </button>
              <button
                type="button"
                onClick={onAddCurrent}
                style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}
                title="Save current location"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onAddCurrent}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', marginBottom: 10 }}
        >
          Save current location
        </button>
      )}

      {/* Previous searches list */}
      <div style={{ fontSize: 12, color: 'var(--muted, #666)', marginBottom: 6 }}>Previous searches</div>
      {list?.length ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 260, overflowY: 'auto' }}>
          {list.map((loc, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
              <button
                type="button"
                onClick={() => onSelectSaved(loc)}
                style={{ border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}
                title="Load this location"
              >
                <span>
                  <strong>{loc.city}</strong>{loc.country ? `, ${loc.country}` : ''}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onRemoveSaved(loc)}
                style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}
                title="Remove saved location"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ color: 'var(--muted, #666)', fontSize: 14 }}>No previous searches yet.</div>
      )}
    </div>
  );
}
