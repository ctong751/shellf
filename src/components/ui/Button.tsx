import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border border-transparent bg-clip-padding text-[0.78rem] font-semibold tracking-[0.04em] whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:fill-none [&_svg]:stroke-current [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'border-primary bg-primary text-primary-foreground hover:-translate-y-px hover:border-accent hover:bg-accent',
        outline:
          'border-border bg-transparent text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground aria-expanded:bg-primary aria-expanded:text-primary-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground aria-expanded:bg-primary aria-expanded:text-primary-foreground',
        ghost:
          'text-foreground hover:bg-muted aria-expanded:bg-muted aria-expanded:text-foreground',
        destructive:
          'border-destructive bg-destructive text-white hover:bg-destructive/85 focus-visible:border-destructive focus-visible:ring-destructive/20',
        link: 'border-0 bg-transparent text-muted-foreground underline underline-offset-[3px] hover:text-foreground',
      },
      size: {
        default:
          'h-13 min-w-33 gap-2.5 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
        xs: 'h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*="size-"])]:size-3',
        sm: 'h-9 gap-1.5 px-3 text-[0.7rem] has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*="size-"])]:size-3.5',
        lg: 'h-13 min-w-33 gap-2.5 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
        icon: 'size-9',
        'icon-xs': 'size-6 [&_svg:not([class*="size-"])]:size-3',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
