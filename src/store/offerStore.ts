import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Offer } from '@/lib/database.types';

interface OfferState {
    offers: Offer[];
    isLoading: boolean;
    error: string | null;

    fetchOffers: () => Promise<void>;
    createOffer: (offer: Omit<Offer, 'id' | 'created_at' | 'updated_at' | 'current_uses'>) => Promise<Offer | null>;
    updateOffer: (id: string, updates: Partial<Offer>) => Promise<boolean>;
    deleteOffer: (id: string) => Promise<boolean>;
    getOfferById: (id: string) => Offer | undefined;
    clearError: () => void;
}

export const useOfferStore = create<OfferState>((set, get) => ({
    offers: [],
    isLoading: false,
    error: null,

    fetchOffers: async () => {
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase
                .from('offers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            set({ offers: data as Offer[], isLoading: false });
        } catch (err) {
            console.error('Error fetching offers:', err);
            set({ isLoading: false, error: 'Failed to fetch offers' });
        }
    },

    createOffer: async (offer) => {
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase
                .from('offers')
                .insert([offer])
                .select()
                .single();

            if (error) throw error;

            const newOffer = data as Offer;
            set(state => ({ offers: [newOffer, ...state.offers], isLoading: false }));
            return newOffer;
        } catch (err) {
            console.error('Error creating offer:', err);
            set({ isLoading: false, error: 'Failed to create offer' });
            return null;
        }
    },

    updateOffer: async (id, updates) => {
        set({ isLoading: true, error: null });

        try {
            const { error } = await supabase
                .from('offers')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            set(state => ({
                offers: state.offers.map(o => o.id === id ? { ...o, ...updates } : o),
                isLoading: false
            }));
            return true;
        } catch (err) {
            console.error('Error updating offer:', err);
            set({ isLoading: false, error: 'Failed to update offer' });
            return false;
        }
    },

    deleteOffer: async (id) => {
        set({ isLoading: true, error: null });

        try {
            const { error } = await supabase
                .from('offers')
                .delete()
                .eq('id', id);

            if (error) throw error;

            set(state => ({
                offers: state.offers.filter(o => o.id !== id),
                isLoading: false
            }));
            return true;
        } catch (err) {
            console.error('Error deleting offer:', err);
            set({ isLoading: false, error: 'Failed to delete offer' });
            return false;
        }
    },

    getOfferById: (id) => get().offers.find(o => o.id === id),
    clearError: () => set({ error: null })
}));
