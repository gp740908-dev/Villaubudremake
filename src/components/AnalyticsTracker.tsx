import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const trackView = async () => {
      try {
        // We don't want to track admin pages
        if (location.pathname.startsWith('/admin')) {
          return;
        }

        await supabase.from('page_views').insert({
          path: location.pathname,
          referrer: document.referrer,
        });
      } catch (error) {
        // console.error('Error tracking page view:', error);
        // Silently fail to avoid disrupting user experience.
      }
    };

    trackView();
  }, [location.pathname]);

  return null; // This component does not render anything
};

export default AnalyticsTracker;
