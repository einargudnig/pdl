import { Flame, Medal, Snowflake, Trophy } from 'lucide-react'
import * as stylex from '@stylexjs/stylex'
import type { Standing, Streak } from '@shared/types'
import { motion } from './motion.stylex'
import { colors, font, radius, space } from './tokens.stylex'

type Props = {
  standings: Standing[]
  loaded: boolean
}

const MIN_STREAK = 3
const SKELETON_ROWS = 4
// Stable per-slot ids generated once at module load, not derived from array
// index, so the skeleton loop keeps a real key even if this pattern is later
// copied to a reorderable list.
const skeletonKeys = Array.from({ length: SKELETON_ROWS }, () => crypto.randomUUID())

// Icons take their colour from the wrapping element via `currentColor`, so
// medal colours stay in tokens.stylex.ts rather than being repeated as hex.
const rankBadge = (index: number, points: number) => {
  if (points === 0) return null
  if (index === 0)
    return (
      <span {...stylex.props(styles.gold)}>
        <Trophy size={16} color="currentColor" aria-label="1st" />
      </span>
    )
  if (index === 1)
    return (
      <span {...stylex.props(styles.silver)}>
        <Medal size={16} color="currentColor" aria-label="2nd" />
      </span>
    )
  if (index === 2)
    return (
      <span {...stylex.props(styles.bronze)}>
        <Medal size={16} color="currentColor" aria-label="3rd" />
      </span>
    )
  return null
}

const StreakBadge = ({ streak }: { streak: Streak | null }) => {
  if (!streak || streak.count < MIN_STREAK) return null
  const isWin = streak.type === 'win'
  return (
    <span
      aria-label={`${streak.count} ${streak.type} streak`}
      title={`${streak.count} ${streak.type}s in a row`}
      {...stylex.props(styles.streak, isWin ? styles.streakWin : styles.streakLoss)}
    >
      {isWin ? (
        <Flame size={14} color="currentColor" fill="currentColor" aria-hidden="true" />
      ) : (
        <Snowflake size={14} color="currentColor" aria-hidden="true" />
      )}
      {streak.count}
    </span>
  )
}

const SkeletonRow = () => (
  <li {...stylex.props(styles.row)} aria-hidden="true">
    <span {...stylex.props(motion.skeleton, styles.skeletonBadge)} />
    <span {...stylex.props(motion.skeleton, styles.skeletonName)} />
    <span {...stylex.props(motion.skeleton, styles.skeletonRecord)} />
    <span {...stylex.props(motion.skeleton, styles.skeletonPoints)} />
  </li>
)

export const Standings = ({ standings, loaded }: Props) => (
  <section {...stylex.props(styles.section)}>
    <h2 {...stylex.props(styles.heading)}>Leaderboard</h2>
    <ol {...stylex.props(styles.list)}>
      {!loaded
        ? skeletonKeys.map((key) => <SkeletonRow key={key} />)
        : standings.map((row, i) => {
            const rate = row.played > 0 ? Math.round((row.wins / row.played) * 100) : 0
            return (
              <li
                key={row.player.id}
                {...stylex.props(styles.row)}
                // Per-row and therefore dynamic: StyleX only compiles static values.
                style={{ viewTransitionName: `standing-${row.player.id}` }}
              >
                <span {...stylex.props(styles.rank)}>{rankBadge(i, row.points) ?? i + 1}</span>
                <span {...stylex.props(styles.name)}>
                  {row.player.name}
                  <StreakBadge streak={row.streak} />
                </span>
                <span {...stylex.props(styles.record)}>
                  {row.wins}-{row.losses} · {rate}%
                </span>
                <span {...stylex.props(styles.points)}>{row.points}</span>
              </li>
            )
          })}
    </ol>
  </section>
)

const styles = stylex.create({
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.lg,
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
    gap: space.sm,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '2rem 1fr auto auto',
    alignItems: 'center',
    gap: space.lg,
    padding: `${space.lg} ${space.xl}`,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radius.md,
    fontVariantNumeric: 'tabular-nums',
    minHeight: '3rem',
  },
  rank: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.muted,
  },
  name: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.md,
  },
  record: {
    color: colors.muted,
    fontSize: font.sm,
  },
  points: {
    color: colors.accent,
    fontWeight: 600,
  },
  streak: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.xs,
    fontSize: font.xs,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  streakWin: { color: colors.win },
  streakLoss: { color: colors.loss },
  gold: { color: colors.gold, display: 'inline-flex' },
  silver: { color: colors.silver, display: 'inline-flex' },
  bronze: { color: colors.bronze, display: 'inline-flex' },
  skeletonBadge: { width: '1rem', height: '1rem' },
  skeletonName: { height: '0.875rem', width: '55%' },
  skeletonRecord: { height: '0.75rem', width: '3.5rem' },
  skeletonPoints: { height: '1rem', width: '1rem' },
})
