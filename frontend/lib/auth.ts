// Auth utility using Supabase for authentication with email verification

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "./supabase"

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isVerifying: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkVerification: () => Promise<boolean>
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isVerifying: false,

      login: async (email: string, password: string) => {
        try {
          // Authenticate with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            console.error("Login error:", error.message)
            return false
          }

          if (!data.user || !data.session) {
            return false
          }

          // Check if email is verified
          if (!data.user.email_confirmed_at) {
            set({ isVerifying: true })
            return false
          }

          // Set user data in state
          set({
            user: {
              id: data.user.id,
              name: data.user.user_metadata?.name || email.split("@")[0],
              email: data.user.email || "",
            },
            isAuthenticated: true,
            isVerifying: false,
          })

          return true
        } catch (err) {
          console.error("Unexpected login error:", err)
          return false
        }
      },

      signup: async (name: string, email: string, password: string) => {
        try {
          // Create user with Supabase and send verification email
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name },
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          })

          if (error) {
            console.error("Signup error:", error.message)
            return false
          }

          if (!data.user) {
            return false
          }

          // If email confirmation is required, set verifying state
          if (!data.user.email_confirmed_at) {
            set({ isVerifying: true })
          } else {
            // If email confirmation is not required (depends on Supabase settings)
            set({
              user: {
                id: data.user.id,
                name: name,
                email: data.user.email || "",
              },
              isAuthenticated: true,
              isVerifying: false,
            })
          }

          return true
        } catch (err) {
          console.error("Unexpected signup error:", err)
          return false
        }
      },

      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut()
          if (error) {
            console.error("Logout error:", error.message)
          }
        } catch (err) {
          console.error("Unexpected logout error:", err)
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isVerifying: false,
          })
        }
      },

      checkVerification: async () => {
        try {
          const { data, error } = await supabase.auth.getUser()
          
          if (error || !data.user) {
            return false
          }

          // Check if email is verified
          if (data.user.email_confirmed_at) {
            set({
              user: {
                id: data.user.id,
                name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "",
                email: data.user.email || "",
              },
              isAuthenticated: true,
              isVerifying: false,
            })
            return true
          }
          
          return false
        } catch (err) {
          console.error("Error checking verification:", err)
          return false
        }
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)

