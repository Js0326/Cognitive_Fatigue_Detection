"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { saveTestResults } from "@/lib/test-utils"

type Stage = "intro" | "test" | "results"

export default function TypingTestPage() {
  const [stage, setStage] = useState<Stage>("intro")
  const [progress, setProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes in seconds
  const [typedText, setTypedText] = useState("")
  const [startTime, setStartTime] = useState(0)
  const [results, setResults] = useState<{
    wpm: number
    accuracy: number
    errors: number
    totalChars: number
  } | null>(null)

  const textToType =
    "The human brain is a remarkable organ that controls all functions of the body. It interprets information from the outside world through the five senses: sight, smell, touch, taste, and hearing. This information is integrated with our memory, allowing us to make decisions and send messages to the rest of the body. The brain is susceptible to fatigue, which can impair cognitive functions like attention, memory, and decision-making. Regular breaks and proper rest are essential for maintaining optimal brain function and preventing cognitive fatigue."

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Start the typing test
  const startTest = () => {
    setTypedText("")
    setTimeLeft(180)
    setProgress(0)
    setStartTime(Date.now())
    setStage("test")

    // Focus the textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }, 100)
  }

  // Handle timer countdown
  useEffect(() => {
    if (stage === "test" && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1)
        setProgress(((180 - (timeLeft - 1)) / 180) * 100)
      }, 1000)
    } else if (timeLeft === 0 && stage === "test") {
      endTest()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [stage, timeLeft])

  // Calculate typing metrics and end the test
  const endTest = () => {
    const endTime = Date.now()
    const timeElapsed = (endTime - startTime) / 1000 // in seconds

    // Split text into words for comparison
    const expectedWords = textToType.trim().split(/\s+/)
    const typedWords = typedText.trim().split(/\s+/)

    let correctWords = 0
    let errors = 0

    // Compare only up to the number of typed words
    for (let i = 0; i < typedWords.length; i++) {
      if (i < expectedWords.length && typedWords[i] === expectedWords[i]) {
        correctWords++
      } else {
        errors++
      }
    }

    // Calculate accuracy based on typed words
    const accuracy = typedWords.length > 0
      ? Math.round((correctWords / typedWords.length) * 100)
      : 0

    // Calculate WPM: (total words typed / time in minutes)
    const wpm = Math.round((typedWords.length / (timeElapsed / 60)))

    setResults({
      wpm,
      accuracy,
      errors,
      totalChars: typedText.length,
    })

    setStage("results")
  }

  // Submit results to backend
  const submitResults = async () => {
    if (!results) return

    try {
      await saveTestResults("typing", {
        wpm: results.wpm,
        accuracy: results.accuracy,
        errors: results.errors,
        totalChars: results.totalChars,
        timestamp: new Date().toISOString()
      })

      console.log("Typing test results saved successfully")
    } catch (error) {
      console.error("Failed to submit results:", error)
    }
  }

  // Submit results when reaching the results stage
  useEffect(() => {
    if (stage === "results" && results) {
      submitResults()
    }
  }, [stage, results])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Typing Test</h1>
      </div>

      {stage === "intro" && (
        <Card>
          <CardHeader>
            <CardTitle>Typing Speed & Accuracy Test</CardTitle>
            <CardDescription>Measure your typing speed and accuracy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>This test will measure your typing speed and accuracy by asking you to type a passage of text.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You will have 3 minutes to type as much of the text as possible</li>
              <li>Type exactly what you see, including punctuation and capitalization</li>
              <li>Your words per minute (WPM) and accuracy will be calculated</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Decreased typing speed and accuracy can be indicators of cognitive fatigue.
            </p>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Text to Type:</h3>
              <p className="text-sm">{textToType}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={startTest} className="w-full">
              Start Test
            </Button>
          </CardFooter>
        </Card>
      )}

      {stage === "test" && (
        <Card>
          <CardHeader>
            <CardTitle>Type the following text</CardTitle>
            <CardDescription className="flex justify-between">
              <span>Type as much as you can in the time allowed</span>
              <span className="font-medium">{formatTime(timeLeft)} remaining</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={progress} className="w-full" />

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">{textToType}</p>
            </div>

            <Textarea
              ref={textareaRef}
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder="Start typing here..."
              className="min-h-[150px] resize-none"
              onPaste={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={endTest} className="w-full">
              Finish Early
            </Button>
          </CardFooter>
        </Card>
      )}

      {stage === "results" && results && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Analysis of your typing performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Test Completed Successfully</AlertTitle>
              <AlertDescription>Your typing data has been analyzed and added to your fatigue profile.</AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="text-2xl font-bold">{results.wpm}</h3>
                <p className="text-muted-foreground">Words Per Minute</p>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="text-2xl font-bold">{results.accuracy}%</h3>
                <p className="text-muted-foreground">Accuracy</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Characters:</span>
                <span className="font-medium">{results.totalChars}</span>
              </div>
              <div className="flex justify-between">
                <span>Errors:</span>
                <span className="font-medium">{results.errors}</span>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Interpretation</h3>
              <p className="text-sm">
                The average typing speed is around 40 WPM with 92% accuracy. Typing speeds below your baseline or
                decreased accuracy may indicate cognitive fatigue.
              </p>
            </div>
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
