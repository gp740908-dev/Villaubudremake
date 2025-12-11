import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { GalleryImage } from '@/lib/database.types';

interface GalleryState {
    images: GalleryImage[];
    isLoading: boolean;
    error: string | null;

    fetchImages: () => Promise<void>;
    createImage: (image: Omit<GalleryImage, 'id' | 'created_at'>) => Promise<GalleryImage | null>;
    updateImage: (id: string, updates: Partial<GalleryImage>) => Promise<boolean>;
    deleteImage: (id: string) => Promise<boolean>;
    clearError: () => void;
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
    images: [],
    isLoading: false,
    error: null,

    fetchImages: async () => {
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase
                .from('gallery_images')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;

            set({ images: data as GalleryImage[], isLoading: false });
        } catch (err) {
            console.error('Error fetching gallery images:', err);
            set({ isLoading: false, error: 'Failed to fetch gallery images' });
        }
    },

    createImage: async (image) => {
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase
                .from('gallery_images')
                .insert([image])
                .select()
                .single();

            if (error) throw error;

            const newImage = data as GalleryImage;
            set(state => ({ images: [...state.images, newImage], isLoading: false }));
            return newImage;
        } catch (err) {
            console.error('Error creating gallery image:', err);
            set({ isLoading: false, error: 'Failed to create gallery image' });
            return null;
        }
    },

    updateImage: async (id, updates) => {
        set({ isLoading: true, error: null });

        try {
            const { error } = await supabase
                .from('gallery_images')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            set(state => ({
                images: state.images.map(i => i.id === id ? { ...i, ...updates } : i),
                isLoading: false
            }));
            return true;
        } catch (err) {
            console.error('Error updating gallery image:', err);
            set({ isLoading: false, error: 'Failed to update gallery image' });
            return false;
        }
    },

    deleteImage: async (id) => {
        set({ isLoading: true, error: null });

        try {
            const { error } = await supabase
                .from('gallery_images')
                .delete()
                .eq('id', id);

            if (error) throw error;

            set(state => ({
                images: state.images.filter(i => i.id !== id),
                isLoading: false
            }));
            return true;
        } catch (err) {
            console.error('Error deleting gallery image:', err);
            set({ isLoading: false, error: 'Failed to delete gallery image' });
            return false;
        }
    },

    clearError: () => set({ error: null })
}));
