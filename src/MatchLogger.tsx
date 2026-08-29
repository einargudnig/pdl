import { useState } from 'react'
import { Check, Minus, Trophy } from 'lucide-react'
import { Toast } from '@base-ui-components/react/toast'
import * as stylex from '@stylexjs/stylex'
import type { Player } from '@shared/types'
import { motion } from './motion.stylex'
import { colors, font, radius, space } from './tokens.stylex'
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
  const toast = Toast.useToastManager()

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
    try {
      const result = await recordMatch(winners as [string, string], losers as [string, string])
      if (!result.ok) {
        toast.add({
          title: "Couldn't log the match",
          description: result.error,
          type: 'error',
        })
        return
      }
      setSlots({})
      onLogged()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section {...stylex.props(styles.section)}>
      <header {...stylex.props(styles.header)}>
        <h2 {...stylex.props(styles.heading)}>Log a match</h2>
        <span {...stylex.props(styles.hint)}>tap: winner → loser → clear</span>
      </header>

      <ul {...stylex.props(styles.list)}>
        {players.map((p) => {
          const slot = slots[p.id] ?? null
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => cycle(p.id)}
                {...stylex.props(
                  motion.button,
                  styles.row,
                  slot === 'winner' ? styles.rowWinner : styles.rowIdle,
                )}
              >
                <span>{p.name}</span>
                <span
                  aria-label={slot ?? 'unassigned'}
                  {...stylex.props(
                    styles.slot,
                    slot === 'winner' && styles.slotWinner,
                    slot === 'loser' && styles.slotLoser,
                  )}
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
        type="button"
        disabled={!ready || busy}
        onClick={submit}
        {...stylex.props(motion.button, styles.submit, ready ? styles.submitOn : styles.submitOff)}
      >
        {busy ? <Spinner label="Saving match" /> : <Trophy size={18} aria-hidden="true" />}
        <span>{busy ? 'Saving' : `Log match (${winners.length}v${losers.length})`}</span>
      </button>
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
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  heading: {
    margin: 0,
    fontSize: font.md,
  },
  hint: {
    color: colors.muted,
    fontSize: font.sm,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gap: space.md,
  },
  row: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `0.875rem ${space.xl}`,
    backgroundColor: colors.surface,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: radius.md,
    color: 'inherit',
    fontSize: font.base,
    textAlign: 'left',
  },
  rowWinner: { borderColor: colors.accent },
  rowIdle: { borderColor: colors.border },
  slot: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: font.xs,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'transparent',
  },
  slotWinner: { color: colors.accent },
  slotLoser: { color: colors.muted },
  submit: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    padding: '0.875rem',
    borderStyle: 'none',
    borderRadius: radius.md,
    fontSize: font.base,
    fontWeight: 600,
  },
  submitOn: {
    backgroundColor: colors.accent,
    color: colors.onAccent,
  },
  submitOff: {
    backgroundColor: colors.surface,
    color: colors.muted,
  },
})
