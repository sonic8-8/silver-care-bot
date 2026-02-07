import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ActionVariant = 'primary' | 'secondary' | 'danger'

interface LcdActionButtonProps
  extends PropsWithChildren,
    ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionVariant
}

export function LcdActionButton({
  children,
  className,
  variant = 'primary',
  ...props
}: LcdActionButtonProps) {
  const classes = ['lcd-action-button', `lcd-action-button--${variant}`]

  if (className) {
    classes.push(className)
  }

  return (
    <button
      type="button"
      className={classes.join(' ')}
      aria-disabled={props.disabled}
      {...props}
    >
      {children}
    </button>
  )
}
