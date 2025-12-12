-- =============================================
-- DATABASE SETUP
-- =============================================

-- ----------------------------------------------------------------
-- 1. Create Tables
-- ----------------------------------------------------------------

-- public.villas
CREATE TABLE IF NOT EXISTS public.villas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    short_description TEXT,
    price_per_night NUMERIC(10, 2) NOT NULL,
    capacity INT NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    images TEXT[],
    amenities TEXT[],
    rating NUMERIC(3, 2),
    review_count INT,
    location TEXT,
    cleaning_fee NUMERIC(10, 2) DEFAULT 0,
    service_fee NUMERIC(10, 2) DEFAULT 0,
    minimum_stay INT DEFAULT 1,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- public.bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number TEXT UNIQUE NOT NULL,
    villa_id UUID REFERENCES public.villas(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    payment_method TEXT,
    special_requests TEXT,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- public.blog_posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    author TEXT,
    image_url TEXT,
    tags TEXT[],
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- public.testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name TEXT NOT NULL,
    author_location TEXT,
    author_avatar_url TEXT,
    rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- public.gallery_items
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    caption TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- public.offers
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    discount_code TEXT UNIQUE,
    discount_percentage NUMERIC(5, 2),
    valid_from DATE,
    valid_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- public.settings
CREATE TABLE IF NOT EXISTS public.settings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- public.admin_users
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'editor',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- public.contact_submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- public.faqs
CREATE TABLE IF NOT EXISTS public.faqs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ----------------------------------------------------------------
-- 2. Create Functions & Triggers
-- ----------------------------------------------------------------

-- Function to generate a unique booking reference number
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TEXT AS $$
DECLARE
    new_ref TEXT;
BEGIN
    LOOP
        new_ref := 'SIU-' || to_char(NOW(), 'YYMMDD') || '-' || upper(substr(md5(random()::text), 1, 6));
        IF NOT EXISTS (SELECT 1 FROM public.bookings WHERE reference_number = new_ref) THEN
            RETURN new_ref;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Set default reference number on new booking
ALTER TABLE public.bookings
ALTER COLUMN reference_number SET DEFAULT generate_reference_number();


-- ----------------------------------------------------------------
-- 3. Seed Data (Optional)
-- ----------------------------------------------------------------

-- Note: Seeding is optional and can be managed via the admin panel.
-- This is just for initial setup.

-- Clear existing data before seeding
-- TRUNCATE TABLE public.villas, public.bookings, public.blog_posts, public.testimonials, public.gallery_items, public.offers, public.settings RESTART IDENTITY CASCADE;

-- Seed settings
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

-- Seed FAQs
INSERT INTO public.faqs (question, answer, category) VALUES
    ('What are the check-in and check-out times?', 'Check-in is at 2:00 PM and check-out is at 12:00 PM (noon). Early check-in or late check-out may be available upon request for an additional fee, subject to availability.', 'General'),
    ('Is airport transfer included?', 'Airport transfer is not included in the standard rate, but we can arrange a private car for you at an additional cost. Please contact us with your flight details to book.', 'General'),
    ('Are pets allowed?', 'Unfortunately, to ensure the comfort and safety of all our guests, we do not allow pets in the villas.', 'General'),
    ('What payment methods do you accept?', 'We accept bank transfer (BCA, Mandiri), credit/debit cards (Visa, Mastercard), and Indonesian e-wallets including GoPay, OVO, and DANA.', 'Payments'),
    ('Is a deposit required?', 'Yes, we require a 50% deposit to confirm your booking. The remaining balance is due 7 days before check-in or upon arrival for last-minute bookings.', 'Payments'),
    ('Do you charge in USD or IDR?', 'All prices are displayed in IDR (Indonesian Rupiah). International guests can pay in their local currency; the conversion will be handled by your bank.', 'Payments'),
    ('What is the cancellation policy?', 'Bookings cancelled more than 30 days before check-in receive a full refund. Cancellations between 7-30 days receive a 50% refund. Cancellations less than 7 days before check-in are non-refundable.', 'Policies'),
    ('Is smoking allowed in the villas?', 'Smoking is strictly prohibited inside all enclosed areas of the villa. Guests are welcome to smoke in designated outdoor areas.', 'Policies')
ON CONFLICT (id) DO NOTHING;


-- ----------------------------------------------------------------
-- 4. Row Level Security (RLS)
-- ----------------------------------------------------------------

-- Enable RLS for all tables
ALTER TABLE public.villas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;


-- ----------------------------------------------------------------
-- 5. RLS Policies
-- ----------------------------------------------------------------

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Policies for public access (Read-only)
DROP POLICY IF EXISTS "Public can read published/approved content" ON public.villas;
CREATE POLICY "Public can read published/approved content" ON public.villas FOR SELECT USING (is_available = TRUE);

DROP POLICY IF EXISTS "Public can read published/approved content" ON public.blog_posts;
CREATE POLICY "Public can read published/approved content" ON public.blog_posts FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS "Public can read published/approved content" ON public.testimonials;
CREATE POLICY "Public can read published/approved content" ON public.testimonials FOR SELECT USING (is_approved = TRUE);

DROP POLICY IF EXISTS "Public can read published/approved content" ON public.gallery_items;
CREATE POLICY "Public can read published/approved content" ON public.gallery_items FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public can read published/approved content" ON public.offers;
CREATE POLICY "Public can read published/approved content" ON public.offers FOR SELECT USING (is_active = TRUE AND valid_to >= NOW());

DROP POLICY IF EXISTS "Public can read published/approved content" ON public.settings;
CREATE POLICY "Public can read published/approved content" ON public.settings FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public can read published/approved content" ON public.faqs;
CREATE POLICY "Public can read published/approved content" ON public.faqs FOR SELECT USING (TRUE);


-- Policies for admin access (Full access)
DROP POLICY IF EXISTS "Admins have full access" ON public.villas;
CREATE POLICY "Admins have full access" ON public.villas FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access" ON public.bookings;
CREATE POLICY "Admins have full access" ON public.bookings FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access" ON public.blog_posts;
CREATE POLICY "Admins have full access" ON public.blog_posts FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access" ON public.testimonials;
CREATE POLICY "Admins have full access" ON public.testimonials FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access" ON public.gallery_items;
CREATE POLICY "Admins have full access" ON public.gallery_items FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access" ON public.offers;
CREATE POLICY "Admins have full access" ON public.offers FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access" ON public.settings;
CREATE POLICY "Admins have full access" ON public.settings FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access" ON public.admin_users;
CREATE POLICY "Admins have full access" ON public.admin_users FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access" ON public.contact_submissions;
CREATE POLICY "Admins have full access" ON public.contact_submissions FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Admins have full access" ON public.faqs;
CREATE POLICY "Admins have full access" ON public.faqs FOR ALL USING (is_admin());


-- Policies for specific actions
-- Allow users to see their own bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT
  USING (auth.jwt()->>'email' = guest_email);

-- Allow public to create contact submissions
DROP POLICY IF EXISTS "Public can create contact submissions" ON public.contact_submissions;
CREATE POLICY "Public can create contact submissions" ON public.contact_submissions FOR INSERT WITH CHECK (TRUE);

-- Allow authenticated users to create bookings
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON public.bookings;
CREATE POLICY "Authenticated users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
