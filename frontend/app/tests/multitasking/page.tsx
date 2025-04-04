"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { saveTestResults } from "@/lib/test-utils"
import { useAuth } from "@/lib/auth"

type Stage = "intro" | "test" | "results"

interface Target {
  id: number
  x: number
  y: number
  size: number
  color: string
  shape: "circle" | "square" | "triangle" | "star"
  rotation: number
  speed: number
  direction: { x: number; y: number }
  createdAt: number
}

interface ClickData {
  targetId: number
  reactionTime: number // Time from target creation to click
  position: { x: number; y: number }
  timestamp: number
}

export default function MultitaskingTestPage() {
  const [stage, setStage] = useState<Stage>("intro")
  const [progress, setProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes in seconds
  const [targets, setTargets] = useState<Target[]>([])
  const [equation, setEquation] = useState("")
  const [equationAnswer, setEquationAnswer] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [targetsClicked, setTargetsClicked] = useState(0)
  const [equationsSolved, setEquationsSolved] = useState(0)
  const [correctEquations, setCorrectEquations] = useState(0)
  const [clickData, setClickData] = useState<ClickData[]>([])
  const [results, setResults] = useState<{
    score: number
    targetsClicked: number
    equationsSolved: number
    accuracy: number
    multitaskingIndex: number
    averageReactionTime: number
  } | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const targetGenerationRef = useRef<NodeJS.Timeout | null>(null)
  const targetDataRef = useRef<Target[]>([])
  const { isAuthenticated } = useAuth()

  // Start the multitasking test
  const startTest = () => {
    setScore(0)
    setTargetsClicked(0)
    setEquationsSolved(0)
    setCorrectEquations(0)
    setTimeLeft(180) // 3 minutes
    setProgress(0)
    setUserAnswer("")
    setClickData([])
    setSaveStatus("idle")
    generateEquation()
    setStage("test")
  }

  // Generate a simple math equation
  const generateEquation = () => {
    const operations = ["+", "-", "*"]
    const operation = operations[Math.floor(Math.random() * operations.length)]

    let num1, num2, answer

    switch (operation) {
      case "+":
        num1 = Math.floor(Math.random() * 20) + 1
        num2 = Math.floor(Math.random() * 20) + 1
        answer = num1 + num2
        break
      case "-":
        num1 = Math.floor(Math.random() * 20) + 20 // Ensure positive result
        num2 = Math.floor(Math.random() * 20) + 1
        answer = num1 - num2
        break
      case "*":
        num1 = Math.floor(Math.random() * 10) + 1
        num2 = Math.floor(Math.random() * 10) + 1
        answer = num1 * num2
        break
      default:
        num1 = 1
        num2 = 1
        answer = 2
    }

    setEquation(`${num1} ${operation === "*" ? "×" : operation} ${num2} = ?`)
    setEquationAnswer(answer)
    return answer
  }

  // Check the user's answer to the equation
  const checkAnswer = () => {
    const isCorrect = Number.parseInt(userAnswer) === equationAnswer

    if (isCorrect) {
      setCorrectEquations((prev) => prev + 1)
      setScore((prev) => prev + 10)
    }

    setEquationsSolved((prev) => prev + 1)
    setUserAnswer("")
    generateEquation()
  }

  // Handle timer countdown
  useEffect(() => {
    if (stage === "test" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1)
        setProgress(((180 - (timeLeft - 1)) / 180) * 100)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && stage === "test") {
      endTest()
    }
  }, [stage, timeLeft])

  // Draw a star shape
  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, spikes = 5) => {
    let rotation = (Math.PI / 2) * 3
    const outerRadius = radius
    const innerRadius = radius / 2
    const step = Math.PI / spikes

    ctx.beginPath()
    ctx.moveTo(x, y - outerRadius)

    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(x + Math.cos(rotation) * outerRadius, y + Math.sin(rotation) * outerRadius)
      rotation += step

      ctx.lineTo(x + Math.cos(rotation) * innerRadius, y + Math.sin(rotation) * innerRadius)
      rotation += step
    }

    ctx.lineTo(x, y - outerRadius)
    ctx.closePath()
  }

  // Handle canvas setup and target generation
  useEffect(() => {
    if (stage !== "test") return;
    
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;

    if (!canvas || !container) return;

    // Set canvas size
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Clear any previous state
    setTargets([]);
    targetDataRef.current = [];
    
    // Create a target and add it to our local ref
    const createTarget = () => {
      if (targetDataRef.current.length >= 3) return;
      
      const shapes = ["circle", "square", "triangle", "star"] as const;
      const colors = [
        "#FF5252", "#FF4081", "#E040FB", "#7C4DFF", "#536DFE", "#448AFF", 
        "#40C4FF", "#18FFFF", "#64FFDA", "#69F0AE", "#B2FF59", "#EEFF41"
      ];
      
      const size = Math.floor(Math.random() * 20) + 40; // 40-60px
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const rotation = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.5 + 0.1; // 0.1-0.6 pixels per frame
      
      // Random direction vector (normalized)
      const dirX = Math.random() * 2 - 1;
      const dirY = Math.random() * 2 - 1;
      const magnitude = Math.sqrt(dirX * dirX + dirY * dirY);
      
      const newTarget = {
        id: Date.now() + Math.random() * 1000,
        x: Math.random() * (canvas.width - size * 2) + size,
        y: Math.random() * (canvas.height - size * 2) + size,
        size,
        shape,
        color,
        rotation,
        speed,
        direction: {
          x: dirX / magnitude,
          y: dirY / magnitude,
        },
        createdAt: Date.now(),
      };
      
      // Add target to our local ref
      targetDataRef.current = [...targetDataRef.current, newTarget];
      
      // We only update React state ONCE here, to show the "waiting" message
      // or not, and to track how many targets are active
      setTargets(targetDataRef.current);
    };
    
    // Start with one target after a short delay
    const initialTimeout = setTimeout(() => {
      createTarget();
    }, 500);
    
    // Periodically add more targets
    const generationInterval = setInterval(() => {
      // Only create new targets if we have fewer than 3
      if (targetDataRef.current.length < 3) {
        createTarget();
      }
    }, 2500);
    
    // Animation function - doesn't update React state at all
    const animate = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw each target
      targetDataRef.current.forEach(target => {
        // Update position based on direction and speed
        let newX = target.x + target.direction.x * target.speed;
        let newY = target.y + target.direction.y * target.speed;
        
        // Bounce off walls
        if (newX <= target.size || newX >= canvas.width - target.size) {
          target.direction.x = -target.direction.x;
          newX = Math.max(target.size, Math.min(newX, canvas.width - target.size));
        }
        
        if (newY <= target.size || newY >= canvas.height - target.size) {
          target.direction.y = -target.direction.y;
          newY = Math.max(target.size, Math.min(newY, canvas.height - target.size));
        }
        
        // Update target position directly (mutation is fine here)
        target.x = newX;
        target.y = newY;
        target.rotation += 0.01; // Slowly rotate
        
        // Draw the target
        ctx.save();
        ctx.translate(target.x, target.y);
        ctx.rotate(target.rotation);
        
        ctx.fillStyle = target.color;
        
        switch (target.shape) {
          case "circle":
            ctx.beginPath();
            ctx.arc(0, 0, target.size, 0, Math.PI * 2);
            ctx.fill();
            break;
            
          case "square":
            ctx.fillRect(-target.size, -target.size, target.size * 2, target.size * 2);
            break;
            
          case "triangle":
            ctx.beginPath();
            ctx.moveTo(0, -target.size);
            ctx.lineTo(-target.size, target.size);
            ctx.lineTo(target.size, target.size);
            ctx.closePath();
            ctx.fill();
            break;
            
          case "star":
            drawStar(ctx, 0, 0, target.size);
            ctx.fill();
            break;
        }
        
        ctx.restore();
      });
      
      // Schedule next animation frame
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    animationRef.current = requestAnimationFrame(animate);
    
    // Handle canvas clicks directly
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Find if we hit any target
      let targetHit = false;
      let hitIndex = -1;
      let hitTarget: Target | null = null;
      
      for (let i = 0; i < targetDataRef.current.length; i++) {
        const target = targetDataRef.current[i];
        const distance = Math.sqrt(Math.pow(target.x - x, 2) + Math.pow(target.y - y, 2));
        
        if (distance <= target.size * 2) { // Larger hit area
          targetHit = true;
          hitIndex = i;
          hitTarget = target;
          break;
        }
      }
      
      if (targetHit && hitIndex !== -1 && hitTarget) {
        // Copy target data before removal
        const targetId = hitTarget.id;
        const targetCreationTime = hitTarget.createdAt;
        
        // Remove target from our local array
        targetDataRef.current.splice(hitIndex, 1);
        
        // Update React state (minimally)
        setTargets([...targetDataRef.current]);
        
        // Update score
        setScore(prev => prev + 5);
        setTargetsClicked(prev => prev + 1);
        
        // Record click data
        const reactionTime = Date.now() - targetCreationTime;
        setClickData(prev => [
          ...prev,
          {
            targetId,
            reactionTime,
            position: { x, y },
            timestamp: Date.now(),
          },
        ]);
      }
    };
    
    // Attach click handler
    canvas.addEventListener('click', handleCanvasClick);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
      clearInterval(generationInterval);
      clearTimeout(initialTimeout);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [stage]); // Only depend on stage state

  // End the test and calculate results
  const endTest = () => {
    cancelAnimationFrame(animationRef.current)
    if (targetGenerationRef.current) {
      clearInterval(targetGenerationRef.current)
    }

    const accuracy = equationsSolved > 0 ? Math.round((correctEquations / equationsSolved) * 100) : 0

    // Calculate average reaction time
    const avgReactionTime =
      clickData.length > 0
        ? Math.round(clickData.reduce((sum, data) => sum + data.reactionTime, 0) / clickData.length)
        : 0

    // Calculate multitasking index (balance between targets and equations)
    const targetWeight = targetsClicked * 5
    const equationWeight = correctEquations * 10
    const multitaskingIndex = Math.round((targetWeight + equationWeight) / 2)

    setResults({
      score,
      targetsClicked,
      equationsSolved,
      accuracy,
      multitaskingIndex,
      averageReactionTime: avgReactionTime,
    })

    setStage("results")
  }

  // Submit results to backend
  const submitResults = async () => {
    if (!results || !isAuthenticated) return

    try {
      setSaveStatus("saving")

      const dataToSave = {
        ...results,
        clickData,
        timestamp: new Date().toISOString(),
      }

      const success = await saveTestResults("multitasking", dataToSave)

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

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      checkAnswer()
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
        <h1 className="text-3xl font-bold tracking-tight">Multitasking Test</h1>
      </div>

      {stage === "intro" && (
        <Card>
          <CardHeader>
            <CardTitle>Multitasking Test</CardTitle>
            <CardDescription>Test your ability to perform multiple tasks simultaneously</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>This test will measure your multitasking ability by asking you to perform two tasks at once:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Task 1: Click on colored shapes that appear and move on the screen</li>
              <li>Task 2: Solve simple math equations</li>
              <li>You will have 3 minutes to score as many points as possible</li>
              <li>Clicking a shape: 5 points</li>
              <li>Solving an equation correctly: 10 points</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Reduced multitasking ability can be a significant indicator of cognitive fatigue.
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

      {stage === "test" && (
        <Card>
          <CardHeader>
            <CardTitle>Multitasking Test</CardTitle>
            <CardDescription className="flex justify-between">
              <span>Score: {score} points</span>
              <span className="font-medium">{formatTime(timeLeft)} remaining</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={progress} className="w-full" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="font-medium">Task 1: Click on the shapes</div>
                <div ref={canvasContainerRef} className="relative w-full h-[200px] bg-muted rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full cursor-pointer"
                  />
                  {targets.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      Waiting for shapes to appear...
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="font-medium">Task 2: Solve the equation</div>
                <div className="text-2xl font-mono text-center py-4">{equation}</div>
                <div className="flex gap-2">
                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value.replace(/[^0-9-]/g, ""))}
                    onKeyDown={handleKeyPress}
                    placeholder="Enter your answer"
                    className="font-mono text-lg"
                  />
                  <Button onClick={checkAnswer}>Submit</Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Targets clicked: {targetsClicked}</div>
              <div>Equations solved: {equationsSolved}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={endTest} className="w-full">
              End Test Early
            </Button>
          </CardFooter>
        </Card>
      )}

      {stage === "results" && results && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Analysis of your multitasking performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Test Completed Successfully</AlertTitle>
              <AlertDescription>
                Your multitasking data has been analyzed and added to your fatigue profile.
              </AlertDescription>
            </Alert>

            <div className="text-center p-6 bg-muted rounded-lg">
              <h3 className="text-3xl font-bold">{results.score}</h3>
              <p className="text-muted-foreground">Total Score</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="text-2xl font-bold">{results.targetsClicked}</h3>
                <p className="text-muted-foreground">Targets Clicked</p>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="text-2xl font-bold">{results.equationsSolved}</h3>
                <p className="text-muted-foreground">Equations Solved</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Equation Accuracy:</span>
                <span className="font-medium">{results.accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span>Average Reaction Time:</span>
                <span className="font-medium">{results.averageReactionTime} ms</span>
              </div>
              <div className="flex justify-between">
                <span>Multitasking Index:</span>
                <span className="font-medium">{results.multitaskingIndex}</span>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Interpretation</h3>
              <p className="text-sm">
                Multitasking requires dividing attention between competing tasks. A lower score compared to your
                baseline may indicate cognitive fatigue.
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

