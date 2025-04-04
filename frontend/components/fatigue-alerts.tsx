"use client"

import { AlertTriangle, Coffee, Droplets, Eye, Brain, Clock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"

interface FatigueAlertsProps {
  level: string
  score: number
}

export function FatigueAlerts({ level, score }: FatigueAlertsProps) {
  // Get alert variant based on fatigue level
  const getAlertVariant = () => {
    switch (level) {
      case "Low":
        return "default"
      case "Moderate":
        return "default"
      case "High":
        return "warning"
      case "Severe":
        return "destructive"
      default:
        return "default"
    }
  }

  // Get alert icon based on fatigue level
  const getAlertIcon = () => {
    switch (level) {
      case "Low":
        return <Clock className="h-4 w-4" />
      case "Moderate":
        return <Eye className="h-4 w-4" />
      case "High":
        return <AlertTriangle className="h-4 w-4" />
      case "Severe":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Get alert title based on fatigue level
  const getAlertTitle = () => {
    switch (level) {
      case "Low":
        return "Low Fatigue Detected"
      case "Moderate":
        return "Moderate Fatigue Detected"
      case "High":
        return "High Fatigue Detected"
      case "Severe":
        return "Severe Fatigue Detected"
      default:
        return "Fatigue Status"
    }
  }

  // Get alert description based on fatigue level
  const getAlertDescription = () => {
    switch (level) {
      case "Low":
        return "You're doing well! Continue with your current activities."
      case "Moderate":
        return "Consider taking a short break in the next hour. Stay hydrated and practice the 20-20-20 rule for eye strain."
      case "High":
        return "We recommend taking a 15-minute break now. Step away from your screen, stretch, and rest your eyes."
      case "Severe":
        return "Your fatigue level is severe. Take an extended break immediately and consider ending work for today if possible."
      default:
        return "Monitor your fatigue levels and take breaks as needed."
    }
  }

  // Get recommendations based on fatigue level
  const getRecommendations = () => {
    const baseRecommendations = [
      {
        icon: <Eye className="h-5 w-5 text-blue-500" />,
        title: "Eye Care",
        description: "Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.",
      },
      {
        icon: <Droplets className="h-5 w-5 text-blue-500" />,
        title: "Stay Hydrated",
        description: "Drink water regularly to maintain cognitive function and reduce fatigue.",
      },
    ]

    if (level === "Low") {
      return [
        ...baseRecommendations,
        {
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          title: "Regular Breaks",
          description: "Take short breaks every hour to maintain your current low fatigue level.",
        },
      ]
    } else if (level === "Moderate") {
      return [
        ...baseRecommendations,
        {
          icon: <Coffee className="h-5 w-5 text-blue-500" />,
          title: "Take a Break",
          description: "Consider a 10-minute break to refresh your mind and reduce eye strain.",
        },
      ]
    } else {
      return [
        ...baseRecommendations,
        {
          icon: <Coffee className="h-5 w-5 text-blue-500" />,
          title: "Extended Break",
          description: "Take at least 20-30 minutes away from screens to recover.",
        },
        {
          icon: <Brain className="h-5 w-5 text-blue-500" />,
          title: "Mental Reset",
          description: "Try a brief meditation or deep breathing exercise to reset your focus.",
        },
      ]
    }
  }

  return (
    <div className="space-y-4">
      <Alert variant={getAlertVariant()}>
        {getAlertIcon()}
        <AlertTitle>{getAlertTitle()}</AlertTitle>
        <AlertDescription>{getAlertDescription()}</AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {getRecommendations().map((recommendation, index) => (
          <Card key={index} className="p-4 flex flex-col items-center text-center">
            <div className="mb-2">{recommendation.icon}</div>
            <h3 className="font-medium mb-1">{recommendation.title}</h3>
            <p className="text-sm text-muted-foreground">{recommendation.description}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

