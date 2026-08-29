import { History } from 'lucide-react'
import * as stylex from '@stylexjs/stylex'
import type { Match, Player } from '@shared/types'
import { motion } from './motion.stylex'
import { colors, font, radius, space } from './tokens.stylex'

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

  const time = then.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (thenMs >= startOfToday) return `Today · ${time}`
  if (thenMs >= startOfToday - SAME_DAY_MS) return `Yesterday · ${time}`

  const date = then.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  return `${date} · ${time}`
}

const SkeletonCard = () => (
  <li {...stylex.props(styles.card)} aria-hidden="true">
    <span {...stylex.props(motion.skeleton, styles.skeletonTeams)} />
    <span {...stylex.props(motion.skeleton, styles.skeletonWhen)} />
  </li>
)

export const MatchHistory = ({ matches, players, loaded, limit = 10 }: Props) => {
  const byId = Object.fromEntries(players.map((p) => [p.id, p.name]))
  const recent = matches.slice(0, limit)

  return (
    <section {...stylex.props(styles.section)}>
      <header {...stylex.props(styles.header)}>
        <span {...stylex.props(styles.headerIcon)}>
          <History size={16} color="currentColor" aria-hidden="true" />
        </span>
        <h2 {...stylex.props(styles.heading)}>Recent matches</h2>
      </header>

      {!loaded ? (
        <ol {...stylex.props(styles.list)}>
          {Array.from({ length: 3 }).map((_, i) => (
            // oxlint-disable-next-line react/no-array-index-key
            <SkeletonCard key={i} />
          ))}
        </ol>
      ) : recent.length === 0 ? (
        <p {...stylex.props(styles.empty)}>No matches yet. Log one from the Scores tab.</p>
      ) : (
        <ol {...stylex.props(styles.list)}>
          {recent.map((m) => {
            const winners = m.winners.map((id) => byId[id] ?? '?').join(' & ')
            const losers = m.losers.map((id) => byId[id] ?? '?').join(' & ')
            return (
              <li key={m.id} {...stylex.props(styles.card)}>
                <div {...stylex.props(styles.teams)}>
                  <span {...stylex.props(styles.winners)}>{winners}</span>
                  <span {...stylex.props(styles.beat)}>beat</span>
                  <span>{losers}</span>
                </div>
                <span {...stylex.props(styles.when)}>{formatWhen(m.playedAt)}</span>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

const styles = stylex.create({
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.lg,
  },
  header: {
    display: 'flex',
    alignItems: 'baseline',
    gap: space.md,
  },
  headerIcon: {
    color: colors.muted,
    display: 'inline-flex',
  },
  heading: {
    margin: 0,
    fontSize: font.md,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gap: '0.375rem',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm,
    padding: `${space.lg} ${space.xl}`,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    minHeight: '3.25rem',
  },
  empty: {
    margin: 0,
    padding: space.xl,
    color: colors.muted,
    backgroundColor: colors.surface,
    border: `1px dashed ${colors.border}`,
    borderRadius: radius.md,
    textAlign: 'center',
    fontSize: font.sm,
  },
  teams: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space.md,
  },
  winners: {
    color: colors.accent,
    fontWeight: 600,
  },
  beat: {
    color: colors.muted,
    fontSize: '0.8125rem',
  },
  when: {
    color: colors.muted,
    fontSize: font.xs,
  },
  skeletonTeams: { height: '0.9375rem', width: '70%' },
  skeletonWhen: { height: '0.75rem', width: '35%' },
})
