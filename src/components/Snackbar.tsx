import { useEffect, useState } from 'react'

type SnackbarProps = {
  message?: string
  type?: 'info' | 'warning' | 'error' | 'success'
  autoHideMs?: number
}

export default function Snackbar({ message, type = 'info', autoHideMs = 5000 }: SnackbarProps) {
  const [open, setOpen] = useState(Boolean(message))
  useEffect(() => {
    setOpen(Boolean(message))
    if (message && autoHideMs > 0) {
      const id = setTimeout(() => setOpen(false), autoHideMs)
      return () => clearTimeout(id)
    }
  }, [message, autoHideMs])

  if (!open || !message) return null

  const bg =
    type === 'error' ? '#fee2e2' :
    type === 'warning' ? '#fef3c7' :
    type === 'success' ? '#dcfce7' : '#e0f2fe'
  const color = '#111'
  const border =
    type === 'error' ? '#fecaca' :
    type === 'warning' ? '#fde68a' :
    type === 'success' ? '#bbf7d0' : '#bae6fd'

  return (
    <div style={{
      background: bg,
      color,
      border: `1px solid ${border}`,
      borderRadius: 10,
      padding: '10px 12px',
      marginBottom: 12,
      boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
    }}>
      {message}
    </div>
  )
}
// shown whenever user coorectly inputs a valid city name for weather
// alerts user to input correct city name whenver its invalid
