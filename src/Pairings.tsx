import { useState } from 'react'
import { Dices, Shuffle } from 'lucide-react'
import type { Player } from '@shared/types'

type Props = {
  players: Player[]
}

type Pairing = {
  teamA: [Player, Player]
  teamB: [Player, Player]
}

const shuffle = <T,>(items: T[]): T[] => {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

const pairUp = (selected: Player[]): Pairing | null => {
  if (selected.length !== 4) return null
  const [a, b, c, d] = shuffle(selected)
  return { teamA: [a, b], teamB: [c, d] }
}

export const Pairings = ({ players }: Props) => {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pairing, setPairing] = useState<Pairing | null>(null)

  const toggle = (id: string) => {
    setPairing(null)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 4) {
        next.add(id)
      }
      return next
    })
  }

  const selectedPlayers = players.filter((p) => selected.has(p.id))
  const canRoll = selectedPlayers.length === 4

  const roll = () => {
    setPairing(pairUp(selectedPlayers))
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.125rem' }}>Random pairings</h2>
        <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
          pick 4 · {selected.size}/4
        </span>
      </header>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.375rem',
        }}
      >
        {players.map((p) => {
          const isSelected = selected.has(p.id)
          return (
            <li key={p.id}>
              <button
                onClick={() => toggle(p.id)}
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: 999,
                  fontSize: '0.875rem',
                  background: isSelected ? 'var(--accent)' : 'var(--surface)',
                  color: isSelected ? '#0b0b0f' : 'inherit',
                  border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {p.name}
              </button>
            </li>
          )
        })}
      </ul>

      <div
        aria-live="polite"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '1rem',
          background: 'var(--surface)',
          border: `1px ${pairing ? 'solid' : 'dashed'} var(--border)`,
          borderRadius: 12,
          minHeight: '5.5rem',
          opacity: pairing ? 1 : 0.6,
          transition: 'opacity 160ms ease, border-color 160ms ease',
        }}
      >
        {pairing ? (
          <>
            <TeamCard team={pairing.teamA} />
            <span
              style={{ color: 'var(--muted)', fontSize: '0.75rem', letterSpacing: '0.1em' }}
            >
              VS
            </span>
            <TeamCard team={pairing.teamB} />
          </>
        ) : (
          <span
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              color: 'var(--muted)',
              fontSize: '0.875rem',
            }}
          >
            Pick 4 players, then shuffle.
          </span>
        )}
      </div>

      <button
        disabled={!canRoll}
        onClick={roll}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.875rem',
          background: canRoll ? 'var(--accent)' : 'var(--surface)',
          color: canRoll ? '#0b0b0f' : 'var(--muted)',
          border: 'none',
          borderRadius: 12,
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        {pairing ? <Shuffle size={18} aria-hidden="true" /> : <Dices size={18} aria-hidden="true" />}
        <span>{pairing ? 'Reshuffle' : 'Shuffle teams'}</span>
      </button>
    </section>
  )
}

const TeamCard = ({ team }: { team: [Player, Player] }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', textAlign: 'center' }}>
    <span style={{ fontWeight: 600 }}>{team[0].name}</span>
    <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>+</span>
    <span style={{ fontWeight: 600 }}>{team[1].name}</span>
  </div>
)
