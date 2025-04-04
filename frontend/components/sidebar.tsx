"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart3, Brain, Home, LogOut, LogIn, Menu, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth"

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Tests",
    href: "/tests",
    icon: Brain,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden absolute top-4 left-4 z-50">
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <div className="h-full flex flex-col">
            <div className="p-6 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Cognitive Fatigue</h2>
                <p className="text-sm text-muted-foreground">Detection System</p>
              </div>
              <ThemeToggle />
            </div>
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={isAuthenticated ? logout : undefined}
                asChild={!isAuthenticated}
              >
                {isAuthenticated ? (
                  <>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </>
                ) : (
                  <Link href="/login">
                    <LogIn className="h-4 w-4" />
                    Log In / Sign Up
                  </Link>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r z-10">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center justify-between flex-shrink-0 px-4 mb-5">
              <h2 className="text-lg font-semibold">Cognitive Fatigue</h2>
              <ThemeToggle />
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t p-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={isAuthenticated ? logout : undefined}
              asChild={!isAuthenticated}
            >
              {isAuthenticated ? (
                <>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </>
              ) : (
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  Log In / Sign Up
                </Link>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

