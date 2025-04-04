"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Camera, Eye, AlertCircle, CheckCircle } from "lucide-react"

interface EyeTrackingTestProps {
  onComplete?: (data: any) => void
  onError?: (error: Error) => void
}

export function EyeTrackingTest({ onComplete, onError }: EyeTrackingTestProps) {
  const [status, setStatus] = useState<'idle' | 'permission' | 'running' | 'completed' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [mode, setMode] = useState<'test' | 'continuous'>('test')
  const [duration, setDuration] = useState(30) // seconds
  const [continuousMonitoring, setContinuousMonitoring] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraMissing, setCameraMissing] = useState(false)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const apiServiceRef = useRef<any>(null)
  const videoStreamRef = useRef<MediaStream | null>(null)
  
  // Load API service
  useEffect(() => {
    const loadApiService = async () => {
      try {
        const { default: apiService } = await import('@/lib/api-service')
        apiServiceRef.current = apiService
      } catch (error) {
        console.error('Failed to load API service:', error)
      }
    }
    
    loadApiService()
    
    return () => {
      // Clean up timer if component unmounts
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      // Release the camera stream if still active
      releaseCamera()
    }
  }, [])
  
  // Release camera function to ensure proper cleanup
  const releaseCamera = () => {
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach(track => track.stop())
      videoStreamRef.current = null
      setCameraActive(false)
    }
  }
  
  // Function to periodically check if camera is still active
  const monitorCameraStatus = () => {
    const checkInterval = setInterval(() => {
      if (videoStreamRef.current) {
        const isActive = videoStreamRef.current.getTracks().some(track => track.readyState === 'live')
        setCameraActive(isActive)
        if (!isActive) {
          setCameraMissing(true)
        }
      } else {
        setCameraActive(false)
      }
    }, 1000)
    
    return () => clearInterval(checkInterval)
  }
  
  // Request camera permission
  const requestPermission = async () => {
    setStatus('permission')
    setCameraMissing(false)
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      })
      
      // Store the stream for later use
      videoStreamRef.current = stream
      setPermissionGranted(true)
      setCameraActive(true)
      
      // Start monitoring camera status
      monitorCameraStatus()
      
      setStatus('idle')
    } catch (error) {
      console.error('Permission denied or camera not available:', error)
      setCameraActive(false)
      setStatus('error')
      if (onError) onError(new Error('Camera permission denied'))
    }
  }
  
  // Start the eye tracking test
  const startTest = async () => {
    if (!permissionGranted || !videoStreamRef.current) {
      await requestPermission()
      return
    }
    
    // Check if camera is still active
    const isActive = videoStreamRef.current.getTracks().some(track => track.readyState === 'live')
    
    if (!isActive) {
      // Camera became inactive, try to request it again
      await requestPermission()
      return
    }
    
    setStatus('running')
    setProgress(0)
    setResults(null)
    setCameraMissing(false)
    
    // Start progress timer
    const startTime = Date.now()
    const totalDuration = duration * 1000 // convert to ms
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const percentage = Math.min(100, (elapsed / totalDuration) * 100)
      setProgress(percentage)
      
      // Also check if camera is still active
      if (videoStreamRef.current) {
        const isStillActive = videoStreamRef.current.getTracks().some(track => track.readyState === 'live')
        if (!isStillActive) {
          setCameraActive(false)
          setCameraMissing(true)
        }
      }
      
      if (elapsed >= totalDuration) {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }, 100)
    
    try {
      if (!cameraMissing && apiServiceRef.current) {
        const success = await apiServiceRef.current.startEyeTracking({
          mode,
          duration
        })
        
        if (success) {
          // Fetch the results
          try {
            const data = await apiServiceRef.current.getFatigueData()
            
            // Avoid using data if camera was lost during the test
            if (!cameraMissing) {
              setResults(data)
              if (onComplete) onComplete(data)
            } else {
              setStatus('error')
              if (onError) onError(new Error('Camera connection lost during test'))
              return
            }
            
            setStatus('completed')
          } catch (error) {
            console.error('Failed to get results:', error)
            setStatus('error')
            if (onError) onError(new Error('Failed to get results'))
          }
        } else {
          setStatus('error')
          if (onError) onError(new Error('Eye tracking failed'))
        }
      } else {
        setStatus('error')
        if (onError) onError(new Error('Camera unavailable or API service not initialized'))
      }
    } catch (error) {
      console.error('Eye tracking error:', error)
      setStatus('error')
      if (onError) onError(error instanceof Error ? error : new Error('Unknown error'))
    } finally {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }
  
  // Toggle continuous monitoring
  const toggleContinuousMonitoring = (enabled: boolean) => {
    setContinuousMonitoring(enabled)
    setMode(enabled ? 'continuous' : 'test')
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Eye Tracking Test</CardTitle>
        <CardDescription>
          Measures your blink rate, fixation duration, and saccade speed to detect fatigue
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {cameraMissing && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Camera Disconnected</AlertTitle>
            <AlertDescription>
              The camera was disconnected or access was lost. Please grant camera permission again.
            </AlertDescription>
          </Alert>
        )}
        
        {status === 'idle' && !permissionGranted && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Camera Permission Required</AlertTitle>
            <AlertDescription>
              We need access to your camera to analyze eye movements.
              Your data remains private and is not stored permanently.
            </AlertDescription>
          </Alert>
        )}
        
        {status === 'idle' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="continuous-mode"
                checked={continuousMonitoring}
                onCheckedChange={toggleContinuousMonitoring}
              />
              <Label htmlFor="continuous-mode">
                Enable continuous monitoring
              </Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Test Duration (seconds)</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="duration"
                  min={10}
                  max={60}
                  step={5}
                  value={[duration]}
                  onValueChange={(value) => setDuration(value[0])}
                  disabled={continuousMonitoring}
                />
                <span className="w-12 text-center">{duration}s</span>
              </div>
            </div>
            
            {permissionGranted && cameraActive ? (
              <Button onClick={startTest} className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                {continuousMonitoring ? "Start Continuous Monitoring" : "Start Eye Test"}
              </Button>
            ) : (
              <Button onClick={requestPermission} className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                {permissionGranted ? "Reconnect Camera" : "Grant Camera Permission"}
              </Button>
            )}
          </div>
        )}
        
        {status === 'permission' && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Requesting camera permission...</p>
          </div>
        )}
        
        {status === 'running' && (
          <div className="space-y-4">
            <Progress value={progress} className="w-full h-2" />
            <p className="text-center">
              {continuousMonitoring ? 
                "Continuously monitoring eye movements..." : 
                `Eye test in progress (${Math.round((duration * progress) / 100)} of ${duration} seconds)`
              }
            </p>
            
            {cameraMissing ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Camera Unavailable</AlertTitle>
                <AlertDescription>
                  The camera has been disconnected. The test will continue, but no eye data will be collected.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="animate-pulse flex justify-center">
                  <Eye className="h-12 w-12 text-primary" />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Please look at the camera and follow any on-screen instructions.
                  <br />
                  Read the text naturally while the camera tracks your eye movements.
                </p>
              </>
            )}
          </div>
        )}
        
        {status === 'completed' && results && !cameraMissing && (
          <div className="space-y-4">
            <Alert variant="success" className="bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>Test Completed</AlertTitle>
              <AlertDescription>
                Your eye tracking data has been analyzed successfully.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Blink Rate</p>
                <p className="text-xl font-bold mt-1">
                  {results.eye_metrics?.blink_rate ? 
                    `${results.eye_metrics.blink_rate.toFixed(1)}/min` : 
                    '--'}
                </p>
              </div>
              <div className="text-center p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Fixation</p>
                <p className="text-xl font-bold mt-1">
                  {results.eye_metrics?.fixation_duration ? 
                    `${results.eye_metrics.fixation_duration.toFixed(2)}s` : 
                    '--'}
                </p>
              </div>
              <div className="text-center p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Saccade Speed</p>
                <p className="text-xl font-bold mt-1">
                  {results.eye_metrics?.saccade_speed ? 
                    `${results.eye_metrics.saccade_speed}px/s` : 
                    '--'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {status === 'error' || (status === 'completed' && cameraMissing) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Test Failed</AlertTitle>
            <AlertDescription>
              {cameraMissing ? 
                "The camera was disconnected during the test. No valid eye tracking data was collected." : 
                "There was an error running the eye tracking test. Please try again or check your camera."}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter>
        {status === 'completed' && (
          <Button onClick={() => setStatus('idle')} variant="outline" className="w-full">
            Run Another Test
          </Button>
        )}
        
        {status === 'error' && (
          <Button onClick={() => setStatus('idle')} variant="outline" className="w-full">
            Try Again
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

