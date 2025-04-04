"use client"

import { Progress } from "@/components/ui/progress"

export function EyeTrackingMetrics() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Blink Rate</span>
          <span className="font-medium text-amber-500">12 blinks/min</span>
        </div>
        <div className="relative pt-1">
          <Progress value={65} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Normal</span>
            <span>Elevated</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Fixation Duration</span>
          <span className="font-medium text-red-500">3.2 sec</span>
        </div>
        <div className="relative pt-1">
          <Progress value={85} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Short</span>
            <span>Long</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Saccade Speed</span>
          <span className="font-medium">Normal</span>
        </div>
        <div className="relative pt-1">
          <Progress value={45} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        <p>Last updated: 5 minutes ago</p>
      </div>
    </div>
  )
}

