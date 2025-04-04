import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FeatureTestMapping } from "@/lib/feature-test-mapping"
import Link from "next/link"

interface MissingFeaturesAlertProps {
  missingFeatures: FeatureTestMapping[]
}

export function MissingFeaturesAlert({ missingFeatures }: MissingFeaturesAlertProps) {
  // Group tests by test type to avoid duplicates
  const uniqueTests = Array.from(new Set(missingFeatures.map(f => f.test)))
  
  if (missingFeatures.length === 0) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTitle>Missing Required Data</AlertTitle>
      <AlertDescription className="mt-4">
        <p className="mb-4">To calculate your fatigue score, we need data from the following tests:</p>
        <div className="space-y-4">
          {uniqueTests.map(test => (
            <Card key={test} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">
                    {missingFeatures.find(f => f.test === test)?.description}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Required for: {missingFeatures
                      .filter(f => f.test === test)
                      .map(f => f.feature.replace(/_/g, " "))
                      .join(", ")}
                  </p>
                </div>
                <Link href={`/tests/${test}`}>
                  <Button variant="secondary">Take Test</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  )
}
