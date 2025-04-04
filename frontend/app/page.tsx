import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Brain, Eye, LineChart, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto space-y-12 py-8 px-4">
      <section className="space-y-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Cognitive Fatigue Detection System</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Advanced monitoring and detection of cognitive fatigue using behavioral patterns and eye movement tracking
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button asChild size="lg">
            <Link href="/dashboard">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/tests">Try Tests</Link>
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
        {features.map((feature) => (
          <Card key={feature.title} className="border-2">
            <CardContent className="pt-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground mt-2">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="bg-muted rounded-xl p-8 space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our system uses a combination of passive monitoring, active tests, and eye tracking to detect cognitive
            fatigue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center text-center space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    title: "Passive Monitoring",
    description:
      "Tracks keystrokes, mouse movement, and application usage patterns without interrupting your workflow.",
    icon: Shield,
  },
  {
    title: "Active Tests",
    description: "Interactive cognitive tests to measure reaction time, memory, and multitasking abilities.",
    icon: Brain,
  },
  {
    title: "Eye Tracking",
    description: "Advanced webcam-based eye movement tracking to detect blink rate and fixation patterns.",
    icon: Eye,
  },
  {
    title: "Data Visualization",
    description: "Comprehensive dashboard with real-time fatigue metrics and historical trends.",
    icon: LineChart,
  },
]

const steps = [
  {
    title: "Data Collection",
    description: "The system collects behavioral data and eye tracking metrics as you work.",
  },
  {
    title: "AI Analysis",
    description: "Our AI model analyzes the data to detect patterns indicating cognitive fatigue.",
  },
  {
    title: "Personalized Insights",
    description: "Receive real-time alerts and recommendations to manage your cognitive load.",
  },
]

