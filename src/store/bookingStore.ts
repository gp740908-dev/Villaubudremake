import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, type DbBooking } from "@/lib/supabase";
import { eachDayOfInterval, parseISO, format, addDays } from "date-fns";

// --- INTERFACES ---
export interface BookingData {
  villaId: string;
  villaName: string;
  villaImage: string;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
  nightlyRate: number;
  nights: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
}

export interface GuestDetails {
  fullName: string;
  email: string;
  whatsapp: string;
  specialRequests: string;
  country: string;
  idType: string;
  idNumber: string;
  arrivalTime: string;
}

export interface CompletedBooking {
  id: string;
  referenceNumber: string;
  villaId: string;
  villaName: string;
  villaImage: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  basePrice: number;
  cleaningFee: number;
  serviceFee: number;
  discountAmount: number;
  discountCode: string | null;
  total: number;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed";
  guestDetails: GuestDetails;
  paymentMethod: string;
  createdAt: string;
}

interface BookingState {
  booking: BookingData | null;
  guestDetails: GuestDetails | null;
  globalBookedDates: Record<string, string[]>; // VillaId -> ['YYYY-MM-DD']
  isLoading: boolean;
  error: string | null;

  // Local state management
  setBooking: (booking: BookingData | null) => void;
  setGuestDetails: (details: GuestDetails) => void;
  clearBooking: () => void;
  fetchAndSetGlobalBookedDates: () => Promise<void>;
  isDateGloballyBooked: (villaId: string, date: string) => boolean;

  // Supabase interactions
  saveBooking: (bookingData: CompletedBooking) => Promise<{ success: boolean; error?: string }>;
  fetchGuestBookings: (email: string) => Promise<CompletedBooking[]>;
  fetchBookingByReference: (reference: string) => Promise<CompletedBooking | null>;
  cancelBooking: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
  
  // Admin functions
  adminBookings: CompletedBooking[];
  fetchAllAdminBookings: () => Promise<void>;
  updateBookingStatus: (bookingId: string, status: CompletedBooking['status']) => Promise<{ success: boolean; error?: string }>;
}

// --- UTILITY FUNCTIONS ---
const generateReferenceNumber = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "SU-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper to map DB booking to app's CompletedBooking format, including Villa details
const mapDbBookingToCompletedBooking = (dbBooking: any): CompletedBooking => {
  const villaName = dbBooking.villas?.name || "Unknown Villa";
  const villaImage = dbBooking.villas?.images?.[0] || "";

  return {
    id: dbBooking.id,
    referenceNumber: dbBooking.reference_number,
    villaId: dbBooking.villa_id,
    villaName,
    villaImage,
    checkIn: dbBooking.check_in,
    checkOut: dbBooking.check_out,
    guests: dbBooking.guests,
    nights: dbBooking.nights,
    basePrice: dbBooking.base_price || 0,
    cleaningFee: dbBooking.cleaning_fee || 0,
    serviceFee: dbBooking.service_fee || 0,
    discountAmount: dbBooking.discount_amount || 0,
    discountCode: dbBooking.discount_code,
    total: dbBooking.total_price,
    status: dbBooking.status,
    paymentStatus: dbBooking.payment_status,
    paymentMethod: dbBooking.payment_method || "",
    createdAt: dbBooking.created_at,
    guestDetails: {
      fullName: dbBooking.guest_name,
      email: dbBooking.guest_email,
      whatsapp: dbBooking.guest_phone || "",
      specialRequests: dbBooking.special_requests || "",
      country: dbBooking.guest_country || "",
      idType: dbBooking.guest_id_type || "",
      idNumber: dbBooking.guest_id_number || "",
      arrivalTime: dbBooking.arrival_time || "",
    },
  };
};

