import React from 'react'
import '../styles/Button.css'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  label: string
  onClick: () => void
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function Button({
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full-width' : ''} ${className}`}
      onClick={onClick}
      disabled={isDisabled}
      style={style}
    >
      {loading ? <span className="btn-spinner"></span> : label}
    </button>
  )
}
