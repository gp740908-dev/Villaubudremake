import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Villa } from '@/lib/database.types';

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
                .from('villas')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            set({
                villas: data as Villa[],
                isLoading: false
            });
        } catch (err) {
            console.error('Error fetching villas:', err);
            set({
                isLoading: false,
                error: 'Failed to fetch villas'
            });
        }
    },

    createVilla: async (villa) => {
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase
                .from('villas')
                .insert([villa])
                .select()
                .single();

            if (error) throw error;

            const newVilla = data as Villa;
            set(state => ({
                villas: [newVilla, ...state.villas],
                isLoading: false
            }));

            return newVilla;
        } catch (err) {
            console.error('Error creating villa:', err);
            set({
                isLoading: false,
                error: 'Failed to create villa'
            });
            return null;
        }
    },

    updateVilla: async (id, updates) => {
        set({ isLoading: true, error: null });

        try {
            const { error } = await supabase
                .from('villas')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            set(state => ({
                villas: state.villas.map(v =>
                    v.id === id ? { ...v, ...updates } : v
                ),
                isLoading: false
            }));

            return true;
        } catch (err) {
            console.error('Error updating villa:', err);
            set({
                isLoading: false,
                error: 'Failed to update villa'
            });
            return false;
        }
    },

    deleteVilla: async (id) => {
        set({ isLoading: true, error: null });

        try {
            const { error } = await supabase
                .from('villas')
                .delete()
                .eq('id', id);

            if (error) throw error;

            set(state => ({
                villas: state.villas.filter(v => v.id !== id),
                isLoading: false
            }));

            return true;
        } catch (err) {
            console.error('Error deleting villa:', err);
            set({
                isLoading: false,
                error: 'Failed to delete villa'
            });
            return false;
        }
    },

    getVillaById: (id) => {
        return get().villas.find(v => v.id === id);
    },

    clearError: () => {
        set({ error: null });
    }
}));
