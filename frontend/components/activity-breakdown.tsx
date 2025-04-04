"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

// Sample data - in a real app, this would come from the API
const data = [
  { name: "Productive Work", value: 45, color: "#4CAF50" },
  { name: "Meetings", value: 20, color: "#2196F3" },
  { name: "Breaks", value: 10, color: "#9C27B0" },
  { name: "Idle Time", value: 15, color: "#FF9800" },
  { name: "App Switching", value: 10, color: "#F44336" },
]

export function ActivityBreakdown() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Productivity & Focus Breakdown</h3>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="text-sm text-muted-foreground text-center">
        Breakdown of your daily activities and focus distribution
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <h4 className="font-medium">Focus Insights</h4>
          <ul className="text-sm space-y-1">
            <li>• You spend 45% of your time in focused, productive work</li>
            <li>• App switching (10%) may indicate distractions</li>
            <li>• Consider increasing break time (currently 10%)</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Recommendations</h4>
          <ul className="text-sm space-y-1">
            <li>• Try the Pomodoro technique (25 min work, 5 min break)</li>
            <li>• Reduce meeting time if possible</li>
            <li>• Schedule focused work during your peak energy hours</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

