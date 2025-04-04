import * as React from "react"

import { cn } from "@/lib/utils"

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    data: any[]
    tooltip?: React.ReactNode
  }
>(({ className, children, data, tooltip, ...props }, ref) => {
  return (
    <div className={cn("relative", className)} {...props} ref={ref}>
      {children}
      {tooltip}
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

const Chart = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  return <div className={cn("h-full w-full", className)} {...props} ref={ref} />
})
Chart.displayName = "Chart"

interface ChartTooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const ChartTooltip = ({ children }: ChartTooltipProps) => {
  return <>{children}</>
}
ChartTooltip.displayName = "ChartTooltip"

// Using type instead of interface to avoid conflict with HTMLAttributes content property
type ChartTooltipContentProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> & {
  content?: (props: { payload: any[]; label: string }) => React.ReactNode
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ className, content, ...props }, ref) => {
    return (
      <div
        className={cn(
          "pointer-events-none absolute z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          className,
        )}
        {...props}
        ref={ref}
      >
        {/* This div is just a container for the tooltip content */}
        {/* The actual content rendering is handled by Recharts */}
      </div>
    )
  },
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export { Chart, ChartContainer, ChartTooltip, ChartTooltipContent }

