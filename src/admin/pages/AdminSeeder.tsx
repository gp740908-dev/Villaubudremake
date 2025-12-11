import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { villas, testimonials } from '@/data/villas';
import { Loader2, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Hardcoded blog posts from BlogPage.tsx
const blogPosts = [
    {
        slug: 'top-10-things-to-do-ubud',
        title: 'Top 10 Things to Do in Ubud: A Complete Guide',
        excerpt: 'Discover the best attractions and activities Ubud has to offer, from ancient temples to stunning rice terraces.',
        featured_image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop',
        author: 'Admin',
        category: 'Ubud Guide',
        status: 'published',
        published_at: '2024-12-01',
        content: '<p>Discover the best attractions and activities Ubud has to offer...</p>' // Placeholder content
    },
    {
        slug: 'balinese-culture-traditions',
        title: 'Balinese Culture: Traditions You Should Know',
        excerpt: 'Learn about the rich cultural heritage of Bali and how to respectfully experience local traditions.',
        featured_image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&h=500&fit=crop',
        author: 'Admin',
        category: 'Culture',
        status: 'published',
        published_at: '2024-11-15',
        content: '<p>Learn about the rich cultural heritage of Bali...</p>'
    },
    {
        slug: 'best-restaurants-ubud',
        title: 'Best Restaurants in Ubud for Every Budget',
        excerpt: 'From local warungs to fine dining, here are our top picks for places to eat in Ubud.',
        featured_image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=500&fit=crop',
        author: 'Admin',
        category: 'Travel Tips',
        status: 'published',
        published_at: '2024-11-10',
        content: '<p>From local warungs to fine dining...</p>'
    },
    {
        slug: 'villa-features-pool',
        title: 'Why a Private Pool Makes All the Difference',
        excerpt: 'Discover the luxury of having your own private pool during your Ubud villa stay.',
        featured_image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=500&fit=crop',
        author: 'Admin',
        category: 'Villa Features',
        status: 'published',
        published_at: '2024-11-05',
        content: '<p>Discover the luxury of having your own private pool...</p>'
    },
    {
        slug: 'hidden-waterfalls-bali',
        title: 'Hidden Waterfalls Near Ubud You Must Visit',
        excerpt: 'Escape the crowds and discover these secret waterfalls just a short drive from Ubud.',
        featured_image: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800&h=500&fit=crop',
        author: 'Admin',
        category: 'Ubud Guide',
        status: 'published',
        published_at: '2024-10-28',
        content: '<p>Escape the crowds and discover these secret waterfalls...</p>'
    },
    {
        slug: 'guest-story-honeymoon',
        title: 'Our Perfect Honeymoon at StayinUBUD',
        excerpt: 'Read about how one couple celebrated their love in the heart of Bali.',
        featured_image: 'https://images.unsplash.com/photo-1529634806980-e9d52f41f28f?w=800&h=500&fit=crop',
        author: 'Guest Author',
        category: 'Guest Stories',
        status: 'published',
        published_at: '2024-10-20',
        content: '<p>Read about how one couple celebrated their love...</p>'
    }
];

// Sample Offers
const sampleOffers = [
    {
        title: 'Early Bird Special',
        description: 'Book 60 days in advance and get 15% off your stay.',
        discount_type: 'percentage',
        discount_value: 15,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        minimum_nights: 3,
        is_active: true,
        promo_code: 'EARLY15',
        banner_image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=400&fit=crop'
    },
    {
        title: 'Long Stay Discount',
        description: 'Stay 7 nights or more and enjoy a special rate.',
        discount_type: 'percentage',
        discount_value: 20,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        minimum_nights: 7,
        is_active: true,
        promo_code: 'LONGSTAY',
        banner_image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=400&fit=crop'
    },
    {
        title: 'Honeymoon Package',
        description: 'Special romantic setup, flower bath, and couples massage included.',
        discount_type: 'fixed',
        discount_value: 1000000,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        minimum_nights: 3,
        is_active: true,
        promo_code: 'HONEYMOON',
        banner_image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=400&fit=crop'
    }
];

const AdminSeeder = () => {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const log = (message: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
    };

    const seedVillas = async () => {
        log('Starting Villas seed...');

        // Check if villas exist
        const { count } = await supabase.from('villas').select('*', { count: 'exact', head: true });
        if (count && count > 0) {
            log('Villas table not empty, skipping insertion.');
            return;
        }

        for (const villa of villas) {
            // Transform amenitiesDetailed to simple string array for database storage if needed, or keep JSON
            // But our schema has `amenities` as text[] and maybe `features` jsonb?
            // Let's check schema types. Villa interface has amenities: string[] and amenitiesDetailed.

            const { error } = await supabase.from('villas').insert({
                name: villa.name,
                tagline: villa.tagline,
                description: villa.description,
                price_per_night: villa.pricePerNight,
                capacity: villa.capacity,
                bedrooms: villa.bedrooms,
                bathrooms: villa.bathrooms,
                images: villa.images,
                amenities: villa.amenities, // string[]
                location: villa.location,
                address: villa.location,
                map_coordinates: `(${villa.coordinates.lat},${villa.coordinates.lng})`,
                house_rules: villa.houseRules.map(r => `${r.title}: ${r.description}`), // Simple array of strings for now
                // We don't have columns for detailed amenities in schema yet? Or maybe just store in a JSON column?
                // The schema has specific columns. 
            });

            if (error) {
                log(`Error inserting villa ${villa.name}: ${error.message}`);
            } else {
                log(`Inserted villa: ${villa.name}`);
            }
        }
        log('Villas seed complete.');
    };

    const seedBlog = async () => {
        log('Starting Blog seed...');

        // Seed Categories first
        const categories = [...new Set(blogPosts.map(p => p.category))];
        const categoryMap: Record<string, string> = {};

        for (const catName of categories) {
            // Check if exists
            const { data: existing } = await supabase.from('blog_categories').select('id').eq('name', catName).single();

            if (existing) {
                categoryMap[catName] = existing.id;
            } else {
                const { data, error } = await supabase.from('blog_categories').insert({ name: catName, slug: catName.toLowerCase().replace(/\s+/g, '-') }).select().single();
                if (data) {
                    categoryMap[catName] = data.id;
                    log(`Created category: ${catName}`);
                } else if (error) {
                    log(`Error creating category ${catName}: ${error.message}`);
                }
            }
        }

        // Seed Posts
        for (const post of blogPosts) {
            const { error } = await supabase.from('blog_posts').insert({
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                content: post.content,
                featured_image: post.featured_image,
                author_name: post.author,
                category_id: categoryMap[post.category],
                status: post.status,
                published_at: post.published_at,
            });

            if (error) {
                // Ignore unique constraint errors mostly
                if (error.code === '23505') {
                    log(`Post ${post.title} already exists.`);
                } else {
                    log(`Error inserting post ${post.title}: ${error.message}`);
                }
            } else {
                log(`Inserted post: ${post.title}`);
            }
        }
        log('Blog seed complete.');
    };

    const seedTestimonials = async () => {
        log('Starting Testimonials seed...');

        // We need to link testimonials to villas.
        // First get all villas to map IDs or names
        const { data: dbVillas } = await supabase.from('villas').select('id, name');

        for (const t of testimonials) {
            // Find villa by matching ID "1", "2" etc from mock data to real UUIDs?
            // The mock data uses string IDs "1", "2". Our seeding probably generated UUIDs.
            // We should try to match by Name since we seeded names.

            // Mock villa ID "1" -> "Sawah Terrace Villa"
            let villaName = "";
            if (t.villaId === "1") villaName = "Sawah Terrace Villa";
            if (t.villaId === "2") villaName = "Jungle Hideaway Villa";
            if (t.villaId === "3") villaName = "Canopy Treehouse Villa";
            if (t.villaId === "4") villaName = "Heritage Garden Villa";

            const exactVilla = dbVillas?.find(v => v.name === villaName);
            const villaId = exactVilla?.id;

            const { error } = await supabase.from('testimonials').insert({
                guest_name: t.name,
                guest_country: t.country,
                guest_avatar: t.avatar,
                rating: t.rating,
                review: t.review,
                villa_id: villaId, // Can be null if not found
                is_featured: t.rating === 5 // Feature 5 stars
            });

            if (error) {
                log(`Error inserting testimonial by ${t.name}: ${error.message}`);
            } else {
                log(`Inserted testimonial by: ${t.name}`);
            }
        }
        log('Testimonials seed complete.');
    };

    const seedOffers = async () => {
        log('Starting Offers seed...');
        for (const offer of sampleOffers) {
            const { error } = await supabase.from('offers').insert(offer);
            if (error) {
                log(`Error inserting offer ${offer.title}: ${error.message}`);
            } else {
                log(`Inserted offer: ${offer.title}`);
            }
        }
        log('Offers seed complete.');
    };

    const runSeed = async () => {
        if (!confirm('This will insert data into your Supabase database. Continue?')) return;

        setLoading(true);
        setLogs(['Starting database seed...']);

        try {
            await seedVillas();
            await seedBlog();
            await seedTestimonials();
            await seedOffers();
            log('ALL DONE! Database seeded successfully.');
            toast({ title: 'Seeding Complete', description: 'Database has been populated with sample data.' });
        } catch (error) {
            log(`FATAL ERROR: ${error}`);
            toast({ title: 'Seeding Failed', variant: 'destructive' });
        }

        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#2d3a29]">Database Seeder</h1>
                    <p className="text-sm text-[#6b7c67]">Populate your empty database with mock data</p>
                </div>
            </div>

            <div className="admin-card p-6">
                <div className="flex items-start gap-4 mb-6 p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
                    <AlertTriangle size={24} className="flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold">Warning</h3>
                        <p className="text-sm">
                            This tool will insert data into your Villas, Blog, Testimonials, and Offers tables.
                            It generally checks for existing data to avoid duplicates, but it's best run on an empty database.
                        </p>
                    </div>
                </div>

                <button
                    onClick={runSeed}
                    disabled={loading}
                    className="w-full py-4 bg-[#2d3a29] text-white rounded-xl hover:bg-[#1a2318] transition-colors flex items-center justify-center gap-2 font-bold text-lg"
                >
                    {loading ? <Loader2 size={24} className="animate-spin" /> : <Database size={24} />}
                    {loading ? 'Seeding Database...' : 'Run Seed Script'}
                </button>

                {logs.length > 0 && (
                    <div className="mt-6 p-4 bg-black/5 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1 border-b border-black/5 pb-1 last:border-0">
                                {log}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSeeder;
