import { Toast } from '@base-ui-components/react/toast'
import * as stylex from '@stylexjs/stylex'
import { colors, font, radius, space } from './tokens.stylex'

/**
 * Single place errors surface. Components call `useToastManager().add(...)`
 * rather than rendering their own inline error paragraph.
 */
export const Toasts = () => {
  const { toasts } = Toast.useToastManager()

  return (
    <Toast.Portal>
      <Toast.Viewport {...stylex.props(styles.viewport)}>
        {toasts.map((toast) => (
          <Toast.Root key={toast.id} toast={toast} {...stylex.props(styles.root)}>
            <Toast.Title {...stylex.props(styles.title)} />
            <Toast.Description {...stylex.props(styles.description)} />
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  )
}

const styles = stylex.create({
  viewport: {
    position: 'fixed',
    top: `calc(env(safe-area-inset-top, 0px) + ${space.xl})`,
    left: space.xl,
    right: space.xl,
    display: 'grid',
    gap: space.md,
    justifyItems: 'center',
    zIndex: 20,
  },
  root: {
    width: '100%',
    maxWidth: '26rem',
    padding: `${space.lg} ${space.xl}`,
    backgroundColor: colors.surface2,
    border: `1px solid ${colors.danger}`,
    borderRadius: radius.md,
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
  },
  title: {
    margin: 0,
    color: colors.danger,
    fontSize: font.sm,
    fontWeight: 600,
  },
  description: {
    margin: 0,
    color: colors.fg,
    fontSize: font.sm,
  },
})
