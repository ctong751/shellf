import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils'

function Tabs({
  className,
  orientation = 'horizontal',
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        'group/tabs flex gap-2 data-horizontal:flex-col',
        className,
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center justify-center p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'gap-1 bg-transparent',
        collection:
          'h-auto! w-full justify-start gap-[2.2rem] border-b border-border bg-transparent p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function TabsList({
  className,
  variant = 'default',
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent',
        'data-active:bg-background data-active:text-foreground',
        'after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
        'group-data-[variant=collection]/tabs-list:min-h-16 group-data-[variant=collection]/tabs-list:flex-none group-data-[variant=collection]/tabs-list:gap-[0.65rem] group-data-[variant=collection]/tabs-list:border-0 group-data-[variant=collection]/tabs-list:bg-transparent group-data-[variant=collection]/tabs-list:p-0 group-data-[variant=collection]/tabs-list:text-[0.72rem] group-data-[variant=collection]/tabs-list:font-semibold group-data-[variant=collection]/tabs-list:tracking-[0.08em] group-data-[variant=collection]/tabs-list:uppercase group-data-[variant=collection]/tabs-list:after:-bottom-px group-data-[variant=collection]/tabs-list:after:h-[3px] group-data-[variant=collection]/tabs-list:after:bg-accent group-data-[variant=collection]/tabs-list:data-active:after:opacity-100 group-data-[variant=collection]/tabs-list:[&_span]:grid group-data-[variant=collection]/tabs-list:[&_span]:h-[23px] group-data-[variant=collection]/tabs-list:[&_span]:min-w-[23px] group-data-[variant=collection]/tabs-list:[&_span]:place-items-center group-data-[variant=collection]/tabs-list:[&_span]:rounded-full group-data-[variant=collection]/tabs-list:[&_span]:bg-secondary group-data-[variant=collection]/tabs-list:[&_span]:font-mono group-data-[variant=collection]/tabs-list:[&_span]:text-[0.56rem] max-[700px]:group-data-[variant=collection]/tabs-list:min-h-[58px]',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn('flex-1 text-sm outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
