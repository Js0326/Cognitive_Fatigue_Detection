"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { saveTestResults } from "@/lib/test-utils"

type Stage = "intro" | "memorize" | "recall" | "results"

export default function MemoryTestPage() {
  const [stage, setStage] = useState<Stage>("intro")
  const [progress, setProgress] = useState(0)
  const [currentRound, setCurrentRound] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [sequence, setSequence] = useState<string>("")
  const [userInput, setUserInput] = useState("")
  const [results, setResults] = useState<{
    correctSequences: number
    totalSequences: number
    accuracy: number
    longestSequence: number
  } | null>(null)
  const [correctSequences, setCorrectSequences] = useState(0)
  const [longestCorrectSequence, setLongestCorrectSequence] = useState(0)

  const totalRounds = 5
  const memorizeTime = 5 // seconds to memorize

  // Generate a random sequence based on the round
  const generateSequence = (round: number) => {
    const length = round + 4 // Start with 5 digits, increase by 1 each round
    let result = ""
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10).toString()
    }
    return result
  }

  // Start the memory test
  const startTest = () => {
    setCurrentRound(0)
    setCorrectSequences(0)
    setLongestCorrectSequence(0)
    setProgress(0)
    startNextRound()
  }

  // Start the next round
  const startNextRound = () => {
    const round = currentRound + 1
    setCurrentRound(round)
    setProgress(((round - 1) / totalRounds) * 100)

    // Generate new sequence
    const newSequence = generateSequence(round)
    setSequence(newSequence)
    setUserInput("")

    // Start memorize phase
    setTimeLeft(memorizeTime)
    setStage("memorize")

    // Timer for memorize phase
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setStage("recall")
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Check the user's answer
  const checkAnswer = () => {
    const isCorrect = userInput === sequence
    
    // Update correct sequences count if answer is correct
    let updatedCorrectSequences = correctSequences
    if (isCorrect) {
      updatedCorrectSequences = correctSequences + 1
      setCorrectSequences(updatedCorrectSequences)
      setLongestCorrectSequence((prev) => Math.max(prev, sequence.length))
    }

    if (currentRound >= totalRounds) {
      // End of test
      const accuracy = Math.round((updatedCorrectSequences / totalRounds) * 100)

      setResults({
        correctSequences: updatedCorrectSequences,
        totalSequences: totalRounds,
        accuracy,
        longestSequence: longestCorrectSequence,
      })

      setStage("results")
    } else {
      // Next round
      startNextRound()
    }
  }

  // Submit results to backend
  const submitResults = async () => {
    if (!results) return

    try {
      await saveTestResults("memory", {
        accuracy: results.accuracy,
        correctSequences: results.correctSequences,
        totalSequences: results.totalSequences,
        longestSequence: results.longestSequence,
        timestamp: new Date().toISOString()
      })

      console.log("Memory test results saved successfully")
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

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Memory Recall Test</h1>
      </div>

      {stage === "intro" && (
        <Card>
          <CardHeader>
            <CardTitle>Memory Recall Test</CardTitle>
            <CardDescription>Test your short-term memory capacity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This test will measure your short-term memory by asking you to remember and recall sequences of numbers.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You will be shown a sequence of numbers for {memorizeTime} seconds</li>
              <li>After the sequence disappears, you'll need to recall and enter it</li>
              <li>Each round, the sequence will get longer</li>
              <li>You will complete {totalRounds} rounds in total</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Reduced memory recall capacity can be an indicator of cognitive fatigue.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={startTest} className="w-full">
              Start Test
            </Button>
          </CardFooter>
        </Card>
      )}

      {stage === "memorize" && (
        <Card>
          <CardHeader>
            <CardTitle>Memorize the Sequence</CardTitle>
            <CardDescription>
              Round {currentRound} of {totalRounds} - Time remaining: {timeLeft} seconds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={progress} className="w-full" />

            <div className="flex justify-center items-center h-32">
              <div className="text-4xl font-mono tracking-wider">{sequence}</div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Memorize this sequence</AlertTitle>
              <AlertDescription>
                Remember the sequence of numbers shown above. You will need to recall it in the next step.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {stage === "recall" && (
        <Card>
          <CardHeader>
            <CardTitle>Recall the Sequence</CardTitle>
            <CardDescription>
              Round {currentRound} of {totalRounds} - Enter the sequence you just saw
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={progress} className="w-full" />

            <div className="space-y-2">
              <label htmlFor="sequence" className="text-sm font-medium">
                Enter the sequence:
              </label>
              <Input
                id="sequence"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Enter the sequence you memorized"
                className="font-mono text-lg"
                autoFocus
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                maxLength={sequence.length}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={checkAnswer} className="w-full">
              Submit Answer
            </Button>
          </CardFooter>
        </Card>
      )}

      {stage === "results" && results && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Analysis of your memory recall performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Test Completed Successfully</AlertTitle>
              <AlertDescription>
                Your memory recall data has been analyzed and added to your fatigue profile.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="text-2xl font-bold">
                  {results.correctSequences}/{results.totalSequences}
                </h3>
                <p className="text-muted-foreground">Correct Sequences</p>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="text-2xl font-bold">{results.accuracy}%</h3>
                <p className="text-muted-foreground">Accuracy</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Longest Sequence Recalled:</span>
                <span className="font-medium">{results.longestSequence} digits</span>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Interpretation</h3>
              <p className="text-sm">
                The average person can recall 7±2 digits in short-term memory. Performance below your baseline may
                indicate cognitive fatigue.
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
