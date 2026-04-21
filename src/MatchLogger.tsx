import { useState } from 'react'
import { Check, Minus, Trophy } from 'lucide-react'
import type { Player } from '@shared/types'
import { Spinner } from './Spinner'
import { recordMatch } from './hooks'

type Props = {
  players: Player[]
  onLogged: () => void
}

type Slot = 'winner' | 'loser' | null

export const MatchLogger = ({ players, onLogged }: Props) => {
  const [slots, setSlots] = useState<Record<string, Slot>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const winners = Object.entries(slots)
    .filter(([, s]) => s === 'winner')
    .map(([id]) => id)
  const losers = Object.entries(slots)
    .filter(([, s]) => s === 'loser')
    .map(([id]) => id)

  const cycle = (id: string) => {
    setSlots((prev) => {
      const current = prev[id] ?? null
      const winnerCount = Object.values(prev).filter((s) => s === 'winner').length
      const loserCount = Object.values(prev).filter((s) => s === 'loser').length

      const next: Slot =
        current === null
          ? winnerCount < 2
            ? 'winner'
            : loserCount < 2
              ? 'loser'
              : null
          : current === 'winner'
            ? loserCount < 2
              ? 'loser'
              : null
            : null

      return { ...prev, [id]: next }
    })
  }

  const ready = winners.length === 2 && losers.length === 2

  const submit = async () => {
    if (!ready || busy) return
    setBusy(true)
    setError(null)
    try {
      const result = await recordMatch(winners as [string, string], losers as [string, string])
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSlots({})
      onLogged()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={{ margin: 0, fontSize: '1.125rem' }}>Log a match</h2>
        <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
          tap: winner → loser → clear
        </span>
      </header>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
        {players.map((p) => {
          const slot = slots[p.id] ?? null
          const color =
            slot === 'winner' ? 'var(--accent)' : slot === 'loser' ? 'var(--muted)' : 'transparent'
          return (
            <li key={p.id}>
              <button
                onClick={() => cycle(p.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.875rem 1rem',
                  background: 'var(--surface)',
                  border: `1px solid ${slot === 'winner' ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 12,
                  color: 'inherit',
                  fontSize: '1rem',
                  textAlign: 'left',
                }}
              >
                <span>{p.name}</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontSize: '0.75rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color,
                  }}
                  aria-label={slot ?? 'unassigned'}
                >
                  {slot === 'winner' ? (
                    <Check size={16} aria-hidden="true" />
                  ) : slot === 'loser' ? (
                    <Minus size={16} aria-hidden="true" />
                  ) : null}
                  {slot ?? ''}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <button
        disabled={!ready || busy}
        onClick={submit}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.875rem',
          background: ready ? 'var(--accent)' : 'var(--surface)',
          color: ready ? '#0b0b0f' : 'var(--muted)',
          border: 'none',
          borderRadius: 12,
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        {busy ? <Spinner label="Saving match" /> : <Trophy size={18} aria-hidden="true" />}
        <span>
          {busy ? 'Saving' : `Log match (${winners.length}v${losers.length})`}
        </span>
      </button>
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
    </section>
  )
}
