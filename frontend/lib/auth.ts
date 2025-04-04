// This is a simplified auth utility for demo purposes
// In a real app, you would use NextAuth.js or a similar solution

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // In a real app, this would call an API endpoint
        // For demo purposes, we'll just simulate a successful login

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Simple validation
        if (!email || !password) {
          return false
        }

        // Create a user ID based on email (for demo purposes only)
        const userId = btoa(email).replace(/[^a-zA-Z0-9]/g, "")

        set({
          user: {
            id: userId,
            name: email.split("@")[0],
            email,
          },
          isAuthenticated: true,
        })

        return true
      },

      signup: async (name: string, email: string, password: string) => {
        // In a real app, this would call an API endpoint
        // For demo purposes, we'll just simulate a successful signup

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Simple validation
        if (!name || !email || !password) {
          return false
        }

        // Create a user ID based on email (for demo purposes only)
        const userId = btoa(email).replace(/[^a-zA-Z0-9]/g, "")

        set({
          user: {
            id: userId,
            name,
            email,
          },
          isAuthenticated: true,
        })

        return true
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)

