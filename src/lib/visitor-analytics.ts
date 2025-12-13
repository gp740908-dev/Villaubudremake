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
  const { data: rawData, error } = await supabase.functions.invoke('get-analytics');

  if (error) {
    console.error(`Error fetching visitor analytics: ${error.message}`);
    // Return a default, empty state instead of throwing an error
    return {
      totalViews: 0,
      pageViews: [],
      topPages: [],
      topCountries: [],
    };
  }

  // Gracefully handle cases where there is no data or no page views
  if (!rawData || !rawData.pageViews || rawData.pageViews.length === 0) {
    return {
      totalViews: 0,
      pageViews: [],
      topPages: [],
      topCountries: [],
    };
  }

  const pageViews = rawData.pageViews as PageView[];

  const pageCounts = pageViews.reduce((acc, view) => {
    acc[view.path] = (acc[view.path] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPages = Object.entries(pageCounts)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5); // Limit to top 5 for a cleaner UI

  const countryCounts = pageViews.reduce((acc, view) => {
    if (view.country) {
      acc[view.country] = (acc[view.country] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topCountries = Object.entries(countryCounts)
    .map(([country, views]) => ({ country, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5); // Limit to top 5

  return {
    totalViews: rawData.totalViews || 0,
    pageViews: pageViews,
    topPages,
    topCountries,
  };
};
