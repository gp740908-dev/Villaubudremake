import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase, type DbBooking } from "@/lib/supabase"
import { eachDayOfInterval, parseISO, format, addDays } from "date-fns"

export interface BookingData {
  villaId: string
  villaName: string
  villaImage: string
  checkIn: Date | null
  checkOut: Date | null
  guests: number
  nightlyRate: number
  nights: number
  cleaningFee: number
  serviceFee: number
  total: number
}

export interface GuestDetails {
  fullName: string
  email: string
  whatsapp: string
  specialRequests: string
  country: string
  idType: string
  idNumber: string
  arrivalTime: string
}

export interface CompletedBooking {
  id: string
  referenceNumber: string
  villaId: string
  villaName: string
  villaImage: string
  checkIn: string
  checkOut: string
  guests: number
  nights: number
  basePrice: number
  cleaningFee: number
  serviceFee: number
  discountAmount: number
  discountCode: string | null
  total: number
  status: "confirmed" | "pending" | "completed" | "cancelled"
  paymentStatus: "paid" | "pending" | "failed"
  guestDetails: GuestDetails
  paymentMethod: string
  createdAt: string
}

interface BookingState {
  booking: BookingData | null
  guestDetails: GuestDetails | null
  completedBookings: CompletedBooking[]
  globalBookedDates: Record<string, string[]>
  isLoading: boolean
  error: string | null
  setBooking: (booking: BookingData | null) => void
  setGuestDetails: (details: GuestDetails) => void
  clearBooking: () => void
  addCompletedBooking: (booking: CompletedBooking) => void
  cancelBooking: (bookingId: string) => void
  addBookedDates: (villaId: string, dates: string[]) => void
  isDateGloballyBooked: (villaId: string, date: string) => boolean
  // Supabase functions
  saveBookingToSupabase: (booking: CompletedBooking) => Promise<{ success: boolean; error?: string }>
  fetchBookingsByEmail: (email: string) => Promise<CompletedBooking[]>
  fetchBookingByReference: (reference: string) => Promise<CompletedBooking | null>
  cancelBookingInSupabase: (bookingId: string) => Promise<{ success: boolean; error?: string }>
  fetchAllBookedDates: () => Promise<void>
  adminBookings: CompletedBooking[]
  fetchAllBookings: () => Promise<void>
  updateBookingStatus: (
    bookingId: string,
    status: "pending" | "confirmed" | "completed" | "cancelled",
  ) => Promise<{ success: boolean; error?: string }>
}

