import type { HTMLAttributes } from 'react'
import styles from './Card.module.css'

export const Card = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const classes = [styles.card, className].filter(Boolean).join(' ')

  return <div className={classes} {...props} />
}
