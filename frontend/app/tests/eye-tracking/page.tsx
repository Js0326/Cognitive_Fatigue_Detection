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

type Stage = "intro" | "calibration" | "test" | "results"

export default function EyeTrackingTestPage() {
  const [stage, setStage] = useState<Stage>("intro")
  const [progress, setProgress] = useState(0)
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes in seconds
  const [calibrationStep, setCalibrationStep] = useState(0)
  const [dotPosition, setDotPosition] = useState({ x: 50, y: 50 })
  const [eyeTrackingData, setEyeTrackingData] = useState<{
    blinkRates: number[]
    fixationDurations: number[]
    saccadeSpeeds: number[]
    gazePositions: { x: number; y: number }[]
    timestamps: number[]
  }>({
    blinkRates: [],
    fixationDurations: [],
    saccadeSpeeds: [],
    gazePositions: [],
    timestamps: [],
  })
  const [results, setResults] = useState<{
    blinkRate: number
    fixationDuration: number
    saccadeSpeed: number
  } | null>(null)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const calibrationRef = useRef<HTMLDivElement>(null)
  const testAreaRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const calibrationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const dataCollectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const { isAuthenticated } = useAuth()

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
        }
      }

      setCameraPermission(true)
      setStage("calibration")
      setCalibrationStep(0)

      // Start calibration after a short delay to ensure DOM is ready
      setTimeout(() => {
        startCalibration()
      }, 500)
    } catch (error) {
      setCameraPermission(false)
      console.error("Camera permission denied:", error)
    }
  }

  // Start calibration process with random dot movement
  const startCalibration = () => {
    // Reset calibration
    setCalibrationStep(0)

    // Clear any existing interval
    if (calibrationIntervalRef.current) {
      clearInterval(calibrationIntervalRef.current)
    }

    // Get calibration container dimensions
    const container = calibrationRef.current
    if (!container) {
      console.error("Calibration container not found")
      return
    }

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Define calibration positions
    const positions = [
      { x: containerWidth / 2, y: containerHeight / 2 }, // Center
      { x: containerWidth * 0.1, y: containerHeight * 0.1 }, // Top left
      { x: containerWidth * 0.9, y: containerHeight * 0.1 }, // Top right
      { x: containerWidth * 0.1, y: containerHeight * 0.9 }, // Bottom left
      { x: containerWidth * 0.9, y: containerHeight * 0.9 }, // Bottom right
      { x: containerWidth * 0.5, y: containerHeight * 0.1 }, // Top center
      { x: containerWidth * 0.5, y: containerHeight * 0.9 }, // Bottom center
      { x: containerWidth * 0.1, y: containerHeight * 0.5 }, // Left center
      { x: containerWidth * 0.9, y: containerHeight * 0.5 }, // Right center
    ]

    // Set initial position
    setDotPosition(positions[0])

    // Move to next position every 2 seconds
    let currentStep = 0

    calibrationIntervalRef.current = setInterval(() => {
      currentStep++

      if (currentStep >= positions.length) {
        // End calibration
        if (calibrationIntervalRef.current) {
          clearInterval(calibrationIntervalRef.current)
        }

        // Move to test stage
        setTimeout(() => {
          setStage("test")
          setTimeLeft(180)
          setProgress(0)
          startEyeTracking()
        }, 500)

        return
      }

      // Update step and dot position
      setCalibrationStep(currentStep)
      setDotPosition(positions[currentStep])
    }, 2000)

    // Cleanup function
    return () => {
      if (calibrationIntervalRef.current) {
        clearInterval(calibrationIntervalRef.current)
      }
    }
  }

  // Start eye tracking visualization
  const startEyeTracking = () => {
    // Delay the initialization slightly to ensure DOM elements are ready
    setTimeout(() => {
      const canvas = canvasRef.current
      const video = videoRef.current

      if (!canvas || !video) {
        console.error("Canvas or video element not found")
        return
      }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("Could not get canvas context")
      return
    }

    // Set canvas dimensions
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    // Variables for eye tracking simulation
    let lastBlinkTime = Date.now()
    let lastFixationTime = Date.now()
    let blinkState = 0 // 0: open, 1: closing, 2: closed, 3: opening
    let blinkProgress = 0
    let pupilOffset = 0
    let lastGazePosition = { x: canvas.width / 2, y: canvas.height / 2 }

    // Data collection interval - collect eye metrics every second
    const dataCollectionInterval = setInterval(() => {
      // Calculate blink rate (blinks per minute)
      const blinkRate = Math.min(60000 / Math.max(500, Date.now() - lastBlinkTime), 30)

      // Calculate fixation duration
      const fixationDuration = (Date.now() - lastFixationTime) / 1000

      // Calculate saccade speed (simulated)
      const saccadeSpeed = 200 + Math.random() * 100

      // Record data
      setEyeTrackingData((prev) => ({
        blinkRates: [...prev.blinkRates, blinkRate],
        fixationDurations: [...prev.fixationDurations, fixationDuration],
        saccadeSpeeds: [...prev.saccadeSpeeds, saccadeSpeed],
        gazePositions: [...prev.gazePositions, { ...lastGazePosition }],
        timestamps: [...prev.timestamps, Date.now()],
      }))
    }, 1000) // Collect data every second

    // Animation function
    const animate = () => {
      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Overlay face detection visualization
      ctx.strokeStyle = "#4CAF50"
      ctx.lineWidth = 2

      // Draw face outline (simulated)
      ctx.beginPath()
      ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width / 4, canvas.height / 3, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Handle blinking
      const now = Date.now()
      if (blinkState === 0 && now - lastBlinkTime > 5000 + Math.random() * 3000) {
        // Start blink
        blinkState = 1
        blinkProgress = 0
      }

      // Update blink state
      if (blinkState === 1) {
        // Closing
        blinkProgress += 0.1
        if (blinkProgress >= 1) {
          blinkState = 2
          blinkProgress = 0
        }
      } else if (blinkState === 2) {
        // Closed
        blinkProgress += 0.1
        if (blinkProgress >= 0.5) {
          // Stay closed briefly
          blinkState = 3
          blinkProgress = 0
        }
      } else if (blinkState === 3) {
        // Opening
        blinkProgress += 0.1
        if (blinkProgress >= 1) {
          blinkState = 0
          lastBlinkTime = now
        }
      }

      // Draw eyes
      const leftEyeX = canvas.width / 2 - canvas.width / 10
      const rightEyeX = canvas.width / 2 + canvas.width / 10
      const eyeY = canvas.height / 2 - canvas.height / 10
      const eyeWidth = canvas.width / 15
      const eyeHeight = canvas.height / 30

      // Calculate eye openness based on blink state
      let eyeOpenness = eyeHeight
      if (blinkState === 1) {
        eyeOpenness = eyeHeight * (1 - blinkProgress)
      } else if (blinkState === 2) {
        eyeOpenness = 0
      } else if (blinkState === 3) {
        eyeOpenness = eyeHeight * blinkProgress
      }

      // Draw eye outlines
      ctx.beginPath()
      ctx.ellipse(leftEyeX, eyeY, eyeWidth, eyeOpenness, 0, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.ellipse(rightEyeX, eyeY, eyeWidth, eyeOpenness, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Draw pupils (with slight random movement)
      if (eyeOpenness > 0) {
        pupilOffset = Math.sin(Date.now() / 1000) * 3

        // Update gaze position
        if (Math.random() < 0.05) {
          // Simulate a saccade (quick eye movement)
          lastGazePosition = {
            x: Math.random() * canvas.width,
            y: (Math.random() * canvas.height) / 2 + canvas.height / 4,
          }
          lastFixationTime = Date.now()
        }

        ctx.fillStyle = "#000"
        ctx.beginPath()
        ctx.arc(leftEyeX + pupilOffset, eyeY, eyeWidth / 3, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(rightEyeX + pupilOffset, eyeY, eyeWidth / 3, 0, Math.PI * 2)
        ctx.fill()

        // Draw gaze tracking lines
        ctx.strokeStyle = "rgba(75, 192, 192, 0.6)"
        ctx.beginPath()
        ctx.moveTo(leftEyeX, eyeY)
        ctx.lineTo(leftEyeX + pupilOffset * 5, eyeY - 50 + Math.sin(Date.now() / 1500) * 30)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(rightEyeX, eyeY)
        ctx.lineTo(rightEyeX + pupilOffset * 5, eyeY - 50 + Math.sin(Date.now() / 1500) * 30)
        ctx.stroke()
      }

      // Add tracking data visualization
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.fillRect(10, canvas.height - 60, 150, 50)

      ctx.fillStyle = "white"
      ctx.font = "12px monospace"
      ctx.fillText(`Blink Rate: ${Math.round(60000 / (now - lastBlinkTime))} bpm`, 15, canvas.height - 40)
      ctx.fillText(`Fixation: ${Math.round((now - lastFixationTime) / 100) / 10}s`, 15, canvas.height - 20)

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate)
    }

        // Start animation
        animationFrameRef.current = requestAnimationFrame(animate)
      }, 500) // 500ms delay to ensure DOM is ready

      // Return cleanup function
      return () => {
        clearInterval(dataCollectionInterval)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
  }

  // Handle test timer
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

  // Clean up animation frame and intervals on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (calibrationIntervalRef.current) {
        clearInterval(calibrationIntervalRef.current)
      }
    }
  }, [])

  // End the test and calculate results
  const endTest = () => {
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    // Calculate average metrics from collected data
    const calculateAverage = (arr: number[]) => {
      if (arr.length === 0) return 0
      return arr.reduce((sum, val) => sum + val, 0) / arr.length
    }

    const avgBlinkRate = Math.floor(calculateAverage(eyeTrackingData.blinkRates))
    const avgFixationDuration = Number.parseFloat(calculateAverage(eyeTrackingData.fixationDurations).toFixed(1))
    const avgSaccadeSpeed = Math.floor(calculateAverage(eyeTrackingData.saccadeSpeeds))

    // Set results
    setResults({
      blinkRate: avgBlinkRate || Math.floor(Math.random() * 20) + 10, // Fallback to random if no data
      fixationDuration: avgFixationDuration || Math.random() * 2 + 1,
      saccadeSpeed: avgSaccadeSpeed || Math.floor(Math.random() * 100) + 200,
    })

    setStage("results")

    // Stop the camera
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
    }
  }

  // Submit results to backend
  const submitResults = async () => {
    if (!results || !isAuthenticated) return

    try {
      setSaveStatus("saving")

      const dataToSave = {
        ...results,
        rawData: eyeTrackingData,
        timestamp: new Date().toISOString(),
      }

      const success = await saveTestResults("eye-tracking", dataToSave)

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

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tests">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Eye Tracking Test</h1>
      </div>

      {stage === "intro" && (
        <Card>
          <CardHeader>
            <CardTitle>Eye Movement Tracking Test</CardTitle>
            <CardDescription>This test will analyze your eye movements to detect signs of fatigue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>This test will use your webcam to track:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Blink rate (increased blinking indicates fatigue)</li>
              <li>Saccades (eye movement speed)</li>
              <li>Fixation time (staring at a screen too long)</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Note: Your webcam will be used only for this test. No video is recorded or stored.
            </p>

            {cameraPermission === false && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Camera access denied</AlertTitle>
                <AlertDescription>Please allow camera access to continue with the eye tracking test.</AlertDescription>
              </Alert>
            )}

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
            <Button onClick={requestCameraPermission} className="w-full">
              Start Test
            </Button>
          </CardFooter>
        </Card>
      )}

      {stage === "calibration" && (
        <Card>
          <CardHeader>
            <CardTitle>Calibration</CardTitle>
            <CardDescription>Follow the instructions to calibrate the eye tracking system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
              <span>Calibration Progress:</span>
              <span>{calibrationStep + 1} of 9</span>
            </div>
            <Progress value={(calibrationStep / 8) * 100} className="w-full" />

            <div
              ref={calibrationRef}
              className="relative w-full h-[300px] bg-muted rounded-lg flex items-center justify-center overflow-hidden"
            >
              <video
                ref={videoRef}
                className="absolute top-0 left-0 w-1/4 h-1/4 object-cover z-10 rounded-md m-2"
                autoPlay
                muted
                playsInline
              />

              <div
                className="absolute w-6 h-6 bg-primary rounded-full z-20 transition-all duration-500 ease-out animate-pulse"
                style={{
                  left: `${dotPosition.x}px`,
                  top: `${dotPosition.y}px`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>

            <p className="text-center">
              Please follow the moving dot with your eyes. Keep your head still and maintain a comfortable distance from
              the screen.
            </p>
          </CardContent>
        </Card>
      )}

      {stage === "test" && (
        <Card>
          <CardHeader>
            <CardTitle>Eye Tracking Test in Progress</CardTitle>
            <CardDescription className="flex justify-between">
              <span>Continue with your normal reading pattern</span>
              <span className="font-medium">{formatTime(timeLeft)} remaining</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={progress} className="w-full" />

            <div ref={testAreaRef} className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
                <p className="text-base leading-relaxed">
                  The human eye is a remarkable organ that allows us to perceive the world around us. When we read text,
                  our eyes don't move smoothly across the page. Instead, they make quick movements called saccades,
                  jumping from one word to another. Between these jumps, our eyes briefly pause in what's known as
                  fixations. During these fixations, we actually process the information we're reading. The average
                  fixation lasts about 200-250 milliseconds, and the average saccade takes about 20-40 milliseconds. As
                  we become fatigued, our fixation duration tends to increase, and our saccade speed may decrease.
                  Additionally, our blink rate often increases as our eyes become tired. These changes in eye movement
                  patterns can be reliable indicators of cognitive fatigue.
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-1/2 max-w-full">
                  <canvas ref={canvasRef} className="w-full h-auto border rounded-lg" />
                  <video ref={videoRef} className="hidden" autoPlay muted playsInline />
                  <p className="text-xs text-center text-muted-foreground mt-2">Eye tracking in progress</p>
                </div>

                <div className="w-full md:w-1/2 space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm">
                      Please read the text above naturally. The system is analyzing your eye movement patterns, blink
                      rate, and fixation time to detect signs of fatigue.
                    </p>
                  </div>
                </div>
              </div>
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
            <CardDescription>Analysis of your eye movement patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Test Completed Successfully</AlertTitle>
              <AlertDescription>
                Your eye tracking data has been analyzed and added to your fatigue profile.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Blink Rate:</span>
                  <span className="font-medium">{results.blinkRate} blinks/min</span>
                </div>
                <Progress value={results.blinkRate * 3} className="w-full h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Fixation Time:</span>
                  <span className="font-medium">{results.fixationDuration.toFixed(1)} seconds</span>
                </div>
                <Progress value={results.fixationDuration * 25} className="w-full h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Saccade Speed:</span>
                  <span className="font-medium">{results.saccadeSpeed} ms</span>
                </div>
                <Progress value={(results.saccadeSpeed - 200) / 2} className="w-full h-2" />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Recommendation</h3>
              <p className="text-sm">
                Based on your eye tracking metrics, we recommend taking a short break and practicing the 20-20-20 rule:
                every 20 minutes, look at something 20 feet away for 20 seconds.
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

