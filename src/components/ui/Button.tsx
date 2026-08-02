import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'text'
}

export const Button = ({
  className,
  variant = 'primary',
  ...props
}: ButtonProps) => {
  const classes = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(' ')

  return <button className={classes} {...props} />
}
