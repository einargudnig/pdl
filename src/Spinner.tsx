import { Loader2 } from 'lucide-react'

type Props = {
  size?: number
  label?: string
}

export const Spinner = ({ size = 18, label = 'Loading' }: Props) => (
  <Loader2 size={size} className="pdl-spin" aria-label={label} role="status" />
)
