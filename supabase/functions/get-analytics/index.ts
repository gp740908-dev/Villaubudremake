import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

export default async function handler(req: any) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data: pageViews, error } = await supabase
      .from('page_views')
      .select('id, created_at, path, country, city, referrer')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching page views:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Here you can perform additional data processing and aggregation.
    // For example, you could count unique visitors, top pages, referrers, etc.
    const analyticsData = {
      totalViews: pageViews.length,
      pageViews: pageViews,
    };

    return new Response(JSON.stringify(analyticsData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analytics function:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
