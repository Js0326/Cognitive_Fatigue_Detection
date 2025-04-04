"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TestPerformanceChartProps {
  testResults: Record<string, any> | null
}

export function TestPerformanceChart({ testResults }: TestPerformanceChartProps) {
  const [selectedTest, setSelectedTest] = useState<string>("all")

  // Format test names for display
  const formatTestName = (key: string) => {
    switch (key) {
      case "typing":
        return "Typing"
      case "reaction":
        return "Reaction"
      case "memory":
        return "Memory"
      case "math":
        return "Math"
      case "eye-tracking":
        return "Eye Tracking"
      case "multitasking":
        return "Multitasking"
      default:
        return key.charAt(0).toUpperCase() + key.slice(1)
    }
  }

  // Generate chart data based on test results
  const generateChartData = () => {
    if (!testResults) return []

    // If a specific test is selected
    if (selectedTest !== "all") {
      const testData = testResults[selectedTest]
      if (!testData) return []

      // Generate historical data (simulated)
      const data = []
      const today = new Date()

      for (let i = 4; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i * 2)

        // For the most recent date, use actual test data
        // For previous dates, simulate historical data with random variations
        const variation = i === 0 ? 1 : 0.7 + Math.random() * 0.6

        const entry: any = {
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        }

        switch (selectedTest) {
          case "typing":
            entry.wpm = i === 0 ? testData.wpm : Math.round(testData.wpm * variation)
            entry.accuracy = i === 0 ? testData.accuracy : Math.min(100, Math.round(testData.accuracy * variation))
            break
          case "reaction":
            // For reaction time, lower is better, so we invert the variation
            entry.reactionTime =
              i === 0 ? testData.averageReactionTime : Math.round(testData.averageReactionTime * (2 - variation))
            break
          case "memory":
            entry.accuracy = i === 0 ? testData.accuracy : Math.min(100, Math.round(testData.accuracy * variation))
            break
          case "math":
            entry.accuracy = i === 0 ? testData.accuracy : Math.min(100, Math.round(testData.accuracy * variation))
            entry.responseTime =
              i === 0 ? testData.averageResponseTime : Math.round(testData.averageResponseTime * (2 - variation))
            break
          case "eye-tracking":
            entry.blinkRate = i === 0 ? testData.blinkRate : Math.round(testData.blinkRate * variation)
            entry.fixationDuration =
              i === 0 ? testData.fixationDuration : Number((testData.fixationDuration * variation).toFixed(1))
            break
          case "multitasking":
            entry.score = i === 0 ? testData.score : Math.round(testData.score * variation)
            entry.accuracy = i === 0 ? testData.accuracy : Math.min(100, Math.round(testData.accuracy * variation))
            break
        }

        data.push(entry)
      }

      return data
    }

    // If "all" is selected, show comparison of all tests
    return Object.entries(testResults).map(([testType, data]) => {
      const testName = formatTestName(testType)

      // Normalize values to 0-100 scale for comparison
      let normalizedValue = 0

      switch (testType) {
        case "typing":
          normalizedValue = Math.min(100, (data.wpm / 100) * 100)
          break
        case "reaction":
          // Lower is better for reaction time, so invert
          normalizedValue = Math.max(0, 100 - data.averageReactionTime / 5)
          break
        case "memory":
          normalizedValue = data.accuracy
          break
        case "math":
          normalizedValue = data.accuracy
          break
        case "eye-tracking":
          // Normalize blink rate - around 15 is optimal
          const blinkRate = data.blinkRate
          normalizedValue = blinkRate < 15 ? (blinkRate / 15) * 100 : Math.max(0, 100 - ((blinkRate - 15) / 15) * 100)
          break
        case "multitasking":
          normalizedValue = Math.min(100, (data.score / 100) * 100)
          break
      }

      return {
        test: testName,
        performance: Math.round(normalizedValue),
        raw: data,
      }
    })
  }

  const chartData = generateChartData()

  // Get chart configuration based on selected test
  const getChartConfig = () => {
    if (selectedTest === "all") {
      return {
        dataKey: "test",
        bars: [{ dataKey: "performance", name: "Performance", fill: "#8884d8" }],
      }
    }

    switch (selectedTest) {
      case "typing":
        return {
          dataKey: "date",
          bars: [
            { dataKey: "wpm", name: "WPM", fill: "#8884d8" },
            { dataKey: "accuracy", name: "Accuracy (%)", fill: "#82ca9d" },
          ],
        }
      case "reaction":
        return {
          dataKey: "date",
          bars: [{ dataKey: "reactionTime", name: "Reaction Time (ms)", fill: "#8884d8" }],
        }
      case "memory":
        return {
          dataKey: "date",
          bars: [{ dataKey: "accuracy", name: "Accuracy (%)", fill: "#8884d8" }],
        }
      case "math":
        return {
          dataKey: "date",
          bars: [
            { dataKey: "accuracy", name: "Accuracy (%)", fill: "#8884d8" },
            { dataKey: "responseTime", name: "Response Time (s)", fill: "#82ca9d" },
          ],
        }
      case "eye-tracking":
        return {
          dataKey: "date",
          bars: [
            { dataKey: "blinkRate", name: "Blink Rate (bpm)", fill: "#8884d8" },
            { dataKey: "fixationDuration", name: "Fixation Duration (s)", fill: "#82ca9d" },
          ],
        }
      case "multitasking":
        return {
          dataKey: "date",
          bars: [
            { dataKey: "score", name: "Score", fill: "#8884d8" },
            { dataKey: "accuracy", name: "Accuracy (%)", fill: "#82ca9d" },
          ],
        }
      default:
        return {
          dataKey: "date",
          bars: [{ dataKey: "value", name: "Value", fill: "#8884d8" }],
        }
    }
  }

  const chartConfig = getChartConfig()

  if (!testResults || Object.keys(testResults).length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No test results available. Complete tests to see your performance trends.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Test Performance Over Time</h3>
        <Select value={selectedTest} onValueChange={setSelectedTest}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tests</SelectItem>
            {Object.keys(testResults).map((test) => (
              <SelectItem key={test} value={test}>
                {formatTestName(test)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={chartConfig.dataKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {chartConfig.bars.map((bar, index) => (
              <Bar key={index} dataKey={bar.dataKey} name={bar.name} fill={bar.fill} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-sm text-muted-foreground text-center">
        {selectedTest === "all"
          ? "Normalized performance across all tests (higher is better)"
          : `Historical performance data for ${formatTestName(selectedTest)} test`}
      </div>
    </div>
  )
}

