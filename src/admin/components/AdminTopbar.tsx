"use client"

import { useState } from "react"
import { Menu, Search, Bell, ChevronDown, LogOut, User } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useNavigate } from "react-router-dom"

interface AdminTopbarProps {
  onMenuClick: () => void
}

const AdminTopbar = ({ onMenuClick }: AdminTopbarProps) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/admin/login")
  }

  const notifications = [
    { id: 1, message: "New booking from John Smith", time: "5 min ago" },
    { id: 2, message: "Payment received for SU-ABC123", time: "1 hour ago" },
    { id: 3, message: "New review on Serenity Pool Villa", time: "2 hours ago" },
  ]

  return (
    <header className="admin-topbar">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-[#F1F3E0] rounded-lg transition-colors">
          <Menu size={24} className="text-[#778873]" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center relative">
          <Search size={18} className="absolute left-3 text-[#778873]" />
          <input type="text" placeholder="Search bookings, guests..." className="admin-input pl-10 w-64" />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-[#F1F3E0] rounded-lg transition-colors"
          >
            <Bell size={20} className="text-[#778873]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-[#d4dbc8] z-50">
              <div className="p-4 border-b border-[#d4dbc8]">
                <h3 className="font-semibold text-[#2d3a29]">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 hover:bg-[#F1F3E0] cursor-pointer border-b border-[#d4dbc8] last:border-0"
                  >
                    <p className="text-sm text-[#2d3a29]">{notif.message}</p>
                    <p className="text-xs text-[#6b7c67] mt-1">{notif.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-[#d4dbc8]">
                <button className="text-sm text-[#778873] hover:text-[#2d3a29] w-full text-center">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-2 hover:bg-[#F1F3E0] rounded-lg transition-colors"
          >
            <img
              src={
                user?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
              }
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-[#2d3a29]">{user?.name}</p>
              <p className="text-xs text-[#6b7c67]">{user?.role === "super_admin" ? "Super Admin" : "Admin"}</p>
            </div>
            <ChevronDown size={16} className="text-[#778873]" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-[#d4dbc8] z-50">
              <div className="p-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#2d3a29] hover:bg-[#F1F3E0] rounded-lg transition-colors">
                  <User size={16} />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside handler */}
      {(showDropdown || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowDropdown(false)
            setShowNotifications(false)
          }}
        />
      )}
    </header>
  )
}

export default AdminTopbar
