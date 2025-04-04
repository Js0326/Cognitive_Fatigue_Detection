import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), "data")
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { testType, userId, results } = data

    if (!testType || !userId || !results) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create user directory if it doesn't exist
    const userDir = path.join(dataDir, userId)
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true })
    }

    // Save results as JSON (we'll convert to pickle in Python)
    const jsonFilePath = path.join(userDir, `${testType}.json`)
    fs.writeFileSync(jsonFilePath, JSON.stringify(results, null, 2))

    // Call Python script to convert JSON to pickle
    await execAsync(`python -c "
import json
import pickle
import os

# Load JSON data
with open('${jsonFilePath.replace(/\\/g, "\\\\")}', 'r') as f:
    data = json.load(f)

# Save as pickle
with open('${jsonFilePath.replace(/\\/g, "\\\\")}'.replace('.json', '.pkl'), 'wb') as f:
    pickle.dump(data, f)
"`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving test results:", error)
    return NextResponse.json({ error: "Failed to save test results" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const testType = searchParams.get("testType")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    const userDir = path.join(dataDir, userId)

    // If testType is specified, return only that test's results
    if (testType) {
      const jsonFilePath = path.join(userDir, `${testType}.json`)

      if (!fs.existsSync(jsonFilePath)) {
        return NextResponse.json({ error: `No results found for test: ${testType}` }, { status: 404 })
      }

      const data = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"))
      return NextResponse.json(data)
    }

    // Otherwise, return all test results
    if (!fs.existsSync(userDir)) {
      return NextResponse.json({ error: "No test results found for this user" }, { status: 404 })
    }

    const files = fs.readdirSync(userDir).filter((file) => file.endsWith(".json"))
    const results: Record<string, any> = {}

    for (const file of files) {
      const testType = path.basename(file, ".json")
      const data = JSON.parse(fs.readFileSync(path.join(userDir, file), "utf8"))
      results[testType] = data
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error retrieving test results:", error)
    return NextResponse.json({ error: "Failed to retrieve test results" }, { status: 500 })
  }
}