const generateReferenceNumber = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = "SU-"
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      booking: null,
      guestDetails: null,
      completedBookings: [],
      globalBookedDates: {},
      isLoading: false,
      error: null,

      setBooking: (booking) => set({ booking }),
      setGuestDetails: (details) => set({ guestDetails: details }),
      clearBooking: () => set({ booking: null, guestDetails: null }),

      addCompletedBooking: (booking) =>
        set((state) => ({
          completedBookings: [...state.completedBookings, booking],
        })),

      cancelBooking: (bookingId) =>
        set((state) => ({
          completedBookings: state.completedBookings.map((b) =>
            b.id === bookingId ? { ...b, status: "cancelled" as const } : b,
          ),
        })),

      addBookedDates: (villaId, dates) =>
        set((state) => ({
          globalBookedDates: {
            ...state.globalBookedDates,
            [villaId]: [...(state.globalBookedDates[villaId] || []), ...dates],
          },
        })),

      isDateGloballyBooked: (villaId, date) => {
        const state = get()
        return state.globalBookedDates[villaId]?.includes(date) || false
      },

      saveBookingToSupabase: async (booking) => {
        set({ isLoading: true, error: null })
        try {
          const bookingToInsert = {
            id: booking.id,
            reference_number: booking.referenceNumber,
            villa_id: booking.villaId,
            check_in: booking.checkIn,
            check_out: booking.checkOut,
            guests: booking.guests,
            nights: booking.nights,
            base_price: booking.basePrice,
            cleaning_fee: booking.cleaningFee,
            service_fee: booking.serviceFee,
            discount_amount: booking.discountAmount,
            discount_code: booking.discountCode,
            total_price: booking.total,
            status: booking.status,
            payment_status: booking.paymentStatus,
            payment_method: booking.paymentMethod,
            special_requests: booking.guestDetails.specialRequests || null,
            guest_name: booking.guestDetails.fullName,
            guest_email: booking.guestDetails.email,
            guest_phone: booking.guestDetails.whatsapp || null,
            guest_country: booking.guestDetails.country || null,
            guest_id_type: booking.guestDetails.idType || null,
            guest_id_number: booking.guestDetails.idNumber || null,
            arrival_time: booking.guestDetails.arrivalTime || null,
          }

          const { error: bookingError } = await supabase.from("bookings").insert(bookingToInsert)

          if (bookingError) throw bookingError

          const checkInDate = parseISO(booking.checkIn)
          const checkOutDate = parseISO(booking.checkOut)
          const datesToBlock = eachDayOfInterval({
            start: checkInDate,
            end: addDays(checkOutDate, -1),
          }).map((date) => ({
            villa_id: booking.villaId,
            booked_date: format(date, "yyyy-MM-dd"),
            booking_id: booking.id,
            status: "booked",
          }))

          const { error: datesError } = await supabase.from("villa_booked_dates").insert(datesToBlock)

          if (datesError) {
            console.error("Failed to block dates:", datesError)
            throw datesError
          }

          set({ isLoading: false })
          return { success: true }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error"
          set({ isLoading: false, error: errorMessage })
          return { success: false, error: errorMessage }
        }
      },

      fetchBookingsByEmail: async (email) => {
        set({ isLoading: true, error: null })
        try {
          const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .eq("guest_email", email.toLowerCase())
            .order("created_at", { ascending: false })

          if (error) {
            set({ isLoading: false, error: error.message })
            return []
          }

          const bookings: CompletedBooking[] = (data || []).map((b: DbBooking) => ({
            id: b.id,
            referenceNumber: b.reference_number,
            villaId: b.villa_id,
            villaName: "",
            villaImage: "",
            checkIn: b.check_in,
            checkOut: b.check_out,
            guests: b.guests,
            nights: b.nights,
            basePrice: b.base_price || 0,
            cleaningFee: b.cleaning_fee || 0,
            serviceFee: b.service_fee || 0,
            discountAmount: b.discount_amount || 0,
            discountCode: b.discount_code,
            total: b.total_price,
            status: b.status,
            paymentStatus: b.payment_status,
            guestDetails: {
              fullName: b.guest_name,
              email: b.guest_email,
              whatsapp: b.guest_phone || "",
              specialRequests: b.special_requests || "",
              country: b.guest_country || "",
              idType: b.guest_id_type || "",
              idNumber: b.guest_id_number || "",
              arrivalTime: b.arrival_time || "",
            },
            paymentMethod: b.payment_method || "",
            createdAt: b.created_at,
          }))

          set({ isLoading: false })
          return bookings
        } catch (err) {
          set({ isLoading: false, error: "Failed to fetch bookings" })
          return []
        }
      },

      fetchBookingByReference: async (reference) => {
        set({ isLoading: true, error: null })
        try {
          const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .eq("reference_number", reference.toUpperCase())
            .single()

          if (error || !data) {
            set({ isLoading: false, error: "Booking not found" })
            return null
          }

          const booking: CompletedBooking = {
            id: data.id,
            referenceNumber: data.reference_number,
            villaId: data.villa_id,
            villaName: "",
            villaImage: "",
            checkIn: data.check_in,
            checkOut: data.check_out,
            guests: data.guests,
            nights: data.nights,
            basePrice: data.base_price || 0,
            cleaningFee: data.cleaning_fee || 0,
            serviceFee: data.service_fee || 0,
            discountAmount: data.discount_amount || 0,
            discountCode: data.discount_code,
            total: data.total_price,
            status: data.status,
            paymentStatus: data.payment_status,
            guestDetails: {
              fullName: data.guest_name,
              email: data.guest_email,
              whatsapp: data.guest_phone || "",
              specialRequests: data.special_requests || "",
              country: data.guest_country || "",
              idType: data.guest_id_type || "",
              idNumber: data.guest_id_number || "",
              arrivalTime: data.arrival_time || "",
            },
            paymentMethod: data.payment_method || "",
            createdAt: data.created_at,
          }

          set({ isLoading: false })
          return booking
        } catch (err) {
          set({ isLoading: false, error: "Failed to fetch booking" })
          return null
        }
      },

      cancelBookingInSupabase: async (bookingId) => {
        set({ isLoading: true, error: null })
        try {
          const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId)

          if (error) {
            set({ isLoading: false, error: error.message })
            return { success: false, error: error.message }
          }

          get().cancelBooking(bookingId)
          set({ isLoading: false })
          return { success: true }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error"
          set({ isLoading: false, error: errorMessage })
          return { success: false, error: errorMessage }
        }
      },

      fetchAllBookedDates: async () => {
        try {
          const { data, error } = await supabase.from("villa_booked_dates").select("villa_id, booked_date")

          if (error) throw error

          if (data) {
            const datesMap: Record<string, string[]> = {}
            data.forEach((item) => {
              if (!datesMap[item.villa_id]) {
                datesMap[item.villa_id] = []
              }
              datesMap[item.villa_id].push(item.booked_date)
            })

            set({ globalBookedDates: datesMap })
          }
        } catch (error) {
          console.error("Error fetching booked dates:", error)
        }
      },

      adminBookings: [],
      fetchAllBookings: async () => {
        set({ isLoading: true, error: null })
        try {
          const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false })

          if (error) {
            set({ isLoading: false, error: error.message })
            return
          }

          const bookings: CompletedBooking[] = (data || []).map((b: DbBooking) => ({
            id: b.id,
            referenceNumber: b.reference_number,
            villaId: b.villa_id,
            villaName: "",
            villaImage: "",
            checkIn: b.check_in,
            checkOut: b.check_out,
            guests: b.guests,
            nights: b.nights,
            basePrice: b.base_price || 0,
            cleaningFee: b.cleaning_fee || 0,
            serviceFee: b.service_fee || 0,
            discountAmount: b.discount_amount || 0,
            discountCode: b.discount_code,
            total: b.total_price,
            status: b.status,
            paymentStatus: b.payment_status,
            guestDetails: {
              fullName: b.guest_name,
              email: b.guest_email,
              whatsapp: b.guest_phone || "",
              specialRequests: b.special_requests || "",
              country: b.guest_country || "",
              idType: b.guest_id_type || "",
              idNumber: b.guest_id_number || "",
              arrivalTime: b.arrival_time || "",
            },
            paymentMethod: b.payment_method || "",
            createdAt: b.created_at,
          }))

          set({ adminBookings: bookings, isLoading: false })
        } catch (err) {
          set({ isLoading: false, error: "Failed to fetch all bookings" })
        }
      },

      updateBookingStatus: async (bookingId, status) => {
        set({ isLoading: true, error: null })
        try {
          const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId)

          if (error) {
            set({ isLoading: false, error: error.message })
            return { success: false, error: error.message }
          }

          set((state) => ({
            adminBookings: state.adminBookings.map((b) => (b.id === bookingId ? { ...b, status } : b)),
            isLoading: false,
          }))

          return { success: true }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error"
          set({ isLoading: false, error: errorMessage })
          return { success: false, error: errorMessage }
        }
      },
    }),
    {
      name: "stayinubud-booking",
      partialize: (state) => ({
        booking: state.booking,
        guestDetails: state.guestDetails,
        completedBookings: state.completedBookings,
        globalBookedDates: state.globalBookedDates,
      }),
    },
  ),
)

