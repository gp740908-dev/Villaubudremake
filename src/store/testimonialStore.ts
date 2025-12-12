import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Testimonial } from '@/lib/database.types';

interface TestimonialState {
    testimonials: Testimonial[];
    isLoading: boolean;
    error: string | null;

    fetchTestimonials: () => Promise<void>;
    fetchTestimonialsByVilla: (villaId: string) => Promise<Testimonial[]>; // New function
    createTestimonial: (testimonial: Omit<Testimonial, 'id' | 'created_at'>) => Promise<Testimonial | null>;
    updateTestimonial: (id: string, updates: Partial<Testimonial>) => Promise<boolean>;
    deleteTestimonial: (id: string) => Promise<boolean>;
    clearError: () => void;
}

export const useTestimonialStore = create<TestimonialState>((set, get) => ({
    testimonials: [],
    isLoading: false,
    error: null,

    fetchTestimonials: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            set({ testimonials: data as Testimonial[], isLoading: false });
        } catch (err) {
            console.error('Error fetching testimonials:', err);
            set({ isLoading: false, error: 'Failed to fetch testimonials' });
        }
    },

    fetchTestimonialsByVilla: async (villaId: string) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .eq('villa_id', villaId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // This function just returns the data, doesn't need to set it in global state
            // as it's for a specific context.
            set({ isLoading: false });
            return (data || []) as Testimonial[];
        } catch (err: any) {
            console.error(`Error fetching testimonials for villa ${villaId}:`, err);
            set({ isLoading: false, error: `Failed to fetch testimonials: ${err.message}` });
            return [];
        }
    },

    createTestimonial: async (testimonial) => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('testimonials')
                .insert([testimonial])
                .select()
                .single();

            if (error) throw error;

            const newTestimonial = data as Testimonial;
            set(state => ({ testimonials: [newTestimonial, ...state.testimonials], isLoading: false }));
            return newTestimonial;
        } catch (err) {
            console.error('Error creating testimonial:', err);
            set({ isLoading: false, error: 'Failed to create testimonial' });
            return null;
        }
    },

    updateTestimonial: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
            const { error, data } = await supabase
                .from('testimonials')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            set(state => ({
                testimonials: state.testimonials.map(t => t.id === id ? data as Testimonial : t),
                isLoading: false
            }));
            return true;
        } catch (err) {
            console.error('Error updating testimonial:', err);
            set({ isLoading: false, error: 'Failed to update testimonial' });
            return false;
        }
    },

    deleteTestimonial: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase
                .from('testimonials')
                .delete()
                .eq('id', id);

            if (error) throw error;

            set(state => ({
                testimonials: state.testimonials.filter(t => t.id !== id),
                isLoading: false
            }));
            return true;
        } catch (err) {
            console.error('Error deleting testimonial:', err);
            set({ isLoading: false, error: 'Failed to delete testimonial' });
            return false;
        }
    },

    clearError: () => set({ error: null })
}));
