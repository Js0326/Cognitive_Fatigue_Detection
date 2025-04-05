"use client"

import type React from "react"
import { saveTestResults } from "@/lib/test-utils"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"

type Stage = "intro" | "test" | "results"
type Operation = "+" | "-" | "*" | "/"

interface Problem {
  num1: number
  num2: number
  operation: Operation
  answer: number
}

export default function MathTestPage() {
  const [stage, setStage] = useState<Stage>("intro")
  const [progress, setProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState(240) // 4 minutes in seconds
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [problems, setProblems] = useState<Problem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<{
    correctAnswers: number
    totalProblems: number
    accuracy: number
    averageResponseTime: number
  } | null>(null)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [responseTimes, setResponseTimes] = useState<number[]>([])
  const [lastProblemTime, setLastProblemTime] = useState(0)

  const totalProblems = 20

  // Generate a random math problem
  const generateProblem = (): Problem => {
    const operations: Operation[] = ["+", "-", "*", "/"]
    const operation = operations[Math.floor(Math.random() * operations.length)]

    let num1, num2, answer

    switch (operation) {
      case "+":
        num1 = Math.floor(Math.random() * 50) + 1
        num2 = Math.floor(Math.random() * 50) + 1
        answer = num1 + num2
        break
      case "-":
        num1 = Math.floor(Math.random() * 50) + 50 // Ensure positive result
        num2 = Math.floor(Math.random() * 50) + 1
        answer = num1 - num2
        break
      case "*":
        num1 = Math.floor(Math.random() * 12) + 1
        num2 = Math.floor(Math.random() * 12) + 1
        answer = num1 * num2
        break
      case "/":
        num2 = Math.floor(Math.random() * 10) + 1
        answer = Math.floor(Math.random() * 10) + 1
        num1 = num2 * answer // Ensure clean division
        break
    }

    return { num1, num2, operation, answer }
  }

  // Generate all problems for the test
  const generateProblems = () => {
    const newProblems = []
    for (let i = 0; i < totalProblems; i++) {
      newProblems.push(generateProblem())
    }
    return newProblems
  }

  // Start the math test
  const startTest = () => {
    const generatedProblems = generateProblems()
    setProblems(generatedProblems)
    setCurrentProblem(generatedProblems[0])
    setCurrentIndex(0)
    setCorrectAnswers(0)
    setResponseTimes([])
    setTimeLeft(240)
    setProgress(0)
    setUserAnswer("")
    setLastProblemTime(Date.now())
    setStage("test")
  }

  // Handle timer countdown
  useEffect(() => {
    if (stage === "test" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1)
        setProgress(((240 - (timeLeft - 1)) / 240) * 100)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && stage === "test") {
      endTest()
    }
  }, [stage, timeLeft])

  // Check the user's answer and move to the next problem
  const submitAnswer = () => {
    if (!currentProblem) return

    const now = Date.now()
    const responseTime = now - lastProblemTime
    setResponseTimes((prev) => [...prev, responseTime])

    // Fixed: Ensure proper comparison by parsing both values as integers
    const isCorrect = Number(userAnswer) === currentProblem.answer
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1)
    }

    const nextIndex = currentIndex + 1

    if (nextIndex >= totalProblems) {
      endTest()
    } else {
      setCurrentIndex(nextIndex)
      setCurrentProblem(problems[nextIndex])
      setUserAnswer("")
      setLastProblemTime(now)
    }
  }

  // End the test and calculate results
  const endTest = () => {
    // Calculate accuracy based on the number of correct answers out of total problems attempted
    const problemsAttempted = currentIndex + 1
    
    // Calculate accuracy as the percentage of correct answers out of problems attempted
    const accuracy = Math.round((correctAnswers / problemsAttempted) * 100)
    
    const avgResponseTime =
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / 1000)
        : 0

    setResults({
      correctAnswers,
      totalProblems: problemsAttempted,
      accuracy,
      averageResponseTime: avgResponseTime,
    })

    setStage("results")
  }

  // Submit results to backend
  const submitResults = async () => {
    if (!results) return

    try {
      await saveTestResults("math", {
        accuracy: results.accuracy,
        averageResponseTime: results.averageResponseTime,
        correctAnswers: results.correctAnswers,
        totalProblems: results.totalProblems,
        timestamp: new Date().toISOString()
      })

      console.log("Math test results saved successfully")
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

  // Format the operation for display
  const formatOperation = (op: Operation) => {
    switch (op) {
      case "+":
        return "+"
      case "-":
        return "−"
      case "*":
        return "×"
      case "/":
        return "÷"
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submitAnswer()
    }
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Math Challenge</h1>
      </div>

      {stage === "intro" && (
        <Card>
          <CardHeader>
            <CardTitle>Math Challenge Test</CardTitle>
            <CardDescription>Test your mental arithmetic and processing speed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This test will measure your cognitive processing speed by asking you to solve arithmetic problems quickly.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You will have 4 minutes to solve as many problems as possible</li>
              <li>Problems include addition, subtraction, multiplication, and division</li>
              <li>Enter your answer and press Enter or click Submit to move to the next problem</li>
              <li>Your accuracy and response time will be measured</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Slower response times and decreased accuracy can indicate cognitive fatigue.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={startTest} className="w-full">
              Start Test
            </Button>
          </CardFooter>
        </Card>
      )}

      {stage === "test" && currentProblem && (
        <Card>
          <CardHeader>
            <CardTitle>Solve the Problem</CardTitle>
            <CardDescription className="flex justify-between">
              <span>
                Problem {currentIndex + 1} of {totalProblems}
              </span>
              <span className="font-medium">{formatTime(timeLeft)} remaining</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={progress} className="w-full" />

            <div className="flex justify-center items-center h-32">
              <div className="text-4xl font-mono">
                {currentProblem.num1} {formatOperation(currentProblem.operation)} {currentProblem.num2} = ?
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value.replace(/[^0-9-]/g, ""))}
                onKeyDown={handleKeyPress}
                placeholder="Enter your answer"
                className="font-mono text-lg"
                autoFocus
              />
              <Button onClick={submitAnswer}>Submit</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {stage === "results" && results && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Analysis of your math challenge performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Test Completed Successfully</AlertTitle>
              <AlertDescription>
                Your math processing data has been analyzed and added to your fatigue profile.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="text-2xl font-bold">
                  {results.correctAnswers}/{results.totalProblems}
                </h3>
                <p className="text-muted-foreground">Correct Answers</p>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="text-2xl font-bold">{results.accuracy}%</h3>
                <p className="text-muted-foreground">Accuracy</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Average Response Time:</span>
                <span className="font-medium">{results.averageResponseTime} seconds</span>
              </div>
              <div className="flex justify-between">
                <span>Problems Attempted:</span>
                <span className="font-medium">
                  {results.totalProblems} of {totalProblems}
                </span>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Interpretation</h3>
              <p className="text-sm">
                Mental arithmetic requires focused attention and working memory. Slower response times or decreased
                accuracy compared to your baseline may indicate cognitive fatigue.
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
