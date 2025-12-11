import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { BlogPost, BlogCategory } from '@/lib/database.types';

interface BlogState {
    posts: BlogPost[];
    categories: BlogCategory[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchPosts: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    createPost: (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'views'>) => Promise<BlogPost | null>;
    updatePost: (id: string, updates: Partial<BlogPost>) => Promise<boolean>;
    deletePost: (id: string) => Promise<boolean>;
    getPostById: (id: string) => BlogPost | undefined;
    getPostBySlug: (slug: string) => BlogPost | undefined;
    clearError: () => void;
}

export const useBlogStore = create<BlogState>((set, get) => ({
    posts: [],
    categories: [],
    isLoading: false,
    error: null,

    fetchPosts: async () => {
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select(`
          *,
          category:blog_categories(*)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            set({
                posts: data as BlogPost[],
                isLoading: false
            });
        } catch (err) {
            console.error('Error fetching posts:', err);
            set({
                isLoading: false,
                error: 'Failed to fetch blog posts'
            });
        }
    },

    fetchCategories: async () => {
        try {
            const { data, error } = await supabase
                .from('blog_categories')
                .select('*')
                .order('name');

            if (error) throw error;

            set({ categories: data as BlogCategory[] });
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    },

    createPost: async (post) => {
        set({ isLoading: true, error: null });

        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .insert([post])
                .select()
                .single();

            if (error) throw error;

            const newPost = data as BlogPost;
            set(state => ({
                posts: [newPost, ...state.posts],
                isLoading: false
            }));

            return newPost;
        } catch (err) {
            console.error('Error creating post:', err);
            set({
                isLoading: false,
                error: 'Failed to create blog post'
            });
            return null;
        }
    },

    updatePost: async (id, updates) => {
        set({ isLoading: true, error: null });

        try {
            const { error } = await supabase
                .from('blog_posts')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            set(state => ({
                posts: state.posts.map(p =>
                    p.id === id ? { ...p, ...updates } : p
                ),
                isLoading: false
            }));

            return true;
        } catch (err) {
            console.error('Error updating post:', err);
            set({
                isLoading: false,
                error: 'Failed to update blog post'
            });
            return false;
        }
    },

    deletePost: async (id) => {
        set({ isLoading: true, error: null });

        try {
            const { error } = await supabase
                .from('blog_posts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            set(state => ({
                posts: state.posts.filter(p => p.id !== id),
                isLoading: false
            }));

            return true;
        } catch (err) {
            console.error('Error deleting post:', err);
            set({
                isLoading: false,
                error: 'Failed to delete blog post'
            });
            return false;
        }
    },

    getPostById: (id) => {
        return get().posts.find(p => p.id === id);
    },

    getPostBySlug: (slug) => {
        return get().posts.find(p => p.slug === slug);
    },

    clearError: () => {
        set({ error: null });
    }
}));
