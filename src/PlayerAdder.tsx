import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { PLAYER_NAME_MAX } from '@shared/types'
import { Spinner } from './Spinner'
import { addPlayer } from './hooks'

type Props = {
  onAdded: () => void
}

export const PlayerAdder = ({ onAdded }: Props) => {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setBusy(true)
    setError(null)
    try {
      const result = await addPlayer(trimmed)
      if ('error' in result) {
        setError(result.error)
        return
      }
      setName('')
      onAdded()
    } finally {
      setBusy(false)
    }
  }

  const canSubmit = Boolean(name.trim()) && !busy

  return (
    <form
      onSubmit={submit}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
    >
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a player"
          maxLength={PLAYER_NAME_MAX}
          aria-label="New player name"
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            background: 'var(--surface)',
            color: 'inherit',
            border: '1px solid var(--border)',
            borderRadius: 12,
            fontSize: '1rem',
            font: 'inherit',
          }}
        />
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: canSubmit ? 'var(--accent)' : 'var(--surface)',
            color: canSubmit ? '#0b0b0f' : 'var(--muted)',
            border: 'none',
            borderRadius: 12,
            fontSize: '1rem',
            fontWeight: 600,
          }}
        >
          {busy ? <Spinner label="Adding player" /> : <UserPlus size={18} aria-hidden="true" />}
          <span>Add</span>
        </button>
      </div>
      <p
        role="alert"
        aria-live="polite"
        style={{
          margin: 0,
          color: '#ff6b6b',
          fontSize: '0.875rem',
          minHeight: '1.25rem',
          lineHeight: '1.25rem',
          opacity: error ? 1 : 0,
          transition: 'opacity 120ms ease',
        }}
      >
        {error ?? ' '}
      </p>
    </form>
  )
}
