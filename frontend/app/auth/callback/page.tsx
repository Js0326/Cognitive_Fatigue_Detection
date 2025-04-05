"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

export default function AuthCallbackPage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const router = useRouter()
  const { checkVerification } = useAuth()

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get the auth code from the URL
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')

        if (!code) {
          setVerificationStatus('error')
          return
        }

        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.error('Error verifying email:', error.message)
          setVerificationStatus('error')
          return
        }

        // Check if the user is now verified
        const isVerified = await checkVerification()
        
        if (isVerified) {
          setVerificationStatus('success')
        } else {
          setVerificationStatus('error')
        }
      } catch (err) {
        console.error('Unexpected error during verification:', err)
        setVerificationStatus('error')
      }
    }

    handleEmailVerification()
  }, [])

  const handleContinue = () => {
    router.push('/dashboard')
  }

  const handleRetry = () => {
    router.push('/login')
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
            <CardTitle>
              {verificationStatus === 'loading' && 'Verifying Email...'}
              {verificationStatus === 'success' && 'Email Verified!'}
              {verificationStatus === 'error' && 'Verification Failed'}
            </CardTitle>
            <CardDescription>
              {verificationStatus === 'loading' && 'Please wait while we verify your email address.'}
              {verificationStatus === 'success' && 'Your email has been successfully verified.'}
              {verificationStatus === 'error' && 'We could not verify your email address. Please try again.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            {verificationStatus === 'loading' && (
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            )}
            
            {verificationStatus === 'success' && (
              <>
                <CheckCircle className="w-16 h-16 text-green-500" />
                <Button onClick={handleContinue} className="w-full">Continue to Dashboard</Button>
              </>
            )}
            
            {verificationStatus === 'error' && (
              <>
                <XCircle className="w-16 h-16 text-red-500" />
                <Button onClick={handleRetry} className="w-full">Return to Login</Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}