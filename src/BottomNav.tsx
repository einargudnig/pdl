import { ListOrdered, Wrench, type LucideIcon } from 'lucide-react'
import { Tabs } from '@base-ui-components/react/tabs'
import * as stylex from '@stylexjs/stylex'
import { motion } from './motion.stylex'
import { colors, radius, space } from './tokens.stylex'

export type TabId = 'scores' | 'tools'

type Item = {
  id: TabId
  label: string
  Icon: LucideIcon
}

const items: Item[] = [
  { id: 'scores', label: 'Scores', Icon: ListOrdered },
  { id: 'tools', label: 'Tools', Icon: Wrench },
]

/** Must render inside a `Tabs.Root` — see App.tsx. */
export const BottomNav = () => (
  <Tabs.List aria-label="Primary" {...stylex.props(styles.nav)}>
    {items.map(({ id, label, Icon }) => (
      <Tabs.Tab key={id} value={id} aria-label={label} {...stylex.props(motion.button, styles.tab)}>
        <Icon size={18} aria-hidden="true" />
        <span>{label}</span>
      </Tabs.Tab>
    ))}
  </Tabs.List>
)

const styles = stylex.create({
  nav: {
    position: 'fixed',
    left: space.xl,
    right: space.xl,
    bottom: `calc(env(safe-area-inset-bottom, 0px) + ${space.xl})`,
    maxWidth: '420px',
    marginInline: 'auto',
    padding: '0.375rem',
    display: 'grid',
    // Auto-flow rather than repeat(items.length) — StyleX only compiles
    // static values, and this stays correct as tabs are added.
    gridAutoFlow: 'column',
    gridAutoColumns: '1fr',
    gap: space.sm,
    backgroundColor: 'rgba(22, 22, 29, 0.72)',
    backdropFilter: 'blur(16px) saturate(160%)',
    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: radius.pill,
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
    zIndex: 10,
  },
  tab: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    padding: `0.625rem 0.875rem`,
    borderStyle: 'none',
    borderRadius: radius.pill,
    fontSize: '0.9375rem',
    fontWeight: 600,
    // Base UI stamps data-active on the selected tab.
    backgroundColor: {
      default: 'transparent',
      ':is([data-active])': colors.accent,
    },
    color: { default: colors.fg, ':is([data-active])': colors.onAccent },
  },
})
