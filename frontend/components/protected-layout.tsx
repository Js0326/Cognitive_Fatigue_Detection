"use client"

import { RouteGuard } from "./route-guard"

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <RouteGuard>{children}</RouteGuard>
}