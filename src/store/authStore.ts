import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { AdminUser } from '@/lib/database.types';

interface AuthState {
    user: AdminUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    checkSession: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });

                try {
                    // Query admin_users table for matching credentials
                    const { data, error } = await supabase
                        .from('admin_users')
                        .select('*')
                        .eq('email', email)
                        .eq('password_hash', password) // In production, use proper password hashing
                        .eq('is_active', true)
                        .single();

                    if (error || !data) {
                        set({
                            isLoading: false,
                            error: 'Invalid email or password',
                            isAuthenticated: false,
                            user: null
                        });
                        return false;
                    }

                    // Update last login
                    await supabase
                        .from('admin_users')
                        .update({ last_login: new Date().toISOString() })
                        .eq('id', data.id);

                    set({
                        user: data as AdminUser,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    return true;
                } catch (err) {
                    console.error('Login error:', err);
                    set({
                        isLoading: false,
                        error: 'An error occurred during login',
                        isAuthenticated: false,
                        user: null
                    });
                    return false;
                }
            },

            logout: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                    error: null
                });
            },

            checkSession: () => {
                const state = get();
                // Session is valid if user exists
                if (!state.user) {
                    set({ isAuthenticated: false });
                }
            },

            clearError: () => {
                set({ error: null });
            }
        }),
        {
            name: 'admin-auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
