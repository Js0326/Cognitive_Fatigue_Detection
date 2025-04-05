"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { FatigueScoreGauge } from "@/components/fatigue-score-gauge"
import { getFatiguePrediction, getTestResults } from "@/lib/test-utils"
import { useAuth } from "@/lib/auth"
import { FatigueAlerts } from "@/components/fatigue-alerts"
import { TestResultsPanel } from "@/components/test-results-panel"
import { FatigueTrendsChart } from "@/components/fatigue-trends-chart"
import { TestPerformanceChart } from "@/components/test-performance-chart"
import { ActivityBreakdown } from "@/components/activity-breakdown"
import { MissingFeaturesAlert } from "@/components/missing-features-alert"
import { FeatureTestMapping } from "@/lib/feature-test-mapping"

interface FatigueData {
  score: number
  level: string
  confidence: number
  timestamp: string
}

interface FatiguePrediction {
  fatigue_score: number
  fatigue_level: string
  confidence: number
  timestamp: string | number
  missingFeatures?: FeatureTestMapping[]
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [fatigueData, setFatigueData] = useState<FatigueData | null>(null)
  const [testResults, setTestResults] = useState<Record<string, any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [completedTests, setCompletedTests] = useState<string[]>([])
  const [missingFeatures, setMissingFeatures] = useState<FeatureTestMapping[]>([])
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        if (!isAuthenticated) {
          setError("Please log in to view your dashboard")
          setLoading(false)
          return
        }

        // Get completed tests
        const results = await getTestResults()
        const tests = results ? Object.keys(results) : []
        setCompletedTests(tests)
        setTestResults(results)

        // Get fatigue prediction if we have test results
        if (tests.length > 0) {
          const prediction = await getFatiguePrediction() as FatiguePrediction | null

          if (prediction) {
            if (prediction.missingFeatures) {
              setMissingFeatures(prediction.missingFeatures)
            } else {
              setFatigueData({
                score: prediction.fatigue_score,
                level: prediction.fatigue_level,
                confidence: prediction.confidence,
                timestamp: typeof prediction.timestamp === 'number' 
                  ? new Date(prediction.timestamp * 1000).toISOString() 
                  : prediction.timestamp,
              })
            }
          } else {
            setError("Failed to get fatigue prediction. Please try again later.")
          }
        }

        setLoading(false)
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated])

  // Format date for display
  const formatDate = (dateString: string | number) => {
    try {
      // If it's a number (Unix timestamp), convert it to milliseconds
      if (typeof dateString === 'number') {
        return new Date(dateString * 1000).toLocaleString();
      }
      
      // Otherwise, try to parse the date string
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return new Date().toLocaleString(); // Fall back to current date if invalid
      }
      
      return date.toLocaleString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return new Date().toLocaleString(); // Fall back to current date on error
    }
  }

  // Get level class for coloring
  const getLevelClass = (level: string) => {
    switch (level) {
      case "Low":
        return "text-green-500"
      case "Moderate":
        return "text-amber-500"
      case "High":
        return "text-orange-500"
      case "Severe":
        return "text-red-500"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cognitive Fatigue Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your fatigue levels, test results, and get personalized recommendations
          </p>
        </div>
        <Button asChild>
          <Link href="/tests">
            Take Fatigue Test <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {!isAuthenticated && (
        <Alert>
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please{" "}
            <Link href="/login" className="font-medium underline">
              log in
            </Link>{" "}
            or{" "}
            <Link href="/signup" className="font-medium underline">
              sign up
            </Link>{" "}
            to view your dashboard and track your cognitive fatigue.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {completedTests.length === 0 && isAuthenticated && !loading && !error && (
        <Alert>
          <AlertTitle>No Test Data Available</AlertTitle>
          <AlertDescription>
            You haven't completed any tests yet.{" "}
            <Link href="/tests" className="font-medium underline text-blue-500">
              Take a test
            </Link>{" "}
            to start monitoring your cognitive fatigue.
          </AlertDescription>
        </Alert>
      )}

      {missingFeatures.length > 0 && (
        <MissingFeaturesAlert missingFeatures={missingFeatures} />
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Real-Time Fatigue Score Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle>Real-Time Fatigue Score</CardTitle>
                <CardDescription>Current cognitive fatigue level</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                {fatigueData ? (
                  <>
                    <FatigueScoreGauge value={fatigueData.score} />
                    <div className="mt-4 text-center">
                      <div className="text-sm text-muted-foreground">
                        Last updated: {formatDate(fatigueData.timestamp)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Confidence: {Math.round(fatigueData.confidence * 100)}%
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl font-bold mb-2">--</div>
                    <div className="text-sm text-muted-foreground">No data available</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle>Fatigue Alerts & Recommendations</CardTitle>
                <CardDescription>Personalized suggestions based on your fatigue level</CardDescription>
              </CardHeader>
              <CardContent className="py-6">
                {fatigueData ? (
                  <FatigueAlerts level={fatigueData.level} score={fatigueData.score} />
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    Complete at least one test to receive personalized recommendations
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Latest Test Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>Latest Test Results</CardTitle>
              <CardDescription>Most recent performance on cognitive tests</CardDescription>
            </CardHeader>
            <CardContent>
              {testResults ? (
                <TestResultsPanel testResults={testResults} />
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No test results available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trends & Graphs Section */}
          <Tabs defaultValue="fatigue-trends">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Trends & Graphs</h2>
              <TabsList>
                <TabsTrigger value="fatigue-trends">Fatigue Trends</TabsTrigger>
                <TabsTrigger value="test-performance">Test Performance</TabsTrigger>
                <TabsTrigger value="activity-breakdown">Activity Breakdown</TabsTrigger>
              </TabsList>
            </div>

            <Card>
              <CardContent className="pt-6">
                <TabsContent value="fatigue-trends">
                  <FatigueTrendsChart />
                </TabsContent>

                <TabsContent value="test-performance">
                  <TestPerformanceChart testResults={testResults} />
                </TabsContent>

                <TabsContent value="activity-breakdown">
                  <ActivityBreakdown />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60 mt-1" />
          </CardHeader>
          <CardContent className="py-6">
            <div className="flex flex-col items-center">
              <Skeleton className="h-48 w-48 rounded-full" />
              <Skeleton className="h-4 w-32 mt-4" />
              <Skeleton className="h-4 w-24 mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60 mt-1" />
          </CardHeader>
          <CardContent className="py-6">
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>

      <div>
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-64" />
        </div>

        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
