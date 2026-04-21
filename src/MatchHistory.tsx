import { History } from 'lucide-react'
import type { Match, Player } from '@shared/types'

type Props = {
  matches: Match[]
  players: Player[]
  loaded: boolean
  limit?: number
}

const SAME_DAY_MS = 24 * 60 * 60 * 1000

const formatWhen = (iso: string): string => {
  const then = new Date(iso)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const thenMs = then.getTime()

  const time = then.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

  if (thenMs >= startOfToday) return `Today · ${time}`
  if (thenMs >= startOfToday - SAME_DAY_MS) return `Yesterday · ${time}`

  const date = then.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  return `${date} · ${time}`
}

const cardStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.25rem',
  padding: '0.75rem 1rem',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  minHeight: '3.25rem',
}

const SkeletonCard = () => (
  <li style={cardStyle} aria-hidden="true">
    <span className="pdl-skeleton" style={{ height: '0.9375rem', width: '70%' }} />
    <span className="pdl-skeleton" style={{ height: '0.75rem', width: '35%' }} />
  </li>
)

export const MatchHistory = ({ matches, players, loaded, limit = 10 }: Props) => {
  const byId = Object.fromEntries(players.map((p) => [p.id, p.name]))
  const recent = matches.slice(0, limit)

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <header style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <History size={16} color="var(--muted)" aria-hidden="true" />
        <h2 style={{ margin: 0, fontSize: '1.125rem' }}>Recent matches</h2>
      </header>

      {!loaded ? (
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.375rem' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </ol>
      ) : recent.length === 0 ? (
        <p
          style={{
            margin: 0,
            padding: '1rem',
            color: 'var(--muted)',
            background: 'var(--surface)',
            border: '1px dashed var(--border)',
            borderRadius: 12,
            textAlign: 'center',
            fontSize: '0.875rem',
          }}
        >
          No matches yet. Log one from the Scores tab.
        </p>
      ) : (
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.375rem' }}>
          {recent.map((m) => {
            const winners = m.winners.map((id) => byId[id] ?? '?').join(' & ')
            const losers = m.losers.map((id) => byId[id] ?? '?').join(' & ')
            return (
              <li key={m.id} style={cardStyle}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{winners}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '0.8125rem' }}>beat</span>
                  <span>{losers}</span>
                </div>
                <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                  {formatWhen(m.playedAt)}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
