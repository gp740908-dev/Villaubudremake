"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Calendar, Users, Eye, X, Star, ArrowLeft, Clock, CheckCircle2, XCircle, Search, Loader2 } from "lucide-react"
import { format, parseISO, isPast, isFuture } from "date-fns"
import { useBookingStore, type CompletedBooking } from "@/store/bookingStore"
import { formatCurrency } from "@/utils/booking"
import { toast } from "@/hooks/use-toast"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

const statusConfig = {
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    className: "bg-primary/20 text-primary",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-500/20 text-yellow-600",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-secondary text-muted-foreground",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-destructive/20 text-destructive",
  },
}

const BookingCard = ({
  booking,
  onCancel,
  isLoading,
}: {
  booking: CompletedBooking
  onCancel: (id: string) => void
  isLoading: boolean
}) => {
  const status = statusConfig[booking.status]
  const StatusIcon = status.icon
  const checkInDate = parseISO(booking.checkIn)
  const checkOutDate = parseISO(booking.checkOut)
  const isUpcoming = isFuture(checkInDate)
  const canCancel = isUpcoming && booking.status === "confirmed"

  const villaImage = booking.villaImage || "/luxury-villa.png"
  const villaName = booking.villaName || "Villa"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      <div className="md:flex">
        <div className="md:w-48 h-48 md:h-auto relative">
          <img src={villaImage || "/placeholder.svg"} alt={villaName} className="w-full h-full object-cover" />
          <div
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.className}`}
          >
            <StatusIcon size={14} />
            {status.label}
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold mb-2">{villaName}</h3>
              <p className="text-sm text-muted-foreground font-mono mb-4">Ref: {booking.referenceNumber}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <span>
                    {format(checkInDate, "MMM d")} – {format(checkOutDate, "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-primary" />
                  <span>{booking.guests} guests</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{formatCurrency(booking.total)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border">
            <Link to={`/villas/${booking.villaId}`} className="btn-outline flex items-center gap-2 px-4 py-2 text-sm">
              <Eye size={16} />
              View Details
            </Link>

            {canCancel && (
              <button
                onClick={() => onCancel(booking.id)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                Cancel Booking
              </button>
            )}

            {booking.status === "completed" && (
              <button className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
                <Star size={16} />
                Leave Review
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const MyBookingsPage = () => {
  const { completedBookings, cancelBookingInSupabase, fetchBookingsByEmail, fetchBookingByReference, isLoading } =
    useBookingStore()
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "cancelled">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<CompletedBooking[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Use search results if searched, otherwise use local bookings
  const bookingsToShow = hasSearched ? searchResults : completedBookings

  const filteredBookings = bookingsToShow.filter((booking) => {
    const checkInDate = parseISO(booking.checkIn)

    switch (filter) {
      case "upcoming":
        return isFuture(checkInDate) && booking.status !== "cancelled"
      case "past":
        return isPast(checkInDate) && booking.status !== "cancelled"
      case "cancelled":
        return booking.status === "cancelled"
      default:
        return true
    }
  })

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter email or reference",
        description: "Please enter your email address or booking reference number.",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    // Check if it's a reference number (starts with SU-)
    if (searchQuery.toUpperCase().startsWith("SU-")) {
      const booking = await fetchBookingByReference(searchQuery)
      if (booking) {
        setSearchResults([booking])
      } else {
        setSearchResults([])
        toast({
          title: "Not found",
          description: "No booking found with that reference number.",
        })
      }
    } else {
      // Search by email
      const bookings = await fetchBookingsByEmail(searchQuery)
      setSearchResults(bookings)
      if (bookings.length === 0) {
        toast({
          title: "Not found",
          description: "No bookings found for that email address.",
        })
      }
    }

    setIsSearching(false)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setHasSearched(false)
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      const { success, error } = await cancelBookingInSupabase(bookingId)
      if (success) {
        toast({
          title: "Booking Cancelled",
          description: "Your booking has been cancelled successfully.",
        })
        // Refresh search results if we have them
        if (hasSearched && searchQuery) {
          handleSearch()
        }
      } else {
        toast({
          title: "Cancel Failed",
          description: error || "Failed to cancel booking. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>
            <h1 className="font-display text-3xl md:text-4xl font-semibold">My Bookings</h1>
          </div>

          {/* Search Box */}
          <div className="mb-8">
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-semibold mb-3">Find Your Booking</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your email address or booking reference number to find your bookings.
              </p>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Email address or reference (e.g., SU-ABC123)"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="btn-primary px-6 py-3 flex items-center gap-2"
                >
                  {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  Search
                </button>
              </div>
              {hasSearched && (
                <button
                  onClick={handleClearSearch}
                  className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Show local bookings instead
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { key: "all", label: "All" },
              { key: "upcoming", label: "Upcoming" },
              { key: "past", label: "Past" },
              { key: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as typeof filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === tab.key ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <Calendar size={32} className="text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-semibold mb-2">No bookings found</h2>
              <p className="text-muted-foreground mb-6">
                {hasSearched
                  ? "No bookings found for your search. Try a different email or reference."
                  : filter === "all"
                    ? "You haven't made any bookings yet."
                    : `No ${filter} bookings to display.`}
              </p>
              <Link to="/villas" className="btn-primary inline-flex px-6 py-3">
                Explore Villas
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} onCancel={handleCancelBooking} isLoading={isLoading} />
              ))}
            </div>
          )}

          {/* Quick Stats */}
          {bookingsToShow.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary">{bookingsToShow.length}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {bookingsToShow.filter((b) => isFuture(parseISO(b.checkIn)) && b.status !== "cancelled").length}
                </p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {bookingsToShow.filter((b) => isPast(parseISO(b.checkIn)) && b.status !== "cancelled").length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(
                    bookingsToShow.filter((b) => b.status !== "cancelled").reduce((sum, b) => sum + b.total, 0),
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default MyBookingsPage
