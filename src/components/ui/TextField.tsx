import type { InputHTMLAttributes, ReactNode } from 'react'
import styles from './TextField.module.css'

interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'prefix'
> {
  prefix?: ReactNode
}

export const TextField = ({ className, prefix, ...props }: TextFieldProps) => {
  const inputClasses = [styles.input, className].filter(Boolean).join(' ')

  return (
    <div className={styles.shell}>
      {prefix !== undefined && (
        <span className={styles.prefix} aria-hidden="true">
          {prefix}
        </span>
      )}
      <input className={inputClasses} {...props} />
    </div>
  )
}
