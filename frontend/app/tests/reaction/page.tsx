"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { saveTestResults } from "@/lib/test-utils"
import { useAuth } from "@/lib/auth"

type Stage = "intro" | "test" | "results"

export default function ReactionTestPage() {
  const [stage, setStage] = useState<Stage>("intro")
  const [progress, setProgress] = useState(0)
  const [targetVisible, setTargetVisible] = useState(false)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [testStartTime, setTestStartTime] = useState(0)
  const [targetAppearTime, setTargetAppearTime] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [isEarly, setIsEarly] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const totalRounds = 10
  const { isAuthenticated } = useAuth()

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const testAreaRef = useRef<HTMLDivElement>(null)

  // Handle test start
  const startTest = () => {
    if (!isAuthenticated) {
      alert("Please log in to save your test results")
    }

    setCurrentRound(0)
    setReactionTimes([])
    setProgress(0)
    setCountdown(3)
    setSaveStatus("idle")

    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          setStage("test")
          setTestStartTime(Date.now())
          scheduleNextTarget()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Schedule the next target to appear
  const scheduleNextTarget = () => {
    // Random delay between 1-3 seconds
    const delay = Math.floor(Math.random() * 2000) + 1000

    timerRef.current = setTimeout(() => {
      setTargetVisible(true)
      setTargetAppearTime(Date.now())
    }, delay)
  }

  // Handle click on the test area
  const handleTestAreaClick = () => {
    if (!targetVisible) {
      // Clicked too early
      setIsEarly(true)
      setTimeout(() => setIsEarly(false), 1000)
      return
    }

    // Calculate reaction time
    const reactionTime = Date.now() - targetAppearTime
    setReactionTimes((prev) => [...prev, reactionTime])

    // Hide target
    setTargetVisible(false)

    // Update progress
    const newRound = currentRound + 1
    setCurrentRound(newRound)
    setProgress((newRound / totalRounds) * 100)

    // Check if test is complete
    if (newRound >= totalRounds) {
      setStage("results")
    } else {
      // Schedule next target
      scheduleNextTarget()
    }
  }

  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  // Calculate average reaction time
  const averageReactionTime =
    reactionTimes.length > 0 ? Math.round(reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length) : 0

  // Submit results to backend
  const submitResults = async () => {
    if (!isAuthenticated) return

    try {
      setSaveStatus("saving")

      const results = {
        reactionTimes,
        averageReactionTime,
        fastestReaction: Math.min(...reactionTimes),
        slowestReaction: Math.max(...reactionTimes),
        completedRounds: reactionTimes.length,
        totalRounds,
        timestamp: new Date().toISOString(),
      }

      const success = await saveTestResults("reaction", results)

      if (success) {
        setSaveStatus("success")
      } else {
        setSaveStatus("error")
      }
    } catch (error) {
      console.error("Failed to submit results:", error)
      setSaveStatus("error")
    }
  }

  // Submit results when reaching the results stage
  useEffect(() => {
    if (stage === "results") {
      submitResults()
    }
  }, [stage])

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Reaction Test</h1>
      </div>

      {stage === "intro" && (
        <Card>
          <CardHeader>
            <CardTitle>Reaction Time Test</CardTitle>
            <CardDescription>Measure how quickly you can respond to visual stimuli</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>This test will measure your reaction time by asking you to click on targets as they appear.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You will complete {totalRounds} rounds</li>
              <li>Click as quickly as possible when you see the target appear</li>
              <li>Don't click before the target appears</li>
              <li>Your average reaction time will be calculated</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Slower reaction times can be an indicator of cognitive fatigue.
            </p>

            {!isAuthenticated && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Not logged in</AlertTitle>
                <AlertDescription>
                  You're not logged in. Your results won't be saved.{" "}
                  <Link href="/login" className="underline font-medium">
                    Log in
                  </Link>{" "}
                  to track your progress.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={startTest} className="w-full">
              Start Test
            </Button>
          </CardFooter>
        </Card>
      )}

      {countdown > 0 && stage !== "intro" && stage !== "results" && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
          <div className="text-6xl font-bold">{countdown}</div>
        </div>
      )}

      {stage === "test" && (
        <Card>
          <CardHeader>
            <CardTitle>Click when you see the target</CardTitle>
            <CardDescription>
              Round {currentRound + 1} of {totalRounds}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={progress} className="w-full" />

            <div
              ref={testAreaRef}
              onClick={handleTestAreaClick}
              className="relative w-full h-64 bg-muted rounded-lg flex items-center justify-center cursor-pointer"
            >
              {isEarly && (
                <Alert variant="destructive" className="absolute top-4 left-4 right-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Too early!</AlertTitle>
                  <AlertDescription>Wait for the target to appear before clicking.</AlertDescription>
                </Alert>
              )}

              {targetVisible ? (
                <div className="w-16 h-16 bg-primary rounded-full animate-pulse"></div>
              ) : (
                <p className="text-muted-foreground">Wait for the target...</p>
              )}
            </div>

            {reactionTimes.length > 0 && (
              <div className="text-sm text-center">
                Last reaction time: <span className="font-medium">{reactionTimes[reactionTimes.length - 1]} ms</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {stage === "results" && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Analysis of your reaction time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Test Completed Successfully</AlertTitle>
              <AlertDescription>
                Your reaction time data has been analyzed and added to your fatigue profile.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold">{averageReactionTime} ms</h3>
                <p className="text-muted-foreground">Average Reaction Time</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Fastest Reaction:</span>
                  <span className="font-medium">{reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0} ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Slowest Reaction:</span>
                  <span className="font-medium">{reactionTimes.length > 0 ? Math.max(...reactionTimes) : 0} ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Rounds:</span>
                  <span className="font-medium">
                    {reactionTimes.length} of {totalRounds}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Interpretation</h3>
              <p className="text-sm">
                The average human reaction time to visual stimuli is around 250ms. Reaction times over 300ms may
                indicate fatigue or reduced alertness.
              </p>
            </div>

            {saveStatus === "saving" && (
              <div className="text-sm text-center text-muted-foreground">Saving your results...</div>
            )}

            {saveStatus === "success" && (
              <div className="text-sm text-center text-green-600">Results saved successfully!</div>
            )}

            {saveStatus === "error" && (
              <div className="text-sm text-center text-red-600">
                Failed to save results. Your data will not be included in your profile.
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/tests">Return to Tests</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

