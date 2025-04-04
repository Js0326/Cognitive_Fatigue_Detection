"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface TestResultsPanelProps {
  testResults: Record<string, any> | null
}

export function TestResultsPanel({ testResults }: TestResultsPanelProps) {
  if (!testResults || Object.keys(testResults).length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No test results available. Complete tests to see your performance.
      </div>
    )
  }

  // Format test names for display
  const formatTestName = (key: string) => {
    switch (key) {
      case "typing":
        return "Typing Test"
      case "reaction":
        return "Reaction Test"
      case "memory":
        return "Memory Recall"
      case "math":
        return "Math Challenge"
      case "eye-tracking":
        return "Eye Tracking"
      case "multitasking":
        return "Multitasking"
      default:
        return key.charAt(0).toUpperCase() + key.slice(1)
    }
  }

  // Get primary metric for each test
  const getPrimaryMetric = (testType: string, data: any) => {
    switch (testType) {
      case "typing":
        return {
          label: "WPM",
          value: data.wpm || 0,
          unit: "",
          secondaryLabel: "Accuracy",
          secondaryValue: data.accuracy || 0,
          secondaryUnit: "%",
        }
      case "reaction":
        return {
          label: "Reaction Time",
          value: data.averageReactionTime || 0,
          unit: "ms",
          secondaryLabel: "Fastest",
          secondaryValue: data.fastestReaction || 0,
          secondaryUnit: "ms",
        }
      case "memory":
        return {
          label: "Accuracy",
          value: data.accuracy || 0,
          unit: "%",
          secondaryLabel: "Longest Sequence",
          secondaryValue: data.longestSequence || 0,
          secondaryUnit: " digits",
        }
      case "math":
        return {
          label: "Accuracy",
          value: data.accuracy || 0,
          unit: "%",
          secondaryLabel: "Response Time",
          secondaryValue: data.averageResponseTime || 0,
          secondaryUnit: "s",
        }
      case "eye-tracking":
        return {
          label: "Blink Rate",
          value: data.blinkRate || 0,
          unit: " bpm",
          secondaryLabel: "Fixation",
          secondaryValue: data.fixationDuration || 0,
          secondaryUnit: "s",
        }
      case "multitasking":
        return {
          label: "Score",
          value: data.score || 0,
          unit: "",
          secondaryLabel: "Reaction Time",
          secondaryValue: data.averageReactionTime || 0,
          secondaryUnit: "ms",
        }
      default:
        return {
          label: "Score",
          value: 0,
          unit: "",
          secondaryLabel: "",
          secondaryValue: 0,
          secondaryUnit: "",
        }
    }
  }

  // Get trend indicator (up, down, or neutral)
  const getTrendIndicator = (testType: string, value: number) => {
    // For reaction time and fixation duration, lower is better
    const isLowerBetter = testType === "reaction" || 
                         (testType === "eye-tracking" && value > 15) || 
                         (testType === "math" && value > 5) // Response time over 5s is slow

    // Simulated previous value (in a real app, this would come from historical data)
    const previousValue = value * (0.9 + Math.random() * 0.2) // Random variation of ±10%

    if (Math.abs(value - previousValue) < value * 0.05) {
      return {
        icon: <Minus className="h-4 w-4 text-gray-500" />,
        color: "text-gray-500",
        label: "No change",
      }
    } else if ((value > previousValue && !isLowerBetter) || (value < previousValue && isLowerBetter)) {
      return {
        icon: <ArrowUpRight className="h-4 w-4 text-green-500" />,
        color: "text-green-500",
        label: "Improved",
      }
    } else {
      return {
        icon: <ArrowDownRight className="h-4 w-4 text-red-500" />,
        color: "text-red-500",
        label: "Declined",
      }
    }
  }

  // Get progress value for visualization
  const getProgressValue = (testType: string, value: number) => {
    switch (testType) {
      case "typing":
        return Math.min((value / 100) * 100, 100) // WPM
      case "reaction":
        return Math.max(0, 100 - (value / 5)) // Reaction time (lower is better)
      case "memory":
        return value // Accuracy percentage
      case "math":
        return value // Accuracy percentage
      case "eye-tracking":
        return Math.min(value * 3, 100) // Blink rate
      case "multitasking":
        return value // Score
      default:
        return 50
    }
  }

  // Get progress color based on test type and value
  const getProgressColor = (testType: string, value: number) => {
    // For reaction time, lower is better
    if (testType === "reaction") {
      if (value < 200) return "bg-green-500"
      if (value < 300) return "bg-amber-500"
      return "bg-red-500"
    }

    // For eye tracking blink rate
    if (testType === "eye-tracking") {
      if (value < 15) return "bg-green-500"
      if (value < 25) return "bg-amber-500"
      return "bg-red-500"
    }

    // For math response time
    if (testType === "math") {
      if (value < 3) return "bg-green-500"
      if (value < 5) return "bg-amber-500"
      return "bg-red-500"
    }

    // For other tests, higher is generally better
    const progressValue = getProgressValue(testType, value)
    if (progressValue > 75) return "bg-green-500"
    if (progressValue > 50) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(testResults).map(([testType, data]) => {
        const metric = getPrimaryMetric(testType, data)
        const trend = getTrendIndicator(testType, metric.value)
        const progressValue = getProgressValue(testType, metric.value)
        const progressColor = getProgressColor(testType, metric.value)

        return (
          <Card key={testType} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium">{formatTestName(testType)}</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-2xl font-bold mr-1">{metric.value}</span>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                    <span className="ml-2">{trend.icon}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">{metric.secondaryLabel}</div>
                  <div className="font-medium">
                    {metric.secondaryValue}
                    <span className="text-sm text-muted-foreground">{metric.secondaryUnit}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Performance</span>
                  <span className={trend.color}>{trend.label}</span>
                </div>
                <Progress value={progressValue} className={`h-2 ${progressColor}`} />
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                Last tested: {new Date(data.timestamp).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
