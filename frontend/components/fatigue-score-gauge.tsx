"use client"

import { cn } from "@/lib/utils"

interface FatigueScoreGaugeProps {
  value: number
  className?: string
}

export function FatigueScoreGauge({ value, className }: FatigueScoreGaugeProps) {
  // Calculate the rotation angle based on the value (0-100)
  // Map 0-100 to -90 to 90 degrees for proper semicircle coverage
  const rotation = -90 + (value / 100) * 180

  // Determine the color based on the value
  const getColor = () => {
    if (value < 33) return "text-green-500"
    if (value < 66) return "text-amber-500"
    return "text-red-500"
  }

  // Determine the label based on the value
  const getLabel = () => {
    if (value < 33) return "Low"
    if (value < 66) return "Moderate"
    return "High"
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative w-48 h-28">
        {/* SVG Container */}
        <svg
          className="w-full h-full"
          viewBox="0 0 200 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Track */}
          <path
            d="M20 100 A80 80 0 0 1 180 100"
            stroke="currentColor"
            strokeWidth="20"
            className="text-muted"
            strokeLinecap="round"
          />

          {/* Green Section (Left) */}
          <path
            d="M20 100 A80 80 0 0 1 73.33 41.96"
            stroke="#22c55e"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Yellow Section (Middle) */}
          <path
            d="M73.33 41.96 A80 80 0 0 1 126.67 41.96"
            stroke="#eab308"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Red Section (Right) */}
          <path
            d="M126.67 41.96 A80 80 0 0 1 180 100"
            stroke="#ef4444"
            strokeWidth="20"
            strokeLinecap="round"
          />
        </svg>

        {/* Center Pivot Point */}
        <div className="absolute bottom-0 left-1/2 w-5 h-5 bg-background border-2 border-foreground rounded-full -translate-x-1/2 z-20">
          {/* Inner dot */}
          <div className="absolute inset-1 rounded-full bg-foreground"></div>
        </div>

        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 w-1.5 h-24 bg-foreground origin-bottom rounded-t-full -translate-x-1/2 transition-transform duration-1000 z-10"
          style={{ transform: `rotate(${rotation}deg)` }}
        ></div>
      </div>

      <div className="mt-4 text-center">
        <div className={cn("text-4xl font-bold", getColor())}>{value}</div>
        <div className={cn("text-sm font-medium", getColor())}>{getLabel()} Fatigue</div>
      </div>
    </div>
  )
}
