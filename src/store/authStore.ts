import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "@/lib/supabase"
import type { AdminUser } from "@/lib/database.types"

interface AuthState {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  sessionToken: string | null

  // Actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  clearError: () => void
  setUser: (user: AdminUser | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessionToken: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          // Step 1: Authenticate using Supabase Auth (built-in password hashing)
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase().trim(),
            password: password,
          })

          if (authError || !authData.user) {
            set({
              isLoading: false,
              error: authError?.message || "Invalid email or password",
              isAuthenticated: false,
              user: null,
              sessionToken: null,
            })
            return false
          }

          // Step 2: Fetch admin user profile from admin_users table
          const { data: adminUser, error: adminError } = await supabase
            .from("admin_users")
            .select("*")
            .eq("id", authData.user.id)
            .eq("is_active", true)
            .single()

          if (adminError || !adminUser) {
            // User is authenticated but not an admin
            await supabase.auth.signOut()

            set({
              isLoading: false,
              error: "You do not have admin access",
              isAuthenticated: false,
              user: null,
              sessionToken: null,
            })
            return false
          }

          // Step 3: Update last login timestamp
          await supabase
            .from("admin_users")
            .update({ last_login: new Date().toISOString() })
            .eq("id", adminUser.id)
            .throwOnError()

          // Step 4: Store session and user data
          const sessionToken = authData.session?.access_token

          set({
            user: adminUser as AdminUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            sessionToken: sessionToken || null,
          })

          return true
        } catch (err: any) {
          const errorMessage = err?.message || "An error occurred during login"
          console.error("Login error:", err)

          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            sessionToken: null,
          })
          return false
        }
      },

      logout: async () => {
        try {
          // Sign out from Supabase
          await supabase.auth.signOut()

          set({
            user: null,
            isAuthenticated: false,
            error: null,
            sessionToken: null,
          })
        } catch (err) {
          console.error("Logout error:", err)
          // Still clear local state even if logout fails
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            sessionToken: null,
          })
        }
      },

      checkSession: async () => {
        try {
          const { data, error } = await supabase.auth.getSession()

          if (error || !data.session) {
            set({ isAuthenticated: false, user: null, sessionToken: null })
            return
          }

          const currentState = get()

          // If no user in state but session exists, fetch user profile
          if (!currentState.user && data.session.user.id) {
            const { data: adminUser } = await supabase
              .from("admin_users")
              .select("*")
              .eq("id", data.session.user.id)
              .eq("is_active", true)
              .single()

            if (adminUser) {
              set({
                user: adminUser as AdminUser,
                isAuthenticated: true,
                sessionToken: data.session.access_token,
              })
            }
          }
        } catch (err) {
          console.error("Session check error:", err)
          set({ isAuthenticated: false, user: null })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      setUser: (user: AdminUser | null) => {
        set({ user })
      },
    }),
    {
      name: "admin-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionToken: state.sessionToken,
      }),
    },
  ),
)
          
