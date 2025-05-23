"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Camera, Eye, AlertCircle, CheckCircle } from "lucide-react"

interface EyeTrackingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: (data: any) => void
  onError?: (error: Error) => void
}

export function EyeTrackingDialog({ open, onOpenChange, onComplete, onError }: EyeTrackingDialogProps) {
  const [status, setStatus] = useState<'idle' | 'permission' | 'running' | 'completed' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(30) // seconds
  const [results, setResults] = useState<any>(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [cameraConnected, setCameraConnected] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const apiServiceRef = useRef<any>(null)
  
  // Load API service
  useEffect(() => {
    const loadApiService = async () => {
      try {
        const { default: apiService } = await import('@/lib/api-service')
        apiServiceRef.current = apiService
      } catch (error) {
        console.error('Failed to load API service:', error)
        setErrorMessage('Failed to load API service')
      }
    }
    
    loadApiService()
    
    return () => {
      // Clean up on unmount
      releaseCameraStream()
      stopTestTimer()
    }
  }, [])
  
  // Reset state when dialog is opened
  useEffect(() => {
    if (open) {
      setStatus('idle')
      setProgress(0)
      setResults(null)
      setErrorMessage(null)
      
      // Check if we've previously gotten permission
      if (permissionGranted && !cameraConnected) {
        requestCameraPermission()
      }
    } else {
      // When dialog is closed, release the camera
      releaseCameraStream()
      stopTestTimer()
    }
  }, [open, permissionGranted, cameraConnected])
  
  // Helper functions for cleanup
  const releaseCameraStream = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop())
      cameraStreamRef.current = null
      setCameraConnected(false)
    }
  }
  
  const stopTestTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }
  
  // Request camera permission
  const requestCameraPermission = async () => {
    setStatus('permission')
    
    try {
      // Release any existing stream first
      releaseCameraStream()
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        }
      })
      
      // Store the stream
      cameraStreamRef.current = stream
      
      // If we have a video element, attach the stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      setPermissionGranted(true)
      setCameraConnected(true)
      setErrorMessage(null)
      setStatus('idle')
    } catch (error) {
      console.error('Camera permission denied or camera unavailable:', error)
      setCameraConnected(false)
      setErrorMessage('Camera permission denied or camera unavailable')
      setStatus('error')
      
      if (onError) {
        onError(new Error('Camera permission denied or camera unavailable'))
      }
    }
  }
  
  // Start eye tracking test
  const startTest = async () => {
    if (!permissionGranted || !cameraConnected) {
      await requestCameraPermission()
      return
    }
    
    setStatus('running')
    setProgress(0)
    setResults(null)
    setErrorMessage(null)
    
    // Setup progress timer
    const startTime = Date.now()
    const totalDuration = duration * 1000
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const percentage = Math.min(100, (elapsed / totalDuration) * 100)
      setProgress(percentage)
      
      // Check if camera is still connected
      if (cameraStreamRef.current) {
        const isActive = cameraStreamRef.current.getTracks().some(track => track.readyState === 'live')
        if (!isActive) {
          setCameraConnected(false)
          setErrorMessage('Camera disconnected during test')
          setStatus('error')
          stopTestTimer()
          
          if (onError) {
            onError(new Error('Camera disconnected during test'))
          }
        }
      }
      
      if (elapsed >= totalDuration) {
        stopTestTimer()
        finishTest()
      }
    }, 100)
    
    // Start the eye tracking on the backend
    try {
      if (apiServiceRef.current) {
        await apiServiceRef.current.startEyeTracking({
          mode: 'test',
          duration
        })
      } else {
        throw new Error('API service not initialized')
      }
    } catch (error) {
      console.error('Failed to start eye tracking:', error)
      setErrorMessage('Failed to start eye tracking')
      setStatus('error')
      stopTestTimer()
      
      if (onError) {
        onError(error instanceof Error ? error : new Error('Failed to start eye tracking'))
      }
    }
  }
  
  // Finish the test and fetch results
  const finishTest = async () => {
    try {
      if (apiServiceRef.current) {
        const data = await apiServiceRef.current.getFatigueData()
        
        // Check if we have valid eye metrics
        if (data && data.eye_metrics && 
            (data.eye_metrics.blink_rate !== null || 
             data.eye_metrics.fixation_duration !== null || 
             data.eye_metrics.saccade_speed !== null)) {
          
          setResults(data)
          setStatus('completed')
          
          if (onComplete) {
            onComplete(data)
          }
        } else {
          throw new Error('No valid eye tracking data received')
        }
      } else {
        throw new Error('API service not initialized')
      }
    } catch (error) {
      console.error('Failed to fetch eye tracking results:', error)
      setErrorMessage('Failed to fetch eye tracking results')
      setStatus('error')
      
      if (onError) {
        onError(error instanceof Error ? error : new Error('Failed to fetch eye tracking results'))
      }
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogTitle className="sr-only">Eye Tracking Test</DialogTitle>
        
        <Card className="w-full border-0 shadow-none">
          <CardHeader>
            <CardTitle>Eye Tracking Test</CardTitle>
            <CardDescription>
              Measures your blink rate, fixation duration, and saccade speed to detect fatigue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            {status === 'idle' && (
              <div className="space-y-4">
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
                    />
                    <span className="w-12 text-center">{duration}s</span>
                  </div>
                </div>
                
                {/* Hidden video element to maintain camera access */}
                <video 
                  ref={videoRef}
                  className="hidden"
                  autoPlay
                  playsInline
                  muted
                />
                
                {permissionGranted && cameraConnected ? (
                  <Button onClick={startTest} className="w-full">
                    <Camera className="mr-2 h-4 w-4" />
                    Start Eye Tracking Test
                  </Button>
                ) : (
                  <Button onClick={requestCameraPermission} className="w-full">
                    <Camera className="mr-2 h-4 w-4" />
                    {permissionGranted ? "Reconnect Camera" : "Grant Camera Permission"}
                  </Button>
                )}
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>How it works</AlertTitle>
                  <AlertDescription>
                    This test will display a reading passage. Please read it naturally while the camera tracks your eye movements.
                    Keep your face visible to the camera throughout the test for accurate results.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {status === 'permission' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Requesting camera permission...</p>
              </div>
            )}
            
            {status === 'running' && (
              <div className="space-y-6">
                <Progress value={progress} className="w-full h-2" />
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">Eye Tracking Test in Progress</p>
                  <p>Continue with your normal reading pattern</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.floor((duration * progress) / 100)}:{((duration * progress) / 100 % 1 * 60).toFixed(0).padStart(2, '0')} remaining
                  </p>
                </div>
                
                <div className="bg-slate-800 p-6 rounded-lg">
                  <p className="text-slate-100">
                    The human eye is a remarkable organ that allows us to perceive the world around us. When we read text,
                    our eyes don't move smoothly across the page. Instead, they make quick movements called saccades,
                    jumping from one word to another. Between these jumps, our eyes briefly pause in what's known as
                    fixations. During these fixations, we actually process the information we're reading. The average fixation
                    lasts about 200-250 milliseconds, and the average saccade takes about 20-40 milliseconds. As we
                    become fatigued, our fixation duration tends to increase, and our saccade speed may decrease.
                    Additionally, our blink rate often increases as our eyes become tired. These changes in eye movement
                    patterns can be reliable indicators of cognitive fatigue.
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <div className="relative w-64 h-64">
                    <div className="absolute inset-0 rounded-full border-2 border-green-500"></div>
                    
                    {/* Simplified eye representation */}
                    <div className="absolute top-1/4 left-1/4 w-20 h-12 bg-cyan-200 rounded-full">
                      <div className="absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 bg-black rounded-full"></div>
                    </div>
                    
                    <div className="absolute top-1/4 right-1/4 w-20 h-12 bg-cyan-200 rounded-full">
                      <div className="absolute top-1/2 left-1/2 w-8 h-8 -translate-x-1/2 -translate-y-1/2 bg-black rounded-full"></div>
                    </div>
                    
                    {/* Simple metrics display */}
                    <div className="absolute bottom-2 left-0 w-full text-xs">
                      <div className="flex justify-between">
                        <span>Blink Rate: 47 bpm</span>
                        <span>Fixation: 0.2s</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <Eye className="h-4 w-4" />
                  <AlertTitle>Please read the text above naturally</AlertTitle>
                  <AlertDescription>
                    The system is analyzing your eye movement patterns, blink rate, and fixation time to detect signs of fatigue.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            {status === 'completed' && results && (
              <div className="space-y-6">
                <Alert variant="success" className="bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle>Test Completed</AlertTitle>
                  <AlertDescription>
                    Your eye tracking metrics have been successfully analyzed and saved.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Blink Rate</p>
                    <p className="text-2xl font-bold mt-1">
                      {results.eye_metrics?.blink_rate !== null ? 
                        `${results.eye_metrics.blink_rate.toFixed(1)}/min` : 
                        '--'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {results.eye_metrics?.blink_rate < 15 ? 'Low' : 
                       results.eye_metrics?.blink_rate > 25 ? 'High' : 'Normal'}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Fixation Duration</p>
                    <p className="text-2xl font-bold mt-1">
                      {results.eye_metrics?.fixation_duration !== null ? 
                        `${results.eye_metrics.fixation_duration.toFixed(2)}s` : 
                        '--'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average time your eyes pause on text
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Saccade Speed</p>
                    <p className="text-2xl font-bold mt-1">
                      {results.eye_metrics?.saccade_speed !== null ? 
                        `${results.eye_metrics.saccade_speed}px/s` : 
                        '--'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Speed of eye movements between words
                    </p>
                  </div>
                </div>
                
                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-800">
                  <AlertTitle>Analysis</AlertTitle>
                  <AlertDescription>
                    {results.fatigue_level === 'High' ? 
                      'Your eye metrics indicate high levels of fatigue. Consider taking a break from screen work.' :
                     results.fatigue_level === 'Moderate' ? 
                      'Your eye metrics indicate moderate fatigue. Monitor your symptoms and take regular breaks.' :
                      'Your eye metrics are within normal ranges. No signs of significant eye fatigue detected.'}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-end">
            {status === 'idle' && (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            )}
            
            {status === 'running' && (
              <Button variant="outline" onClick={() => {
                stopTestTimer()
                setStatus('idle')
              }}>
                Stop Test
              </Button>
            )}
            
            {(status === 'completed' || status === 'error') && (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            )}
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