export { generateReferenceNumber }

// Filter Store (unchanged)
export interface FilterState {
  checkIn: Date | null
  checkOut: Date | null
  guests: number
  priceRange: [number, number]
  amenities: string[]
  location: string
  sortBy: "price-asc" | "price-desc" | "capacity" | "rating"
}

interface FilterStore extends FilterState {
  setCheckIn: (date: Date | null) => void
  setCheckOut: (date: Date | null) => void
  setGuests: (guests: number) => void
  setPriceRange: (range: [number, number]) => void
  toggleAmenity: (amenity: string) => void
  setLocation: (location: string) => void
  setSortBy: (sort: FilterState["sortBy"]) => void
  resetFilters: () => void
}

const initialFilters: FilterState = {
  checkIn: null,
  checkOut: null,
  guests: 2,
  priceRange: [0, 10000000],
  amenities: [],
  location: "All Locations",
  sortBy: "rating",
}

export const useFilterStore = create<FilterStore>((set) => ({
  ...initialFilters,
  setCheckIn: (date) => set({ checkIn: date }),
  setCheckOut: (date) => set({ checkOut: date }),
  setGuests: (guests) => set({ guests }),
  setPriceRange: (range) => set({ priceRange: range }),
  toggleAmenity: (amenity) =>
    set((state) => ({
      amenities: state.amenities.includes(amenity)
        ? state.amenities.filter((a) => a !== amenity)
        : [...state.amenities, amenity],
    })),
  setLocation: (location) => set({ location }),
  setSortBy: (sortBy) => set({ sortBy }),
  resetFilters: () => set(initialFilters),
}))
