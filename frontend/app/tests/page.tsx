import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Clock, Eye, MousePointer, Calculator, Layers } from "lucide-react"
import Link from "next/link"

export default function TestsPage() {
  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fatigue Tests</h1>
        <p className="text-muted-foreground">Complete these tests to measure your current cognitive fatigue level</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {tests.map((test) => (
          <Card key={test.title} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <test.icon className="h-5 w-5 text-primary" />
                </div>
                {test.isNew && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    New
                  </Badge>
                )}
              </div>
              <CardTitle className="mt-4">{test.title}</CardTitle>
              <CardDescription>{test.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{test.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty:</span>
                  <span>{test.difficulty}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href={test.href}>Start Test</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

const tests = [
  {
    title: "Reaction Test",
    description: "Measure your reaction time by clicking on targets as they appear",
    icon: MousePointer,
    duration: "2 minutes",
    difficulty: "Easy",
    href: "/tests/reaction",
    isNew: false,
  },
  {
    title: "Typing Test",
    description: "Type a passage of text to measure your typing speed and accuracy",
    icon: Clock,
    duration: "3 minutes",
    difficulty: "Medium",
    href: "/tests/typing",
    isNew: false,
  },
  {
    title: "Memory Recall",
    description: "Remember and recall sequences of numbers, letters, or patterns",
    icon: Brain,
    duration: "5 minutes",
    difficulty: "Hard",
    href: "/tests/memory",
    isNew: false,
  },
  {
    title: "Math Challenge",
    description: "Solve arithmetic problems quickly to test cognitive processing",
    icon: Calculator,
    duration: "4 minutes",
    difficulty: "Medium",
    href: "/tests/math",
    isNew: false,
  },
  {
    title: "Eye Tracking Test",
    description: "Track eye movement patterns, blink rate, and fixation time",
    icon: Eye,
    duration: "3 minutes",
    difficulty: "Easy",
    href: "/tests/eye-tracking",
    isNew: true,
  },
  {
    title: "Multitasking Test",
    description: "Perform two tasks simultaneously to measure cognitive load",
    icon: Layers,
    duration: "3 minutes",
    difficulty: "Hard",
    href: "/tests/multitasking",
    isNew: false,
  },
]