// --- ZUSTAND STORE ---
export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      booking: null,
      guestDetails: null,
      globalBookedDates: {},
      isLoading: false,
      error: null,
      adminBookings: [],

      setBooking: (booking) => set({ booking }),
      setGuestDetails: (details) => set({ guestDetails: details }),
      clearBooking: () => set({ booking: null, guestDetails: null }),

      fetchAndSetGlobalBookedDates: async () => {
        try {
          const { data, error } = await supabase.from("villa_booked_dates").select("villa_id, booked_date").eq('status', 'booked');
          if (error) throw error;

          const datesMap: Record<string, string[]> = (data || []).reduce((acc, item) => {
            if (!acc[item.villa_id]) acc[item.villa_id] = [];
            acc[item.villa_id].push(item.booked_date);
            return acc;
          }, {});

          set({ globalBookedDates: datesMap });
        } catch (error) {
          console.error("Error fetching global booked dates:", error);
        }
      },

      isDateGloballyBooked: (villaId, date) => get().globalBookedDates[villaId]?.includes(date) || false,

      saveBooking: async (booking) => {
        set({ isLoading: true, error: null });
        try {
          const { guestDetails, ...bookingCore } = booking;
          const bookingToInsert = {
            ...guestDetails,
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
            guest_name: booking.guestDetails.fullName,
            guest_email: booking.guestDetails.email,
            guest_phone: booking.guestDetails.whatsapp || null,
            guest_country: booking.guestDetails.country || null,
            guest_id_type: booking.guestDetails.idType || null,
            guest_id_number: booking.guestDetails.idNumber || null,
            arrival_time: booking.guestDetails.arrivalTime || null,
            special_requests: booking.guestDetails.specialRequests || null
          };

          const { error: bookingError } = await supabase.from("bookings").insert(bookingToInsert);
          if (bookingError) throw bookingError;

          const datesToBlock = eachDayOfInterval({
            start: parseISO(booking.checkIn),
            end: addDays(parseISO(booking.checkOut), -1),
          }).map(date => ({
            villa_id: booking.villaId,
            booked_date: format(date, "yyyy-MM-dd"),
            booking_id: booking.id,
            status: "booked",
          }));

          const { error: datesError } = await supabase.from("villa_booked_dates").insert(datesToBlock);
          if (datesError) throw datesError; // TODO: Add rollback logic for booking if this fails

          await get().fetchAndSetGlobalBookedDates(); // Refresh booked dates
          set({ isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err instanceof Error ? err.message : "An unknown error occurred.";
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      fetchGuestBookings: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("bookings")
            .select(`*, villas(name, images)`)
            .eq("guest_email", email.toLowerCase())
            .order("created_at", { ascending: false });

          if (error) throw error;
          const bookings = (data || []).map(mapDbBookingToCompletedBooking);

          set({ isLoading: false });
          return bookings;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to fetch bookings.";
          set({ isLoading: false, error: message });
          return [];
        }
      },

      fetchBookingByReference: async (reference) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("bookings")
            .select(`*, villas(name, images)`)
            .eq("reference_number", reference.toUpperCase())
            .single();

          if (error || !data) throw new Error("Booking not found.");

          const booking = mapDbBookingToCompletedBooking(data);
          set({ isLoading: false });
          return booking;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to fetch booking.";
          set({ isLoading: false, error: message });
          return null;
        }
      },

      cancelBooking: async (bookingId) => {
        set({ isLoading: true, error: null });
        try {
          // Update booking status
          const { error: updateError } = await supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("id", bookingId);
          if (updateError) throw updateError;

          // Free up the dates
          const { error: deleteDatesError } = await supabase
            .from("villa_booked_dates")
            .delete()
            .eq("booking_id", bookingId);
          if (deleteDatesError) throw deleteDatesError;

          await get().fetchAndSetGlobalBookedDates(); // Refresh dates
          set({ isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to cancel booking.";
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      fetchAllAdminBookings: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("bookings")
            .select(`*, villas(name, images)`)
            .order("created_at", { ascending: false });

          if (error) throw error;
          const bookings = (data || []).map(mapDbBookingToCompletedBooking);
          set({ adminBookings: bookings, isLoading: false });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to fetch all bookings.";
          set({ isLoading: false, error: message });
        }
      },

      updateBookingStatus: async (bookingId, status) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);
          if (error) throw error;

          // Optimistically update local state
          set(state => ({
            adminBookings: state.adminBookings.map(b => b.id === bookingId ? { ...b, status } : b),
          }));

          set({ isLoading: false });
          return { success: true };
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to update status.";
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },
    }),
    {
      name: "stayinubud-booking-session",
      partialize: (state) => ({
        booking: state.booking,
        guestDetails: state.guestDetails,
      }),
    },
  ),
);

export { generateReferenceNumber };

// --- FILTER STORE (UNCHANGED) ---

export interface FilterState {
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
  priceRange: [number, number];
  amenities: string[];
  location: string;
  sortBy: "price-asc" | "price-desc" | "capacity" | "rating";
}

interface FilterStore extends FilterState {
  setCheckIn: (date: Date | null) => void;
  setCheckOut: (date: Date | null) => void;
  setGuests: (guests: number) => void;
  setPriceRange: (range: [number, number]) => void;
  toggleAmenity: (amenity: string) => void;
  setLocation: (location: string) => void;
  setSortBy: (sort: FilterState['sortBy']) => void;
  resetFilters: () => void;
}

const initialFilters: FilterState = {
  checkIn: null,
  checkOut: null,
  guests: 2,
  priceRange: [0, 10000000],
  amenities: [],
  location: "All Locations",
  sortBy: "rating",
};

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
}));
