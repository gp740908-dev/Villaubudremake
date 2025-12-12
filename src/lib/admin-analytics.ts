import { supabase } from './supabase';
import { subMonths, startOfMonth, endOfMonth, format, differenceInDays } from 'date-fns';

export const getDashboardAnalytics = async () => {
  const now = new Date();

  // --- DATE RANGES ---
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // --- DATABASE FETCHES ---
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, created_at, total_price, check_in, check_out, villa_id, guests, status, guest_name, guest_phone');

  if (bookingsError) throw new Error(bookingsError.message);
  if (!bookings) return null;

  const { data: villas, error: villasError } = await supabase.from('villas').select('id, name, images');
  if (villasError) throw new Error(villasError.message);
  if (!villas) return null;

  // --- DATA PROCESSING ---
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const villaMap = new Map(villas.map(v => [v.id, { name: v.name, image: v.images?.[0] || '' }]));

  // --- KPI CALCULATIONS ---
  const currentMonthConfirmedBookings = confirmedBookings.filter(b => {
      const createdAt = new Date(b.created_at);
      return createdAt >= currentMonthStart && createdAt <= currentMonthEnd;
  });
  const lastMonthConfirmedBookings = confirmedBookings.filter(b => {
    const createdAt = new Date(b.created_at);
    return createdAt >= lastMonthStart && createdAt <= lastMonthEnd;
  });

  const totalBookings = {
    value: currentMonthConfirmedBookings.length,
    previousValue: lastMonthConfirmedBookings.length
  };
  const revenue = {
    value: currentMonthConfirmedBookings.reduce((sum, b) => sum + b.total_price, 0),
    previousValue: lastMonthConfirmedBookings.reduce((sum, b) => sum + b.total_price, 0),
  };

  const calculateOccupancy = (startDate, endDate, bookings, villas) => {
    const totalDays = differenceInDays(endDate, startDate) + 1;
    const totalVillaDays = villas.length * totalDays;
    if (totalVillaDays === 0) return 0;

    const bookedDays = bookings.reduce((acc, b) => {
      const start = new Date(b.check_in);
      const end = new Date(b.check_out);
      const overlapStart = start > startDate ? start : startDate;
      const overlapEnd = end < endDate ? end : endDate;
      return acc + (overlapEnd > overlapStart ? differenceInDays(overlapEnd, overlapStart) : 0);
    }, 0);

    return Math.round((bookedDays / totalVillaDays) * 100);
  };

  const occupancyRate = {
    value: calculateOccupancy(currentMonthStart, currentMonthEnd, confirmedBookings, villas),
    previousValue: calculateOccupancy(lastMonthStart, lastMonthEnd, confirmedBookings, villas)
  };
  
  const totalNightsBooked = confirmedBookings.reduce((sum, b) => sum + differenceInDays(new Date(b.check_out), new Date(b.check_in)), 0);

  // --- CHART & LISTS ---
  const revenueChartData = Array.from({ length: 12 }).map((_, i) => {
    const month = subMonths(now, i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const monthName = format(month, 'MMM');

    const monthRevenue = confirmedBookings
      .filter(b => { const createdAt = new Date(b.created_at); return createdAt >= monthStart && createdAt <= monthEnd; })
      .reduce((sum, b) => sum + b.total_price, 0);

    return { month: monthName, revenue: monthRevenue };
  }).reverse();

  const recentBookings = bookings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)
    .map(b => ({
      id: b.id,
      guestName: b.guest_name || 'Guest',
      villaName: villaMap.get(b.villa_id)?.name || 'Unknown Villa',
      total: b.total_price,
      status: b.status,
    }));

  const villaPerformance = villas.map(villa => {
    const villaBookings = confirmedBookings.filter(b => b.villa_id === villa.id);
    const villaRevenue = villaBookings.reduce((sum, b) => sum + b.total_price, 0);
    const currentMonthDays = differenceInDays(currentMonthEnd, currentMonthStart) + 1;

    const bookedNightsInMonth = villaBookings.reduce((acc, b) => {
        const start = new Date(b.check_in);
        const end = new Date(b.check_out);
        const overlapStart = start > currentMonthStart ? start : currentMonthStart;
        const overlapEnd = end < currentMonthEnd ? end : currentMonthEnd;
        return acc + (overlapEnd > overlapStart ? differenceInDays(overlapEnd, overlapStart) : 0);
    }, 0);

    const occupancy = currentMonthDays > 0 ? Math.round((bookedNightsInMonth / currentMonthDays) * 100) : 0;

    return {
      id: villa.id,
      name: villa.name,
      image: villaMap.get(villa.id)?.image || '',
      totalBookings: villaBookings.length,
      revenue: villaRevenue,
      occupancyRate: occupancy,
      avgRating: 0, // Requires reviews table
    };
  }).sort((a,b) => b.revenue - a.revenue);

  const upcomingCheckins = confirmedBookings.filter(b => {
      const checkInDate = new Date(b.check_in)
      return checkInDate > now && checkInDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  }).map(b => ({
      id: b.id,
      guestName: b.guest_name || 'Guest',
      villaName: villaMap.get(b.villa_id)?.name || 'Unknown Villa',
      checkInDate: b.check_in,
      phone: b.guest_phone || '-',
      guests: b.guests,
  })).sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime());


  return {
    kpis: {
      totalBookings,
      revenue,
      occupancyRate,
      activeVillas: { value: villas.length, total: villas.length },
    },
    revenueChartData,
    recentBookings,
    villaPerformance,
    upcomingCheckins,
    analyticsData: {
      bookingAnalytics: {
        conversionRate: 0, // Requires website traffic data
        avgBookingValue: confirmedBookings.length > 0 ? confirmedBookings.reduce((sum, b) => sum + b.total_price, 0) / confirmedBookings.length : 0,
        avgLengthOfStay: confirmedBookings.length > 0 ? totalNightsBooked / confirmedBookings.length : 0,
      },
      // The following require a 3rd party analytics integration (e.g., Google Analytics, Vercel Analytics)
      visitors: { total: 0, unique: 0, pageViews: 0, avgSessionDuration: '0m 0s', bounceRate: 0 },
      topPages: [],
      bookingSources: [],
      trafficSources: [],
      deviceDistribution: [],
      topCountries: [],
    },
  };
};
