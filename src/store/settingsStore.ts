import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Setting } from '@/lib/database.types';

interface SettingsState {
    settings: Record<string, unknown>;
    isLoading: boolean;
    error: string | null;

    fetchSettings: () => Promise<void>;
    updateSetting: (key: string, value: unknown) => Promise<boolean>;
    getSetting: (key: string) => unknown;
    clearError: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: {},
    isLoading: false,
    error: null,

    fetchSettings: async () => {
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase
                .from('settings')
                .select('*');

            if (error) throw error;

            const settingsMap: Record<string, unknown> = {};
            (data as Setting[]).forEach(s => {
                settingsMap[s.key] = s.value;
            });

            set({ settings: settingsMap, isLoading: false });
        } catch (err) {
            console.error('Error fetching settings:', err);
            set({ isLoading: false, error: 'Failed to fetch settings' });
        }
    },

    updateSetting: async (key, value) => {
        set({ isLoading: true, error: null });

        try {
            const { error } = await supabase
                .from('settings')
                .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

            if (error) throw error;

            set(state => ({
                settings: { ...state.settings, [key]: value },
                isLoading: false
            }));
            return true;
        } catch (err) {
            console.error('Error updating setting:', err);
            set({ isLoading: false, error: 'Failed to update setting' });
            return false;
        }
    },

    getSetting: (key) => get().settings[key],
    clearError: () => set({ error: null })
}));
