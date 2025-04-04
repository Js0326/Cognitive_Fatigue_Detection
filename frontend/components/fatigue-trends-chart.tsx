"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample data - in a real app, this would come from the API
const generateSampleData = () => {
  const today = new Date()
  const data = []

  // Generate data for the past 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)

    // Generate a fatigue score that trends upward during the day
    const morningScore = Math.floor(Math.random() * 20) + 10
    const afternoonScore = morningScore + Math.floor(Math.random() * 20) + 10
    const eveningScore = afternoonScore + Math.floor(Math.random() * 20) + 5

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      morning: morningScore,
      afternoon: afternoonScore,
      evening: eveningScore,
      average: Math.round((morningScore + afternoonScore + eveningScore) / 3),
    })
  }

  return data
}

export function FatigueTrendsChart() {
  const [data, setData] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState("week")

  useEffect(() => {
    // In a real app, this would fetch data from the API based on the selected time range
    setData(generateSampleData())
  }, [timeRange])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Fatigue Progression Over Time</h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="morning" name="Morning" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="afternoon" name="Afternoon" stroke="#82ca9d" />
            <Line type="monotone" dataKey="evening" name="Evening" stroke="#ff7300" />
            <Line type="monotone" dataKey="average" name="Daily Average" stroke="#ff0000" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-sm text-muted-foreground text-center">
        Fatigue scores tracked over time. Higher scores indicate increased fatigue levels.
      </div>
    </div>
  )
}

