import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import fetch from "node-fetch"

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), "data")
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { userId } = data

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    const userDir = path.join(dataDir, userId)

    if (!fs.existsSync(userDir)) {
      return NextResponse.json({ error: "No test results found for this user" }, { status: 404 })
    }

    // Check if we have test data
    const jsonFiles = fs.readdirSync(userDir).filter((file) => file.endsWith(".json"))

    if (jsonFiles.length < 1) {
      return NextResponse.json({ error: "Not enough test data to make a prediction" }, { status: 400 })
    }

    // Extract features from test results
    const testResults: Record<string, any> = {}
    
    for (const file of jsonFiles) {
      const testType = path.basename(file, ".json")
      const data = JSON.parse(fs.readFileSync(path.join(userDir, file), "utf8"))
      testResults[testType] = data
    }
    
    // Extract required features for fatigue prediction
    const features = {
      Multitasking_Index: testResults.multitasking?.multitaskingIndex || 50,
      Fastest_Reaction: testResults.reaction?.fastestReaction || 200,
      Math_Response_Time: testResults.math?.averageResponseTime || 5,
      Typing_Accuracy: testResults.typing?.accuracy || 90,
      Equation_Accuracy: testResults.math?.accuracy || 80
    }

    // Send features to Flask backend for prediction
    try {
      const flaskResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://cognitive-fatigue-detection.onrender.com'}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(features),
      })

      if (!flaskResponse.ok) {
        throw new Error(`Flask API error: ${flaskResponse.statusText}`)
      }

      const prediction = await flaskResponse.json()

      // Save prediction
      const outputPath = path.join(userDir, "prediction.json")
      if (typeof prediction === 'object' && prediction !== null) {
        fs.writeFileSync(outputPath, JSON.stringify({
          ...prediction,
          timestamp: new Date().toISOString()
        }, null, 2))
      } else {
        console.error("Prediction is not an object:", prediction);
      }

      if (typeof prediction === 'object' && prediction !== null) {
        return NextResponse.json({
          ...prediction,
          timestamp: new Date().toISOString()
        })
      } else {
        console.error("Prediction is not an object:", prediction);
        return NextResponse.json({ error: "Invalid prediction format" }, { status: 500 });
      }
    } catch (error) {
      console.error("Error calling Flask backend:", error)
      return NextResponse.json({ error: "Failed to get prediction from ML model" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error predicting fatigue:", error)
    return NextResponse.json({ error: "Failed to predict fatigue level" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    const userDir = path.join(dataDir, userId)
    const predictionPath = path.join(userDir, "prediction.json")

    if (!fs.existsSync(predictionPath)) {
      return NextResponse.json({ error: "No prediction available for this user" }, { status: 404 })
    }

    const prediction = JSON.parse(fs.readFileSync(predictionPath, "utf8"))
    return NextResponse.json(prediction)
  } catch (error) {
    console.error("Error retrieving fatigue prediction:", error)
    return NextResponse.json({ error: "Failed to retrieve fatigue prediction" }, { status: 500 })
  }
}

