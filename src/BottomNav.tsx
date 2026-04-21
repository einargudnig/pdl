import { ListOrdered, Wrench, type LucideIcon } from 'lucide-react'

export type TabId = 'scores' | 'tools'

type Props = {
  active: TabId
  onChange: (tab: TabId) => void
}

type Item = {
  id: TabId
  label: string
  Icon: LucideIcon
}

const items: Item[] = [
  { id: 'scores', label: 'Scores', Icon: ListOrdered },
  { id: 'tools', label: 'Tools', Icon: Wrench },
]

export const BottomNav = ({ active, onChange }: Props) => (
  <nav
    aria-label="Primary"
    style={{
      position: 'fixed',
      left: '1rem',
      right: '1rem',
      bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
      maxWidth: 420,
      margin: '0 auto',
      padding: '0.375rem',
      display: 'grid',
      gridTemplateColumns: `repeat(${items.length}, 1fr)`,
      gap: '0.25rem',
      background: 'rgba(22, 22, 29, 0.72)',
      backdropFilter: 'blur(16px) saturate(160%)',
      WebkitBackdropFilter: 'blur(16px) saturate(160%)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: 999,
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
      zIndex: 10,
    }}
  >
    {items.map(({ id, label, Icon }) => {
      const isActive = active === id
      return (
        <button
          key={id}
          type="button"
          aria-pressed={isActive}
          aria-label={label}
          onClick={() => onChange(id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.625rem 0.875rem',
            background: isActive ? 'var(--accent)' : 'transparent',
            color: isActive ? '#0b0b0f' : 'var(--fg)',
            border: 'none',
            borderRadius: 999,
            fontSize: '0.9375rem',
            fontWeight: 600,
            transition: 'background 120ms ease, color 120ms ease',
          }}
        >
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
        </button>
      )
    })}
  </nav>
)
