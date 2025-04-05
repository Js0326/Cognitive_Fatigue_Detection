// Utility functions for test result handling

import { useAuth } from "@/lib/auth"
import { getMissingFeatures } from "./feature-test-mapping"

// Save test results to the server
export async function saveTestResults(testType: string, results: any) {
  try {
    const { user } = useAuth.getState()

    if (!user) {
      console.error("User not authenticated")
      return false
    }

    // Add timestamp to results
    const resultsWithTimestamp = {
      ...results,
      timestamp: new Date().toISOString()
    }

    // Store in localStorage for now (in production this would go to a backend)
    const allResults = JSON.parse(localStorage.getItem('testResults') || '{}')
    allResults[testType] = resultsWithTimestamp
    localStorage.setItem('testResults', JSON.stringify(allResults))

    // After saving results, try to get a new fatigue prediction
    await getFatiguePrediction()

    return true
  } catch (error) {
    console.error("Error saving test results:", error)
    return false
  }
}

// Get test results from the server
export async function getTestResults(testType?: string) {
  try {
    const { user } = useAuth.getState()

    if (!user) {
      console.error("User not authenticated")
      return null
    }

    // Get results from localStorage (in production this would come from a backend)
    const allResults = JSON.parse(localStorage.getItem('testResults') || '{}')

    if (testType) {
      return allResults[testType] || null
    }

    return allResults
  } catch (error) {
    console.error("Error getting test results:", error)
    return null
  }
}

// Get fatigue prediction from the server
export async function getFatiguePrediction() {
  try {
    const { user } = useAuth.getState()

    if (!user) {
      console.error("User not authenticated")
      return null
    }

    // First, get the test results to extract features
    const testResults = await getTestResults()
    
    if (!testResults) {
      console.error("No test results available for prediction")
      return null
    }

    // Check for missing features
    const missingFeatures = getMissingFeatures(testResults)
    if (missingFeatures.length > 0) {
      console.log("Missing features:", missingFeatures.map(f => f.feature))
      return { missingFeatures }
    }
    
    // Extract required features for fatigue prediction
    const features = {
      Multitasking_Index: testResults.multitasking?.score || 50,
      Fastest_Reaction: testResults.reaction?.fastestReaction || 300,
      Math_Response_Time: testResults.math?.averageResponseTime || 5,
      Typing_Accuracy: testResults.typing?.accuracy || 90,
      Equation_Accuracy: testResults.math?.accuracy || 80
    }
    
    console.log("Extracted features for prediction:", features)
    
    // Use the Flask backend URL
    const apiUrl = "http://localhost:5000/predict"
    console.log("Fetching fatigue prediction from:", apiUrl)
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      mode: "cors",
      credentials: "omit",
      body: JSON.stringify(features),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error(`Failed to get fatigue prediction: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Prediction data received:", data)
    return {
      fatigue_score: data.fatigue_score,
      fatigue_level: data.fatigue_level,
      confidence: 0.85,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error("Error getting fatigue prediction:", error)
    return null
  }
}

// Delete all user test data from localStorage
export async function deleteUserData() {
  try {
    const { user } = useAuth.getState()

    if (!user) {
      console.error("User not authenticated")
      return false
    }

    // Remove test results from localStorage
    localStorage.removeItem('testResults')
    
    console.log("User data deleted successfully")
    return true
  } catch (error) {
    console.error("Error deleting user data:", error)
    return false
  }
}

