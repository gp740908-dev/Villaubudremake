// Database types for Supabase tables

export interface AdminUser {
    id: string;
    email: string;
    password_hash: string;
    name: string;
    role: 'super_admin' | 'admin' | 'editor';
    avatar_url?: string;
    is_active: boolean;
    last_login?: string;
    created_at: string;
    updated_at: string;
}

export interface Villa {
    id: string;
    name: string;
    tagline?: string;
    description?: string;
    short_description?: string;
    price_per_night: number;
    capacity: number;
    bedrooms: number;
    bathrooms: number;
    images: string[];
    amenities: string[];
    is_available: boolean;
    rating: number;
    review_count: number;
    location?: string;
    coordinates: { lat: number; lng: number };
    cleaning_fee: number;
    service_fee: number;
    minimum_stay: number;
    created_at: string;
    updated_at: string;
}

export interface VillaBookedDate {
    id: string;
    villa_id: string;
    booked_date: string;
    booking_id?: string;
    created_at: string;
}

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    created_at: string;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    featured_image?: string;
    author_id?: string;
    author_name?: string;
    category_id?: string;
    tags: string[];
    status: 'draft' | 'published' | 'scheduled';
    published_at?: string;
    views: number;
    created_at: string;
    updated_at: string;
    // Joined fields
    category?: BlogCategory;
}

export interface GalleryImage {
    id: string;
    title?: string;
    description?: string;
    image_url: string;
    category: string;
    villa_id?: string;
    sort_order: number;
    is_featured: boolean;
    created_at: string;
}

export interface Testimonial {
    id: string;
    guest_name: string;
    guest_country?: string;
    guest_avatar?: string;
    villa_id?: string;
    villa_name?: string;
    rating: number;
    review?: string;
    ratings: {
        cleanliness?: number;
        communication?: number;
        checkIn?: number;
        accuracy?: number;
        location?: number;
        value?: number;
    };
    host_response?: string;
    is_featured: boolean;
    review_date: string;
    created_at: string;
}

export interface Offer {
    id: string;
    title: string;
    description?: string;
    banner_image?: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    promo_code?: string;
    start_date?: string;
    end_date?: string;
    applicable_villas: string[];
    minimum_nights: number;
    max_uses?: number;
    current_uses: number;
    terms?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Setting {
    id: string;
    key: string;
    value: unknown;
    category: string;
    updated_at: string;
}

export interface Booking {
    id: string;
    reference_number: string;
    villa_id: string;
    check_in: string;
    check_out: string;
    guests: number;
    total_price: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    payment_method?: string;
    special_requests?: string;
    guest_name: string;
    guest_email: string;
    guest_phone?: string;
    created_at: string;
    // Joined fields
    villa?: Villa;
}

// Database schema type for Supabase client
export interface Database {
    public: {
        Tables: {
            admin_users: {
                Row: AdminUser;
                Insert: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<AdminUser, 'id' | 'created_at'>>;
            };
            villas: {
                Row: Villa;
                Insert: Omit<Villa, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Villa, 'id' | 'created_at'>>;
            };
            villa_booked_dates: {
                Row: VillaBookedDate;
                Insert: Omit<VillaBookedDate, 'id' | 'created_at'>;
                Update: Partial<Omit<VillaBookedDate, 'id' | 'created_at'>>;
            };
            blog_categories: {
                Row: BlogCategory;
                Insert: Omit<BlogCategory, 'id' | 'created_at'>;
                Update: Partial<Omit<BlogCategory, 'id' | 'created_at'>>;
            };
            blog_posts: {
                Row: BlogPost;
                Insert: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'views'>;
                Update: Partial<Omit<BlogPost, 'id' | 'created_at'>>;
            };
            gallery_images: {
                Row: GalleryImage;
                Insert: Omit<GalleryImage, 'id' | 'created_at'>;
                Update: Partial<Omit<GalleryImage, 'id' | 'created_at'>>;
            };
            testimonials: {
                Row: Testimonial;
                Insert: Omit<Testimonial, 'id' | 'created_at'>;
                Update: Partial<Omit<Testimonial, 'id' | 'created_at'>>;
            };
            offers: {
                Row: Offer;
                Insert: Omit<Offer, 'id' | 'created_at' | 'updated_at' | 'current_uses'>;
                Update: Partial<Omit<Offer, 'id' | 'created_at'>>;
            };
            settings: {
                Row: Setting;
                Insert: Omit<Setting, 'id' | 'updated_at'>;
                Update: Partial<Omit<Setting, 'id'>>;
            };
            bookings: {
                Row: Booking;
                Insert: Omit<Booking, 'id' | 'created_at'>;
                Update: Partial<Omit<Booking, 'id' | 'created_at'>>;
            };
        };
    };
}
