import * as React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
}

export const Badge = ({ className = '', variant = 'primary', ...props }: BadgeProps) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold select-none'
  
  const variants = {
    primary: 'bg-indigo-900/40 text-indigo-400 border border-indigo-800/60',
    secondary: 'bg-slate-800 text-slate-300 border border-slate-700',
    success: 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60',
    warning: 'bg-amber-950/40 text-amber-400 border border-amber-900/60',
    danger: 'bg-red-950/40 text-red-400 border border-red-900/60',
  }

  const classes = `${baseStyles} ${variants[variant]} ${className}`

  return <span className={classes} {...props} />
}

Badge.displayName = 'Badge'
