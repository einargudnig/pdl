import { Loader2 } from 'lucide-react'
import * as stylex from '@stylexjs/stylex'
import { motion } from './motion.stylex'

type Props = {
  size?: number
  label?: string
}

export const Spinner = ({ size = 18, label = 'Loading' }: Props) => (
  <Loader2 size={size} {...stylex.props(motion.spin)} aria-label={label} role="status" />
)
