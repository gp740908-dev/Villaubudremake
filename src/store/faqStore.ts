import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface FAQ {
  id?: number;
  question: string;
  answer: string;
  category: string;
}

interface FaqState {
  faqs: FAQ[];
  isLoading: boolean;
  fetchFaqs: () => Promise<void>;
  addFaq: (faq: FAQ) => Promise<void>;
  updateFaq: (faq: FAQ) => Promise<void>;
  deleteFaq: (id: number) => Promise<void>;
}

export const useFaqStore = create<FaqState>((set, get) => ({
  faqs: [],
  isLoading: false,
  fetchFaqs: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase.from('faqs').select('*');
    if (error) {
      console.error('Error fetching FAQs:', error);
      toast({
        title: 'Error fetching FAQs',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      set({ faqs: data as FAQ[] });
    }
    set({ isLoading: false });
  },
  addFaq: async (faq) => {
    set({ isLoading: true });
    const { data, error } = await supabase.from('faqs').insert([faq]).select();
    if (error) {
      console.error('Error adding FAQ:', error);
      toast({
        title: 'Error adding FAQ',
        description: error.message,
        variant: 'destructive',
      });
    } else if (data) {
        //get().fetchFaqs();
        set((state) => ({ faqs: [...state.faqs, ...data]}));
      toast({
        title: 'FAQ added',
        description: 'The new FAQ has been added successfully.',
      });
    }
    set({ isLoading: false });
  },
  updateFaq: async (faq) => {
    set({ isLoading: true });
    const { error } = await supabase.from('faqs').update(faq).eq('id', faq.id);
    if (error) {
      console.error('Error updating FAQ:', error);
      toast({
        title: 'Error updating FAQ',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      get().fetchFaqs();
      toast({
        title: 'FAQ updated',
        description: 'The FAQ has been updated successfully.',
      });
    }
    set({ isLoading: false });
  },
  deleteFaq: async (id) => {
    set({ isLoading: true });
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) {
      console.error('Error deleting FAQ:', error);
      toast({
        title: 'Error deleting FAQ',
        description: error.message,
        variant: 'destructive',
      });
    } else {
        set((state) => ({ faqs: state.faqs.filter((faq) => faq.id !== id) }));
      toast({
        title: 'FAQ deleted',
        description: 'The FAQ has been deleted successfully.',
      });
    }
    set({ isLoading: false });
  },
}));