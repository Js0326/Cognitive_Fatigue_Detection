"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isVerifying } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is not authenticated and not in verification process, redirect to login
    if (!isAuthenticated && !isVerifying) {
      router.push("/login")
    }
    // If user is in verification process, redirect to verification page
    else if (!isAuthenticated && isVerifying) {
      router.push("/verification")
    }
  }, [isAuthenticated, isVerifying, router])

  // Only render children if user is authenticated
  return isAuthenticated ? <>{children}</> : null
}