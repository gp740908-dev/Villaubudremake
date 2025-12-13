import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.  Please check your .env. local file or Vercel settings.")
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession:  true,
    detectSessionInUrl: true,
  },
})

export interface DbBooking {
  id: string
  reference_number: string
  villa_id: string
  check_in:  string
  check_out: string
  guests: number
  total_price: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  payment_method: string | null
  special_requests: string | null
  guest_name: string
  guest_email:  string
  guest_phone: string | null
  created_at: string
}

export interface DbVilla {
  id: string
  name: string
  tagline: string | null
  description: string | null
  short_description: string | null
  price_per_night: number
  capacity: number
  bedrooms: number
  bathrooms:  number
  images: string[]
  amenities: string[]
  rating: number
  review_count: number
  location: string | null
  cleaning_fee: number
  service_fee: number
  minimum_stay: number
  is_available: boolean
  created_at: string
}
