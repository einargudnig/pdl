import * as stylex from '@stylexjs/stylex'

/**
 * The only place colours, spacing and radii are defined. Import these
 * instead of writing literals — a typo is a compile error, not a
 * silently-transparent element.
 */
export const colors = stylex.defineVars({
  bg: '#0b0b0f',
  fg: '#f5f5f7',
  muted: '#8a8a94',
  accent: '#c3ff4d',
  onAccent: '#0b0b0f',
  surface: '#16161d',
  surface2: '#1d1d26',
  border: '#25252f',
  danger: '#ff6b6b',
  win: '#ff8a4a',
  loss: '#6eb5ff',
  gold: '#ffd24a',
  silver: '#c7c7d1',
  bronze: '#d48a4a',
})

export const space = stylex.defineVars({
  xs: '0.125rem',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  xxl: '1.25rem',
  xxxl: '2rem',
})

export const radius = stylex.defineVars({
  sm: '8px',
  md: '12px',
  pill: '999px',
})

export const font = stylex.defineVars({
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  md: '1.125rem',
  lg: '2.5rem',
})
