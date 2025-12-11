"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  X,
  Check,
  Clock,
  Download,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"
import { useAdminUserStore } from "@/store/adminUserStore"
import type { AdminUser } from "@/lib/database.types"

// Role configuration
const roleConfig = {
  super_admin: {
    label: "Super Admin",
    icon: ShieldCheck,
    className: "bg-purple-100 text-purple-700",
    description: "Full access to everything",
  },
  admin: {
    label: "Admin",
    icon: ShieldAlert,
    className: "bg-blue-100 text-blue-700",
    description: "Manage villas, bookings, offers",
  },
  editor: {
    label: "Editor",
    icon: Shield,
    className: "bg-green-100 text-green-700",
    description: "Manage blog posts and content",
  },
}

// Avatar/Initials component
const UserAvatar = ({ user }: { user: AdminUser }) => {
  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url || "/placeholder.svg"}
        alt={user.name}
        className="w-10 h-10 rounded-full object-cover"
      />
    )
  }
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="w-10 h-10 rounded-full bg-[#A1BC98] text-white flex items-center justify-center font-semibold text-sm">
      {initials}
    </div>
  )
}

// Add/Edit User Modal
const UserModal = ({
  user,
  isOpen,
  onClose,
  onSave,
  isLoading,
}: {
  user: AdminUser | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<AdminUser> & { password?: string }) => void
  isLoading: boolean
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "editor" as "super_admin" | "admin" | "editor",
    is_active: true,
    password: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        password: "",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        role: "editor",
        is_active: true,
        password: "",
      })
    }
  }, [user, isOpen])

  if (!isOpen) return null

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast({ title: "Missing fields", description: "Name and email are required", variant: "destructive" })
      return
    }
    if (!user && !formData.password) {
      toast({ title: "Missing password", description: "Password is required for new admin", variant: "destructive" })
      return
    }
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-[#d4dbc8] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#2d3a29]">{user ? "Edit Admin User" : "Add New Admin"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F1F3E0] rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2d3a29] mb-2">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="admin-input"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2d3a29] mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="admin-input"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2d3a29] mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="admin-input"
            >
              {Object.entries(roleConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#6b7c67] mt-1">{roleConfig[formData.role].description}</p>
          </div>
          {!user && (
            <div>
              <label className="block text-sm font-medium text-[#2d3a29] mb-2">Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="admin-input"
                placeholder="Enter password"
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              className={`relative w-12 h-6 rounded-full transition-colors ${formData.is_active ? "bg-[#A1BC98]" : "bg-gray-300"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.is_active ? "translate-x-7" : "translate-x-1"}`}
              />
            </button>
            <span className="text-sm">{formData.is_active ? "Active" : "Inactive"}</span>
          </div>
        </div>

        <div className="p-6 border-t border-[#d4dbc8] flex justify-end gap-3">
          <button onClick={onClose} className="admin-btn admin-btn-outline">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isLoading} className="admin-btn admin-btn-primary">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            Save Admin User
          </button>
        </div>
      </div>
    </div>
  )
}

// Change Password Modal
const PasswordModal = ({
  user,
  isOpen,
  onClose,
  onSave,
  isLoading,
}: {
  user: AdminUser | null
  isOpen: boolean
  onClose: () => void
  onSave: (password: string) => void
  isLoading: boolean
}) => {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (isOpen) {
      setNewPassword("")
      setConfirmPassword("")
    }
  }, [isOpen])

  if (!isOpen || !user) return null

  const requirements = [
    { label: "At least 8 characters", met: newPassword.length >= 8 },
    { label: "Contains uppercase & lowercase", met: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) },
    { label: "Contains numbers", met: /\d/.test(newPassword) },
    { label: "Contains special characters", met: /[!@#$%^&*]/.test(newPassword) },
  ]

  const strength = requirements.filter((r) => r.met).length
  const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400"]

  const handleSave = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" })
      return
    }
    if (strength < 3) {
      toast({ title: "Password too weak", variant: "destructive" })
      return
    }
    onSave(newPassword)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-[#d4dbc8] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#2d3a29]">Change Password</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F1F3E0] rounded-lg">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-[#6b7c67]">
            Changing password for: <strong>{user.name}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-[#2d3a29] mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="admin-input"
            />
            <div className="flex gap-1 mt-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded ${i < strength ? strengthColors[strength - 1] : "bg-gray-200"}`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2d3a29] mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="bg-[#F1F3E0] rounded-lg p-3 space-y-1">
            {requirements.map((req, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-sm ${req.met ? "text-green-600" : "text-[#6b7c67]"}`}
              >
                {req.met ? <Check size={14} /> : <div className="w-3.5 h-3.5 border border-[#d4dbc8] rounded" />}
                {req.label}
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t border-[#d4dbc8] flex justify-end gap-3">
          <button onClick={onClose} className="admin-btn admin-btn-outline">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isLoading} className="admin-btn admin-btn-primary">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            Change Password
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Admin Users Page
const AdminUsers = () => {
  const {
    admins,
    activityLogs,
    isLoading,
    fetchAdmins,
    fetchActivityLogs,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    toggleAdminStatus,
    changePassword,
  } = useAdminUserStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showActivityLog, setShowActivityLog] = useState(false)

  useEffect(() => {
    fetchAdmins()
    fetchActivityLogs()
  }, [fetchAdmins, fetchActivityLogs])

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEdit = (admin: AdminUser) => {
    setSelectedUser(admin)
    setUserModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedUser(null)
    setUserModalOpen(true)
  }

  const handleChangePassword = (admin: AdminUser) => {
    setSelectedUser(admin)
    setPasswordModalOpen(true)
  }

  const handleDelete = async (admin: AdminUser) => {
    if (window.confirm(`Delete admin "${admin.name}"?`)) {
      const success = await deleteAdmin(admin.id)
      if (success) {
        toast({ title: "Admin deleted" })
      } else {
        toast({ title: "Failed to delete admin", variant: "destructive" })
      }
    }
  }

  const handleToggleStatus = async (admin: AdminUser) => {
    const success = await toggleAdminStatus(admin.id)
    if (success) {
      toast({ title: admin.is_active ? "Admin deactivated" : "Admin activated" })
    }
  }

  const handleSaveUser = async (data: Partial<AdminUser> & { password?: string }) => {
    if (selectedUser) {
      const success = await updateAdmin(selectedUser.id, {
        name: data.name,
        email: data.email,
        role: data.role,
        is_active: data.is_active,
      })
      if (success) {
        toast({ title: "Admin updated" })
        setUserModalOpen(false)
      }
    } else {
      const newAdmin = await createAdmin({
        name: data.name!,
        email: data.email!,
        password_hash: data.password!, // In production, hash this
        role: data.role!,
        is_active: data.is_active!,
      })
      if (newAdmin) {
        toast({ title: "Admin created" })
        setUserModalOpen(false)
      }
    }
  }

  const handleSavePassword = async (password: string) => {
    if (selectedUser) {
      const success = await changePassword(selectedUser.id, password)
      if (success) {
        toast({ title: "Password changed" })
        setPasswordModalOpen(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2d3a29]">Admin Users Management</h1>
          <p className="text-sm text-[#6b7c67]">Manage access and permissions</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowActivityLog(!showActivityLog)} className="admin-btn admin-btn-outline">
            <Clock size={16} />
            Activity Log
          </button>
          <button onClick={handleCreate} className="admin-btn admin-btn-primary">
            <Plus size={18} />
            Add New Admin
          </button>
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(roleConfig).map(([key, config]) => {
          const Icon = config.icon
          const count = admins.filter((a) => a.role === key).length
          return (
            <div key={key} className="admin-card p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.className}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-[#2d3a29]">{config.label}</p>
                  <p className="text-xs text-[#6b7c67]">{count} users</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7c67]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="admin-input pl-10"
        />
      </div>

      {/* Loading State */}
      {isLoading && admins.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-[#778873]" />
        </div>
      )}

      {/* Users Table or Activity Log */}
      {showActivityLog ? (
        <div className="admin-card">
          <div className="p-4 border-b border-[#d4dbc8] flex items-center justify-between">
            <h3 className="font-semibold text-[#2d3a29]">Activity Log</h3>
            <button className="admin-btn admin-btn-outline text-sm">
              <Download size={14} />
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-[#6b7c67]">
                      No activity logs yet
                    </td>
                  </tr>
                ) : (
                  activityLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-sm">{format(new Date(log.created_at), "MMM d, yyyy HH:mm")}</td>
                      <td className="font-medium">{log.admin_name}</td>
                      <td className="text-[#6b7c67]">{log.action}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-[#6b7c67]">
                      {searchQuery ? "No admins found matching your search" : "No admin users yet"}
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => {
                    const role = roleConfig[admin.role] || roleConfig.editor
                    const RoleIcon = role.icon

                    return (
                      <tr key={admin.id}>
                        <td>
                          <UserAvatar user={admin} />
                        </td>
                        <td className="font-medium">{admin.name}</td>
                        <td className="text-[#6b7c67]">{admin.email}</td>
                        <td>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${role.className}`}
                          >
                            <RoleIcon size={12} />
                            {role.label}
                          </span>
                        </td>
                        <td className="text-sm text-[#6b7c67]">
                          {admin.last_login ? format(new Date(admin.last_login), "MMM d, HH:mm") : "Never"}
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleStatus(admin)}
                            className={`relative w-10 h-5 rounded-full transition-colors ${admin.is_active ? "bg-[#A1BC98]" : "bg-gray-300"}`}
                          >
                            <div
                              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${admin.is_active ? "translate-x-5" : "translate-x-0.5"}`}
                            />
                          </button>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(admin)}
                              className="p-2 hover:bg-[#F1F3E0] rounded-lg text-[#778873]"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleChangePassword(admin)}
                              className="p-2 hover:bg-[#F1F3E0] rounded-lg text-[#778873]"
                            >
                              <Key size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(admin)}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <UserModal
        user={selectedUser}
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onSave={handleSaveUser}
        isLoading={isLoading}
      />
      <PasswordModal
        user={selectedUser}
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSave={handleSavePassword}
        isLoading={isLoading}
      />
    </div>
  )
}

export default AdminUsers
