import { create } from "zustand"
import { supabase } from "@/lib/supabase"
import type { AdminUser } from "@/lib/database.types"

interface ActivityLog {
  id: string
  admin_id: string
  admin_name: string
  action: string
  ip_address?: string
  device?: string
  created_at: string
}

interface AdminUserState {
  admins: AdminUser[]
  activityLogs: ActivityLog[]
  isLoading: boolean
  error: string | null

  // Actions
  fetchAdmins: () => Promise<void>
  fetchActivityLogs: () => Promise<void>
  createAdmin: (admin: Omit<AdminUser, "id" | "created_at" | "updated_at">) => Promise<AdminUser | null>
  updateAdmin: (id: string, updates: Partial<AdminUser>) => Promise<boolean>
  deleteAdmin: (id: string) => Promise<boolean>
  toggleAdminStatus: (id: string) => Promise<boolean>
  changePassword: (id: string, newPassword: string) => Promise<boolean>
  logActivity: (adminId: string, adminName: string, action: string) => Promise<void>
  clearError: () => void
}

export const useAdminUserStore = create<AdminUserState>((set, get) => ({
  admins: [],
  activityLogs: [],
  isLoading: false,
  error: null,

  fetchAdmins: async () => {
    set({ isLoading: true, error: null })

    try {
      const { data, error } = await supabase.from("admin_users").select("*").order("created_at", { ascending: false })

      if (error) throw error

      set({
        admins: data as AdminUser[],
        isLoading: false,
      })
    } catch (err) {
      console.error("Error fetching admins:", err)
      set({
        isLoading: false,
        error: "Failed to fetch admin users",
      })
    }
  },

  fetchActivityLogs: async () => {
    try {
      const { data, error } = await supabase
        .from("admin_activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error

      set({ activityLogs: data as ActivityLog[] })
    } catch (err) {
      console.error("Error fetching activity logs:", err)
    }
  },

  createAdmin: async (admin) => {
    set({ isLoading: true, error: null })

    try {
      const { data, error } = await supabase.from("admin_users").insert([admin]).select().single()

      if (error) throw error

      const newAdmin = data as AdminUser
      set((state) => ({
        admins: [newAdmin, ...state.admins],
        isLoading: false,
      }))

      return newAdmin
    } catch (err) {
      console.error("Error creating admin:", err)
      set({
        isLoading: false,
        error: "Failed to create admin user",
      })
      return null
    }
  },

  updateAdmin: async (id, updates) => {
    set({ isLoading: true, error: null })

    try {
      const { error } = await supabase
        .from("admin_users")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      set((state) => ({
        admins: state.admins.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        isLoading: false,
      }))

      return true
    } catch (err) {
      console.error("Error updating admin:", err)
      set({
        isLoading: false,
        error: "Failed to update admin user",
      })
      return false
    }
  },

  deleteAdmin: async (id) => {
    set({ isLoading: true, error: null })

    try {
      const { error } = await supabase.from("admin_users").delete().eq("id", id)

      if (error) throw error

      set((state) => ({
        admins: state.admins.filter((a) => a.id !== id),
        isLoading: false,
      }))

      return true
    } catch (err) {
      console.error("Error deleting admin:", err)
      set({
        isLoading: false,
        error: "Failed to delete admin user",
      })
      return false
    }
  },

  toggleAdminStatus: async (id) => {
    const admin = get().admins.find((a) => a.id === id)
    if (!admin) return false

    return get().updateAdmin(id, { is_active: !admin.is_active })
  },

  changePassword: async (id, newPassword) => {
    set({ isLoading: true, error: null })

    try {
      const { error } = await supabase
        .from("admin_users")
        .update({
          password_hash: newPassword, // In production, hash this password
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      set({ isLoading: false })
      return true
    } catch (err) {
      console.error("Error changing password:", err)
      set({
        isLoading: false,
        error: "Failed to change password",
      })
      return false
    }
  },

  logActivity: async (adminId, adminName, action) => {
    try {
      await supabase.from("admin_activity_logs").insert([
        {
          admin_id: adminId,
          admin_name: adminName,
          action,
          created_at: new Date().toISOString(),
        },
      ])
    } catch (err) {
      console.error("Error logging activity:", err)
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
