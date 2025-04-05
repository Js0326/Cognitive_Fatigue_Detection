"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { Mail } from "lucide-react"

export default function VerificationPage() {
  const router = useRouter()
  const { isVerifying, checkVerification } = useAuth()

  useEffect(() => {
    // If user is not in verifying state, redirect to login
    if (!isVerifying) {
      router.push('/login')
    }

    // Check verification status periodically
    const checkInterval = setInterval(async () => {
      const isVerified = await checkVerification()
      if (isVerified) {
        router.push('/dashboard')
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(checkInterval)
  }, [isVerifying, router, checkVerification])

  const handleResendEmail = async () => {
    // This would typically call a function to resend the verification email
    // For now, we'll just show an alert
    alert('Verification email resent. Please check your inbox.')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Cognitive Fatigue</h1>
          <p className="text-muted-foreground">Detection System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a verification email to your inbox. Please check your email and click the verification link.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <Mail className="w-16 h-16 text-primary" />
            
            <div className="text-center">
              <p className="mb-4">Didn't receive an email?</p>
              <Button onClick={handleResendEmail} variant="outline">
                Resend Verification Email
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>You can close this page. Once verified, you can log in again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}