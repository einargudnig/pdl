import { Flame, Medal, Snowflake, Trophy } from 'lucide-react'
import type { Standing, Streak } from '@shared/types'

type Props = {
  standings: Standing[]
  loaded: boolean
}

const MIN_STREAK = 3
const SKELETON_ROWS = 4

const rankBadge = (index: number, points: number) => {
  if (points === 0) return null
  if (index === 0) return <Trophy size={16} color="#ffd24a" aria-label="1st" />
  if (index === 1) return <Medal size={16} color="#c7c7d1" aria-label="2nd" />
  if (index === 2) return <Medal size={16} color="#d48a4a" aria-label="3rd" />
  return null
}

const StreakBadge = ({ streak }: { streak: Streak | null }) => {
  if (!streak || streak.count < MIN_STREAK) return null
  const isWin = streak.type === 'win'
  return (
    <span
      aria-label={`${streak.count} ${streak.type} streak`}
      title={`${streak.count} ${streak.type}s in a row`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.125rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: isWin ? '#ff8a4a' : '#6eb5ff',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {isWin ? (
        <Flame size={14} color="#ff8a4a" fill="#ff8a4a" aria-hidden="true" />
      ) : (
        <Snowflake size={14} color="#6eb5ff" aria-hidden="true" />
      )}
      {streak.count}
    </span>
  )
}

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '2rem 1fr auto auto',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.75rem 1rem',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  fontVariantNumeric: 'tabular-nums' as const,
  minHeight: '3rem',
}

const SkeletonRow = () => (
  <li style={rowStyle} aria-hidden="true">
    <span className="pdl-skeleton" style={{ width: '1rem', height: '1rem' }} />
    <span className="pdl-skeleton" style={{ height: '0.875rem', width: '55%' }} />
    <span className="pdl-skeleton" style={{ height: '0.75rem', width: '3.5rem' }} />
    <span className="pdl-skeleton" style={{ height: '1rem', width: '1rem' }} />
  </li>
)

export const Standings = ({ standings, loaded }: Props) => {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h2 style={{ margin: 0, fontSize: '1.125rem' }}>Leaderboard</h2>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.25rem' }}>
        {!loaded
          ? Array.from({ length: SKELETON_ROWS }).map((_, i) => <SkeletonRow key={i} />)
          : standings.map((row, i) => {
              const rate = row.played > 0 ? Math.round((row.wins / row.played) * 100) : 0
              return (
                <li
                  key={row.player.id}
                  style={{
                    ...rowStyle,
                    viewTransitionName: `standing-${row.player.id}`,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--muted)',
                    }}
                  >
                    {rankBadge(i, row.points) ?? i + 1}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    {row.player.name}
                    <StreakBadge streak={row.streak} />
                  </span>
                  <span style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
                    {row.wins}-{row.losses} · {rate}%
                  </span>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{row.points}</span>
                </li>
              )
            })}
      </ol>
    </section>
  )
}
