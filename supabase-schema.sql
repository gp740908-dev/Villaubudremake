-- Supabase SQL Schema for StayinUBUD Villa Booking
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- =============================================
-- BOOKINGS TABLE (existing)
-- =============================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_number TEXT UNIQUE NOT NULL,
  villa_id TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER DEFAULT 1,
  total_price INTEGER NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_method TEXT,
  special_requests TEXT,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ADMIN USERS TABLE (custom auth)
-- =============================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin user (password: admin123)
-- Note: In production, use proper password hashing
INSERT INTO public.admin_users (email, password_hash, name, role)
VALUES ('admin@stayinubud.com', 'admin123', 'Super Admin', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- VILLAS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.villas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  short_description TEXT,
  price_per_night INTEGER NOT NULL,
  capacity INTEGER DEFAULT 2,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  rating DECIMAL(2,1) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  location TEXT,
  coordinates JSONB DEFAULT '{"lat": 0, "lng": 0}',
  cleaning_fee INTEGER DEFAULT 0,
  service_fee INTEGER DEFAULT 0,
  minimum_stay INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- VILLA BOOKED DATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.villa_booked_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  villa_id UUID REFERENCES public.villas(id) ON DELETE CASCADE,
  booked_date DATE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(villa_id, booked_date)
);

-- =============================================
-- BLOG CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.blog_categories (name, slug) VALUES
  ('Travel Tips', 'travel-tips'),
  ('Culture', 'culture'),
  ('Food & Dining', 'food-dining'),
  ('Activities', 'activities'),
  ('Wellness', 'wellness')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- BLOG POSTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES public.admin_users(id),
  author_name TEXT,
  category_id UUID REFERENCES public.blog_categories(id),
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- GALLERY IMAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  villa_id UUID REFERENCES public.villas(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TESTIMONIALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name TEXT NOT NULL,
  guest_country TEXT,
  guest_avatar TEXT,
  villa_id UUID REFERENCES public.villas(id) ON DELETE SET NULL,
  villa_name TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  ratings JSONB DEFAULT '{}',
  host_response TEXT,
  is_featured BOOLEAN DEFAULT false,
  review_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- OFFERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  banner_image TEXT,
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  promo_code TEXT UNIQUE,
  start_date DATE,
  end_date DATE,
  applicable_villas UUID[] DEFAULT '{}',
  minimum_nights INTEGER DEFAULT 1,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  terms TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.settings (key, value, category) VALUES
  ('site_name', '"StayinUBUD"', 'general'),
  ('site_tagline', '"Luxury Villa Rentals in Ubud, Bali"', 'general'),
  ('contact_email', '"info@stayinubud.com"', 'general'),
  ('contact_phone', '"+62 812 3456 7890"', 'general'),
  ('whatsapp', '"+62 812 3456 7890"', 'general'),
  ('address', '"Jl. Raya Ubud No. 88, Ubud, Gianyar, Bali 80571"', 'general'),
  ('currency', '"IDR"', 'booking'),
  ('tax_rate', '11', 'booking'),
  ('min_booking_days', '2', 'booking'),
  ('max_booking_days', '30', 'booking'),
  ('social_instagram', '"https://instagram.com/stayinubud"', 'social'),
  ('social_facebook', '"https://facebook.com/stayinubud"', 'social')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villa_booked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Public read access for most tables
CREATE POLICY "Public read villas" ON public.villas FOR SELECT USING (true);
CREATE POLICY "Public read blog_posts" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public read blog_categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Public read gallery_images" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Public read active offers" ON public.offers FOR SELECT USING (is_active = true);
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);

-- Bookings policies (guest checkout)
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Anyone can update bookings" ON public.bookings FOR UPDATE USING (true);

-- Admin users policy (for login check)
CREATE POLICY "Public read admin_users" ON public.admin_users FOR SELECT USING (true);

-- Full access policies for admin operations (via service role key in production)
CREATE POLICY "Full access villas" ON public.villas FOR ALL USING (true);
CREATE POLICY "Full access blog_posts" ON public.blog_posts FOR ALL USING (true);
CREATE POLICY "Full access blog_categories" ON public.blog_categories FOR ALL USING (true);
CREATE POLICY "Full access gallery_images" ON public.gallery_images FOR ALL USING (true);
CREATE POLICY "Full access testimonials" ON public.testimonials FOR ALL USING (true);
CREATE POLICY "Full access offers" ON public.offers FOR ALL USING (true);
CREATE POLICY "Full access settings" ON public.settings FOR ALL USING (true);
CREATE POLICY "Full access villa_booked_dates" ON public.villa_booked_dates FOR ALL USING (true);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON public.bookings(guest_email);
CREATE INDEX IF NOT EXISTS idx_bookings_reference_number ON public.bookings(reference_number);
CREATE INDEX IF NOT EXISTS idx_villas_is_available ON public.villas(is_available);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_offers_promo_code ON public.offers(promo_code);
CREATE INDEX IF NOT EXISTS idx_villa_booked_dates_villa ON public.villa_booked_dates(villa_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_villas_updated_at BEFORE UPDATE ON public.villas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STORAGE BUCKETS (If supported by editor, else run in dashboard)
-- =============================================
-- Create 'images' bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Rules (Allow public read, authenticated insert)
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'images' );

CREATE POLICY "Auth Upload"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'images' ); 
  -- In production, add: AND auth.role() = 'authenticated'

CREATE POLICY "Auth Delete"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'images' );
