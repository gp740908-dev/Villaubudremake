import { supabase } from './supabase';

export interface PageView {
  id: number;
  created_at: string;
  path: string;
  country: string | null;
  city: string | null;
  referrer: string | null;
}

export interface VisitorAnalytics {
  totalViews: number;
  pageViews: PageView[];
  topPages: { path: string; views: number }[];
  topCountries: { country: string; views: number }[];
}

export const getVisitorAnalytics = async (): Promise<VisitorAnalytics> => {
  const { data, error } = await supabase.functions.invoke('get-analytics');

  if (error) {
    throw new Error(`Failed to fetch visitor analytics: ${error.message}`);
  }

  // Process the raw data to get top pages and countries
  const pageViews = data.pageViews as PageView[];

  const pageCounts = pageViews.reduce((acc, view) => {
    acc[view.path] = (acc[view.path] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPages = Object.entries(pageCounts)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const countryCounts = pageViews.reduce((acc, view) => {
    if (view.country) {
        acc[view.country] = (acc[view.country] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topCountries = Object.entries(countryCounts)
    .map(([country, views]) => ({ country, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return {
    ...data,
    topPages,
    topCountries,
  };
};
