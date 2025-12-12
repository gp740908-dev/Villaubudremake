"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit2, Calendar, Trash2, X, Loader2 } from "lucide-react"
import { formatCurrency } from "@/utils/booking"
import { toast } from "@/hooks/use-toast"
import { useVillaStore } from "@/store/villaStore"
import type { Villa } from "@/lib/database.types"
import ImageUpload from "@/components/ui/ImageUpload"

// Status filter options
const statusFilters = [
  { value: "all", label: "All Villas" },
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
]

// Amenity options
const amenityOptions = [
  "WiFi",
  "Air Conditioning",
  "Pool",
  "Kitchen",
  "Parking",
  "TV",
  "Washing Machine",
  "Garden",
  "BBQ",
  "Safe",
  "Gym",
  "Spa",
  "Ocean View",
  "Mountain View",
  "Balcony",
  "Fireplace",
]

// Villa Card Component
const VillaCard = ({
  villa,
  onEdit,
  onViewCalendar,
  onDelete,
  onToggleStatus,
}: {
  villa: Villa
  onEdit: () => void
  onViewCalendar: () => void
  onDelete: () => void
  onToggleStatus: () => void
}) => {
  return (
    <div className="admin-card overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 group">
        <img
          src={villa.images?.[0] || "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800"}
          alt={villa.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={onEdit}
            className="p-3 bg-white rounded-full text-[#778873] hover:bg-[#A1BC98] hover:text-white transition-colors"
          >
            <Edit2 size={20} />
          </button>
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              villa.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {villa.is_available ? "Available" : "Unavailable"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-[#2d3a29] text-lg">{villa.name}</h3>
            <p className="text-xs text-[#6b7c67]">{villa.location || "Ubud, Bali"}</p>
          </div>
          {/* Toggle Switch */}
          <button
            onClick={onToggleStatus}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              villa.is_available ? "bg-[#A1BC98]" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                villa.is_available ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-[#F1F3E0] rounded-lg">
            <p className="text-lg font-bold text-[#778873]">{villa.bedrooms}</p>
            <p className="text-xs text-[#6b7c67]">Bedrooms</p>
          </div>
          <div className="text-center p-2 bg-[#F1F3E0] rounded-lg">
            <p className="text-lg font-bold text-[#778873]">{villa.bathrooms}</p>
            <p className="text-xs text-[#6b7c67]">Bathrooms</p>
          </div>
          <div className="text-center p-2 bg-[#F1F3E0] rounded-lg">
            <p className="text-lg font-bold text-[#778873]">{villa.capacity}</p>
            <p className="text-xs text-[#6b7c67]">Guests</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between py-3 border-t border-[#d4dbc8]">
          <span className="text-sm text-[#6b7c67]">Price/Night</span>
          <span className="font-bold text-[#2d3a29]">{formatCurrency(villa.price_per_night)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-[#d4dbc8]">
          <button onClick={onEdit} className="flex-1 admin-btn admin-btn-outline py-2 text-sm">
            <Edit2 size={14} />
            Edit
          </button>
          <button onClick={onViewCalendar} className="flex-1 admin-btn admin-btn-outline py-2 text-sm">
            <Calendar size={14} />
            Calendar
          </button>
          <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Edit Villa Modal Component
const EditVillaModal = ({
  villa,
  isOpen,
  onClose,
  onSave,
  isLoading,
}: {
  villa: Villa | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<Villa>) => void
  isLoading: boolean
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    short_description: "",
    description: "",
    price_per_night: 0,
    cleaning_fee: 0,
    service_fee: 0,
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [] as string[],
    minimum_stay: 1,
    location: "",
    is_available: true,
    images: [] as string[],
  })

  useEffect(() => {
    if (villa) {
      setFormData({
        name: villa.name || "",
        short_description: villa.short_description || "",
        description: villa.description || "",
        price_per_night: villa.price_per_night || 0,
        cleaning_fee: villa.cleaning_fee || 0,
        service_fee: villa.service_fee || 0,
        capacity: villa.capacity || 2,
        bedrooms: villa.bedrooms || 1,
        bathrooms: villa.bathrooms || 1,
        amenities: villa.amenities || [],
        minimum_stay: villa.minimum_stay || 1,
        location: villa.location || "",
        is_available: villa.is_available ?? true,
        images: villa.images || [],
      })
    } else {
      setFormData({
        name: "",
        short_description: "",
        description: "",
        price_per_night: 3500000,
        cleaning_fee: 500000,
        service_fee: 350000,
        capacity: 4,
        bedrooms: 2,
        bathrooms: 2,
        amenities: [],
        minimum_stay: 2,
        location: "Ubud, Bali",
        is_available: true,
        images: [],
      })
    }
  }, [villa, isOpen])

  const tabs = ["Basic Info", "Amenities", "Images", "Pricing"]

  if (!isOpen) return null

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#d4dbc8] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#2d3a29]">{villa ? "Edit Villa" : "Add New Villa"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#F1F3E0] rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#d4dbc8] overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === index
                  ? "border-b-2 border-[#778873] text-[#778873]"
                  : "text-[#6b7c67] hover:text-[#2d3a29]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab 1: Basic Info */}
          {activeTab === 0 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Villa Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="admin-input"
                  placeholder="Enter villa name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="admin-input"
                  placeholder="e.g. Tegallalang, Ubud"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Short Description</label>
                <textarea
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="admin-input"
                  rows={2}
                  placeholder="Brief description for listing cards"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Full Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="admin-input"
                  rows={5}
                  placeholder="Detailed villa description"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2d3a29] mb-2">Max Guests</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d3a29] mb-2">Bedrooms</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d3a29] mb-2">Bathrooms</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d3a29] mb-2">Min Stay</label>
                  <input
                    type="number"
                    value={formData.minimum_stay}
                    onChange={(e) => setFormData({ ...formData, minimum_stay: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Amenities */}
          {activeTab === 1 && (
            <div>
              <p className="text-sm text-[#6b7c67] mb-4">Select available amenities</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {amenityOptions.map((amenity) => (
                  <label
                    key={amenity}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.amenities.includes(amenity)
                        ? "border-[#778873] bg-[#A1BC98]/20"
                        : "border-[#d4dbc8] hover:border-[#A1BC98]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, amenities: [...formData.amenities, amenity] })
                        } else {
                          setFormData({ ...formData, amenities: formData.amenities.filter((a) => a !== amenity) })
                        }
                      }}
                      className="hidden"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Images */}
          {activeTab === 2 && (
            <div>
              <div className="mb-6">
                <ImageUpload
                  value={formData.images}
                  onChange={(urls) => setFormData({ ...formData, images: urls as string[] })}
                  multiple={true}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img src={img || "/placeholder.svg"} alt="" className="w-full h-24 object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) })
                        }
                        className="p-1 bg-white rounded text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {index === 0 && (
                      <span className="absolute top-1 left-1 text-xs bg-[#778873] text-white px-2 py-0.5 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Pricing */}
          {activeTab === 3 && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2d3a29] mb-2">Price/Night (IDR)</label>
                  <input
                    type="number"
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d3a29] mb-2">Cleaning Fee (IDR)</label>
                  <input
                    type="number"
                    value={formData.cleaning_fee}
                    onChange={(e) => setFormData({ ...formData, cleaning_fee: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d3a29] mb-2">Service Fee (IDR)</label>
                  <input
                    type="number"
                    value={formData.service_fee}
                    onChange={(e) => setFormData({ ...formData, service_fee: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-5 h-5"
                />
                <label htmlFor="is_available" className="text-sm font-medium text-[#2d3a29]">
                  Villa is available for booking
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#d4dbc8] flex justify-end gap-3">
          <button onClick={onClose} className="admin-btn admin-btn-outline">
            Cancel
          </button>
          <button onClick={handleSave} className="admin-btn admin-btn-primary" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Villa"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Villa Management Page
const AdminVillas = () => {
  const { villas, isLoading, error, fetchVillas, createVilla, updateVilla, deleteVilla } = useVillaStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null)
  const [calendarModalOpen, setCalendarModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [villaToDelete, setVillaToDelete] = useState<Villa | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchVillas()
  }, [fetchVillas])

  // Filter villas
  const filteredVillas = villas.filter((villa) => {
    const matchesSearch =
      villa.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (villa.location?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && villa.is_available) ||
      (statusFilter === "unavailable" && !villa.is_available)
    return matchesSearch && matchesStatus
  })

  const handleAddVilla = () => {
    setSelectedVilla(null)
    setEditModalOpen(true)
  }

  const handleEditVilla = (villa: Villa) => {
    setSelectedVilla(villa)
    setEditModalOpen(true)
  }

  const handleViewCalendar = (villa: Villa) => {
    setSelectedVilla(villa)
    setCalendarModalOpen(true)
  }

  const handleToggleStatus = async (villa: Villa) => {
    const result = await updateVilla(villa.id, { is_available: !villa.is_available })
    if (result.success) {
      toast({
        title: "Status updated",
        description: `${villa.name} is now ${!villa.is_available ? "available" : "unavailable"}`,
      })
    } else {
      toast({
        title: "Update failed",
        description: result.error || "Failed to update villa status",
        variant: "destructive",
      })
    }
  }

  const handleSave = async (data: Partial<Villa>) => {
    setIsSaving(true)
    try {
      // Validate data before saving
      if (!data.name || data.name.trim().length === 0) {
        toast({
          title: "Validation Error",
          description: "Villa name is required",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      if (!data.price_per_night || data.price_per_night <= 0) {
        toast({
          title: "Validation Error",
          description: "Price per night must be greater than 0",
          variant: "destructive",
        })
        setIsSaving(false)
        
  }

  const handleDelete = async (villa: Villa) => {
    setVillaToDelete(villa)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!villaToDelete) return

    const success = await deleteVilla(villaToDelete.id)
    if (success) {
      toast({
        title: "Villa deleted",
        description: `${villaToDelete.name} has been removed.`,
      })
    } else {
      toast({
        title: "Delete failed",
        description: error || "Failed to delete villa",
        variant: "destructive",
      })
    }
    setDeleteConfirmOpen(false)
    setVillaToDelete(null)
  }

  if (isLoading && villas.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#778873]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2d3a29]">Villa Management</h1>
          <p className="text-sm text-[#6b7c67]">Manage your villa properties ({villas.length} villas)</p>
        </div>
        <button onClick={handleAddVilla} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          Add New Villa
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7c67]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search villas..."
            className="admin-input pl-10"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-input w-48">
          {statusFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      {/* Villa Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredVillas.map((villa) => (
          <VillaCard
            key={villa.id}
            villa={villa}
            onEdit={() => handleEditVilla(villa)}
            onViewCalendar={() => handleViewCalendar(villa)}
            onDelete={() => handleDelete(villa)}
            onToggleStatus={() => handleToggleStatus(villa)}
          />
        ))}
      </div>

      {filteredVillas.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-[#6b7c67]">
            {villas.length === 0
              ? 'No villas found. Click "Add New Villa" to create one.'
              : "No villas found matching your criteria."}
          </p>
        </div>
      )}

      {/* Edit Modal */}
      <EditVillaModal
        villa={selectedVilla}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSave}
        isLoading={isSaving}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[#d4dbc8] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#2d3a29]">Confirm Deletion</h2>
              <button onClick={() => setDeleteConfirmOpen(false)} className="p-2 hover:bg-[#F1F3E0] rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-[#6b7c67]">
                Are you sure you want to delete "{villaToDelete?.name || "this villa"}"?
              </p>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#d4dbc8] flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmOpen(false)} className="admin-btn admin-btn-outline">
                Cancel
              </button>
              <button onClick={confirmDelete} className="admin-btn admin-btn-primary">
                Delete Villa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminVillas
        
