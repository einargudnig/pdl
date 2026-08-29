import { useState } from 'react'
import { Dices, Shuffle } from 'lucide-react'
import * as stylex from '@stylexjs/stylex'
import type { Player } from '@shared/types'
import { motion } from './motion.stylex'
import { colors, font, radius, space } from './tokens.stylex'

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
    const at = out[i] as T
    out[i] = out[j] as T
    out[j] = at
  }
  return out
}

const pairUp = (selected: Player[]): Pairing | null => {
  if (selected.length !== 4) return null
  const [a, b, c, d] = shuffle(selected)
  if (!a || !b || !c || !d) return null
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
    <section {...stylex.props(styles.section)}>
      <header {...stylex.props(styles.header)}>
        <h2 {...stylex.props(styles.heading)}>Random pairings</h2>
        <span {...stylex.props(styles.hint)}>pick 4 · {selected.size}/4</span>
      </header>

      <ul {...stylex.props(styles.chips)}>
        {players.map((p) => {
          const isSelected = selected.has(p.id)
          return (
            <li key={p.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggle(p.id)}
                {...stylex.props(
                  motion.button,
                  styles.chip,
                  isSelected ? styles.chipOn : styles.chipOff,
                )}
              >
                {p.name}
              </button>
            </li>
          )
        })}
      </ul>

      <div
        aria-live="polite"
        {...stylex.props(styles.result, pairing ? styles.resultFilled : styles.resultEmpty)}
      >
        {pairing ? (
          <>
            <TeamCard team={pairing.teamA} />
            <span {...stylex.props(styles.vs)}>VS</span>
            <TeamCard team={pairing.teamB} />
          </>
        ) : (
          <span {...stylex.props(styles.placeholder)}>Pick 4 players, then shuffle.</span>
        )}
      </div>

      <button
        type="button"
        disabled={!canRoll}
        onClick={roll}
        {...stylex.props(
          motion.button,
          styles.submit,
          canRoll ? styles.submitOn : styles.submitOff,
        )}
      >
        {pairing ? (
          <Shuffle size={18} aria-hidden="true" />
        ) : (
          <Dices size={18} aria-hidden="true" />
        )}
        <span>{pairing ? 'Reshuffle' : 'Shuffle teams'}</span>
      </button>
    </section>
  )
}

const TeamCard = ({ team }: { team: [Player, Player] }) => (
  <div {...stylex.props(styles.team)}>
    <span {...stylex.props(styles.teamName)}>{team[0].name}</span>
    <span {...stylex.props(styles.plus)}>+</span>
    <span {...stylex.props(styles.teamName)}>{team[1].name}</span>
  </div>
)

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
  chips: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  chip: {
    padding: `${space.md} 0.875rem`,
    borderRadius: radius.pill,
    fontSize: font.sm,
  },
  chipOn: {
    backgroundColor: colors.accent,
    color: colors.onAccent,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.accent,
    fontWeight: 600,
  },
  chipOff: {
    backgroundColor: colors.surface,
    color: 'inherit',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    fontWeight: 400,
  },
  result: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: space.md,
    padding: space.xl,
    backgroundColor: colors.surface,
    borderWidth: '1px',
    borderColor: colors.border,
    borderRadius: radius.md,
    minHeight: '5.5rem',
    transitionProperty: 'opacity, border-color',
    transitionDuration: '160ms',
    transitionTimingFunction: 'ease',
  },
  resultFilled: { borderStyle: 'solid', opacity: 1 },
  resultEmpty: { borderStyle: 'dashed', opacity: 0.6 },
  vs: {
    color: colors.muted,
    fontSize: font.xs,
    letterSpacing: '0.1em',
  },
  placeholder: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: colors.muted,
    fontSize: font.sm,
  },
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
  team: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.xs,
    textAlign: 'center',
  },
  teamName: { fontWeight: 600 },
  plus: {
    color: colors.muted,
    fontSize: font.xs,
  },
})
