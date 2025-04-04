"use client"
import { Chart, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis } from "recharts"

interface TrendData {
  date: string
  fatigue: number
  eyeStrain: number
}

interface FatigueChartProps {
  data: TrendData[]
}

export function FatigueChart({ data }: FatigueChartProps) {
  return (
    <ChartContainer
      className="h-[300px] w-full"
      data={data}
      tooltip={
        <ChartTooltip>
          <ChartTooltipContent
            content={({ payload, label }) => {
              if (!payload?.length) {
                return null
              }

              return (
                <div className="p-2">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-xs text-muted-foreground">Fatigue: {payload[0]?.value}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span className="text-xs text-muted-foreground">Eye Strain: {payload[1]?.value}</span>
                    </div>
                  </div>
                </div>
              )
            }}
          />
        </ChartTooltip>
      }
    >
      <Chart>
        <LineChart data={data}>
          <XAxis dataKey="day" tickLine={false} axisLine={false} padding={{ left: 10, right: 10 }} />
          <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} domain={[0, 100]} />
          <Line
            type="monotone"
            dataKey="fatigue"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            activeDot={{ r: 6 }}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="eyeStrain"
            stroke="hsl(var(--blue-500))"
            strokeWidth={2}
            activeDot={{ r: 6 }}
            dot={{ r: 4 }}
          />
        </LineChart>
      </Chart>
    </ChartContainer>
  )
}

