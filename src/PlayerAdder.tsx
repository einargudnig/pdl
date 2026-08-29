import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Field } from '@base-ui-components/react/field'
import { Toast } from '@base-ui-components/react/toast'
import * as stylex from '@stylexjs/stylex'
import { PLAYER_NAME_MAX } from '@shared/types'
import { motion } from './motion.stylex'
import { colors, font, radius, space } from './tokens.stylex'
import { Spinner } from './Spinner'
import { addPlayer } from './hooks'

type Props = {
  onAdded: () => void
}

export const PlayerAdder = ({ onAdded }: Props) => {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const toast = Toast.useToastManager()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setBusy(true)
    try {
      const result = await addPlayer(trimmed)
      if ('error' in result) {
        toast.add({
          title: "Couldn't add the player",
          description: result.error,
          type: 'error',
        })
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
    <form onSubmit={submit} {...stylex.props(styles.form)}>
      <Field.Root {...stylex.props(styles.field)}>
        <Field.Label {...stylex.props(styles.label)}>New player name</Field.Label>
        <div {...stylex.props(styles.row)}>
          <Field.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add a player"
            maxLength={PLAYER_NAME_MAX}
            {...stylex.props(styles.input)}
          />
          <button
            type="submit"
            disabled={!canSubmit}
            {...stylex.props(
              motion.button,
              styles.submit,
              canSubmit ? styles.submitOn : styles.submitOff,
            )}
          >
            {busy ? <Spinner label="Adding player" /> : <UserPlus size={18} aria-hidden="true" />}
            <span>Add</span>
          </button>
        </div>
      </Field.Root>
    </form>
  )
}

const styles = stylex.create({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.md,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: space.sm,
  },
  label: {
    color: colors.muted,
    fontSize: font.xs,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  row: {
    display: 'flex',
    gap: space.md,
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: `${space.lg} ${space.xl}`,
    backgroundColor: colors.surface,
    color: 'inherit',
    font: 'inherit',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: { default: colors.border, ':focus-visible': colors.accent },
    borderRadius: radius.md,
    fontSize: font.base,
    outline: 'none',
  },
  submit: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: space.md,
    padding: `${space.lg} ${space.xxl}`,
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
