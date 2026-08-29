import * as stylex from '@stylexjs/stylex'
import { colors, radius } from './tokens.stylex'

const spin = stylex.keyframes({
  to: { transform: 'rotate(360deg)' },
})

const fadeUp = stylex.keyframes({
  from: { opacity: 0, transform: 'translateY(6px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
})

const pulse = stylex.keyframes({
  '0%, 100%': { opacity: 0.55 },
  '50%': { opacity: 0.9 },
})

const REDUCED = '@media (prefers-reduced-motion: reduce)'

export const motion = stylex.create({
  spin: {
    animationName: { default: spin, [REDUCED]: 'none' },
    animationDuration: '1s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  fadeUp: {
    animationName: { default: fadeUp, [REDUCED]: 'none' },
    animationDuration: '260ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
  },
  delay1: { animationDelay: '40ms' },
  delay2: { animationDelay: '80ms' },
  skeleton: {
    backgroundColor: colors.surface2,
    borderRadius: radius.sm,
    animationName: { default: pulse, [REDUCED]: 'none' },
    animationDuration: '1.4s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
  /** Shared button reset — every <button> in the app starts here. */
  button: {
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    transitionProperty: {
      default: 'transform, background-color, color, border-color',
      [REDUCED]: 'none',
    },
    transitionDuration: '120ms',
    transitionTimingFunction: 'ease',
    transform: {
      default: null,
      ':active:not(:disabled)': { default: 'scale(0.98)', [REDUCED]: null },
    },
  },
})
