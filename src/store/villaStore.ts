import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Villa } from '@/lib/database. types';

interface VillaState {
    villas: Villa[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchVillas: () => Promise<void>;
    createVilla: (villa: Omit<Villa, 'id' | 'created_at' | 'updated_at'>) => Promise<Villa | null>;
    updateVilla: (id: string, updates: Partial<Villa>) => Promise<boolean>;
    deleteVilla: (id: string) => Promise<boolean>;
    getVillaById: (id: string) => Villa | undefined;
    clearError: () => void;
}

export const useVillaStore = create<VillaState>((set, get) => ({
    villas: [],
    isLoading: false,
    error: null,

    fetchVillas: async () => {
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase
                . from('villas')
                .select('*')
                .order('created_at', { ascending:  false });

            if (error) throw error;

            set({
                villas: (data || []) as Villa[],
                isLoading: false
            });
        } catch (err:  any) {
            console.error('Error fetching villas:', err);
            set({
                isLoading: false,
                error: `Failed to fetch villas: ${err.message}`
            });
        }
    },

    createVilla: async (villa) => {
        set({ isLoading:  true, error: null });

        try {
            // Normalize data before insert
            const normalizedVilla = normalizeVillaData(villa);

            console.log('📝 Creating villa with data:', normalizedVilla);

            const { data, error } = await supabase
                .from('villas')
                .insert([normalizedVilla])
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            const newVilla = data as Villa;
            set(state => ({
                villas: [newVilla, ...state.villas],
                isLoading: false
            }));

            return newVilla;
        } catch (err:  any) {
            console.error('Error creating villa:', err);
            
            // Detailed error message
            let errorMsg = 'Failed to create villa';
            if (err.message?. includes('coordinates')) {
                errorMsg = 'Invalid coordinates format';
            } else if (err.message?.includes('amenities')) {
                errorMsg = 'Invalid amenities format';
            } else if (err.message?.includes('images')) {
                errorMsg = 'Invalid images format';
            }
            
            set({
                isLoading: false,
                error: errorMsg
            });
            return null;
        }
    },

    updateVilla: async (id, updates) => {
        set({ isLoading: true, error: null });

        try {
            // Validate ID
            if (!id) {
                throw new Error('Villa ID is required');
            }

            // Normalize update data
            const normalizedUpdates = normalizeVillaData(updates);

            console.log('✏️ Updating villa with data:', normalizedUpdates);

            // Update with detailed error handling
            const { error, data } = await supabase
                .from('villas')
                .update(normalizedUpdates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console. error('Supabase update error:', error);
                throw error;
            }

            // Update local state with returned data
            set(state => ({
                villas: state.villas.map(v =>
                    v.id === id ? (data as Villa) : v
                ),
                isLoading: false,
                error: null
            }));

            return true;
        } catch (err: any) {
            console.error('Error updating villa:', err);
            
            // Detailed error message
            let errorMsg = `Failed to update villa: ${err. message}`;
            
            if (err.message?.includes('row level security')) {
                errorMsg = 'Permission denied:  RLS policy blocks this operation';
            } else if (err.message?.includes('invalid input')) {
                errorMsg = 'Invalid data format - check coordinates, amenities, images';
            } else if (err.message?.includes('not found')) {
                errorMsg = 'Villa not found';
            }
            
            set({
                isLoading: false,
                error: errorMsg
            });
            return false;
        }
    },

    deleteVilla: async (id) => {
        set({ isLoading: true, error: null });

        try {
            if (!id) {
                throw new Error('Villa ID is required');
            }

            const { error } = await supabase
                . from('villas')
                .delete()
                .eq('id', id);

            if (error) throw error;

            set(state => ({
                villas: state. villas.filter(v => v.id !== id),
                isLoading: false
            }));

            return true;
        } catch (err: any) {
            console.error('Error deleting villa:', err);
            set({
                isLoading: false,
                error: `Failed to delete villa: ${err.message}`
            });
            return false;
        }
    },

    getVillaById: (id) => {
        return get().villas.find(v => v. id === id);
    },

    clearError: () => {
        set({ error: null });
    }
}));

/**
 * Normalize villa data for database operations
 * Ensures proper data types and structure
 */
function normalizeVillaData(data: any): any {
    const normalized:  any = {};

    // String fields
    if (data.name !== undefined) normalized.name = String(data.name).trim();
    if (data.tagline !== undefined) normalized.tagline = String(data.tagline).trim();
    if (data.description !== undefined) normalized.description = String(data.description).trim();
    if (data.short_description !== undefined) normalized.short_description = String(data.short_description).trim();
    if (data.location !== undefined) normalized.location = String(data.location).trim();

    // Number fields
    if (data.price_per_night !== undefined) normalized.price_per_night = parseInt(data.price_per_night, 10);
    if (data.cleaning_fee !== undefined) normalized.cleaning_fee = parseInt(data.cleaning_fee, 10);
    if (data.service_fee !== undefined) normalized.service_fee = parseInt(data.service_fee, 10);
    if (data.capacity !== undefined) normalized.capacity = parseInt(data.capacity, 10);
    if (data.bedrooms !== undefined) normalized.bedrooms = parseInt(data.bedrooms, 10);
    if (data.bathrooms !== undefined) normalized.bathrooms = parseInt(data.bathrooms, 10);
    if (data.minimum_stay !== undefined) normalized.minimum_stay = parseInt(data.minimum_stay, 10);
    if (data.rating !== undefined) normalized.rating = parseFloat(data.rating);
    if (data.review_count !== undefined) normalized.review_count = parseInt(data.review_count, 10);

    // Boolean fields
    if (data.is_available !== undefined) normalized.is_available = Boolean(data.is_available);

    // Array fields - must be text[] in database
    if (data.images !== undefined) {
        if (Array.isArray(data.images)) {
            normalized.images = data.images. map((img: any) => String(img).trim()).filter((img: any) => img.length > 0);
        } else if (data.images) {
            normalized.images = [String(data.images).trim()];
        } else {
            normalized.images = [];
        }
    }

    if (data.amenities !== undefined) {
        if (Array.isArray(data.amenities)) {
            normalized.amenities = data.amenities.map((a: any) => String(a).trim()).filter((a: any) => a.length > 0);
        } else if (data. amenities) {
            normalized. amenities = [String(data. amenities).trim()];
        } else {
            normalized.amenities = [];
        }
    }

    // JSONB field - coordinates
    if (data.coordinates !== undefined) {
        if (data.coordinates && typeof data.coordinates === 'object') {
            normalized.coordinates = {
                lat: parseFloat(data.coordinates.lat) || 0,
                lng:  parseFloat(data.coordinates.lng) || 0
            };
        } else {
            normalized. coordinates = { lat: 0, lng: 0 };
        }
    }

    console.log('Normalized data:', normalized);
    return normalized;
}
