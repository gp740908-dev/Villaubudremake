import { supabase } from './supabase';
import { subMonths, startOfMonth, endOfMonth, format, differenceInDays } from 'date-fns';

export const getDashboardAnalytics = async () => {
  const now = new Date();

  // Fetch all confirmed bookings
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, created_at, total_price, check_in, check_out, villa_id, guests, status, guest_name')
    // .eq('status', 'confirmed'); // We may want to see all statuses for some analytics, let's filter in code

  if (bookingsError) throw new Error(bookingsError.message);
  if (!bookings) return null;

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

  // Fetch all villas
  const { data: villas, error: villasError } = await supabase.from('villas').select('id, name, images');
  if (villasError) throw new Error(villasError.message);
  if (!villas) return null;

  const villaMap = new Map(villas.map(v => [v.id, { name: v.name, image: v.images?.[0] || '' }]));

  // --- CALCULATIONS ---
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // 1. KPIs
  const currentMonthBookings = confirmedBookings.filter(b => {
      const createdAt = new Date(b.created_at);
      return createdAt >= currentMonthStart && createdAt <= currentMonthEnd;
  });
  const lastMonthBookings = confirmedBookings.filter(b => {
    const createdAt = new Date(b.created_at);
    return createdAt >= lastMonthStart && createdAt <= lastMonthEnd;
  });

  const totalBookings = { value: currentMonthBookings.length, previousValue: lastMonthBookings.length };
  const revenue = {
    value: currentMonthBookings.reduce((sum, b) => sum + b.total_price, 0),
    previousValue: lastMonthBookings.reduce((sum, b) => sum + b.total_price, 0),
  };

  // Occupancy Rate (all villas, current month)
  const totalDaysInMonth = differenceInDays(endOfMonth(now), startOfMonth(now)) + 1;
  const totalVillaDays = villas.length * totalDaysInMonth;
  const bookedDaysThisMonth = confirmedBookings.reduce((acc, b) => {
    const start = new Date(b.check_in);
    const end = new Date(b.check_out);
    const overlapStart = start > currentMonthStart ? start : currentMonthStart;
    const overlapEnd = end < currentMonthEnd ? end : currentMonthEnd;
    return acc + (overlapEnd > overlapStart ? differenceInDays(overlapEnd, overlapStart) : 0);
  }, 0);

  const occupancyRate = { value: totalVillaDays > 0 ? Math.round((bookedDaysThisMonth / totalVillaDays) * 100) : 0, previousValue: 0 }; // Placeholder for prev value

  // 2. Revenue Chart (Last 12 months, based on confirmed bookings)
  const revenueChartData = Array.from({ length: 12 }).map((_, i) => {
    const month = subMonths(now, i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const monthName = format(month, 'MMM');

    const monthRevenue = confirmedBookings
      .filter(b => {
        const createdAt = new Date(b.created_at);
        return createdAt >= monthStart && createdAt <= monthEnd;
      })
      .reduce((sum, b) => sum + b.total_price, 0);

    return { month: monthName, revenue: monthRevenue };
  }).reverse();

  // 3. Recent Bookings (all statuses)
  const recentBookings = bookings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)
    .map(b => ({
      id: b.id,
      referenceNumber: b.reference_number || b.id.slice(0, 8).toUpperCase(), 
      guestName: b.guest_name || 'Guest',
      villaName: villaMap.get(b.villa_id)?.name || 'Unknown Villa',
      checkIn: b.check_in,
      checkOut: b.check_out,
      total: b.total_price,
      status: b.status as any,
    }));

  // 4. Villa Performance
  const villaPerformance = villas.map(villa => {
    const villaBookings = confirmedBookings.filter(b => b.villa_id === villa.id);
    const villaRevenue = villaBookings.reduce((sum, b) => sum + b.total_price, 0);

    let bookedNightsInMonth = 0;
    villaBookings.forEach(booking => {
        const start = new Date(booking.check_in);
        const end = new Date(booking.check_out);
        const overlapStart = start > currentMonthStart ? start : currentMonthStart;
        const overlapEnd = end < currentMonthEnd ? end : currentMonthEnd;
        const nights = (overlapEnd > overlapStart ? differenceInDays(overlapEnd, overlapStart) : 0);
        bookedNightsInMonth += nights;
    });
    const occupancy = totalDaysInMonth > 0 ? Math.round((bookedNightsInMonth / totalDaysInMonth) * 100) : 0;

    return {
      id: villa.id,
      name: villa.name,
      image: villa.images?.[0] || '',
      totalBookings: villaBookings.length,
      revenue: villaRevenue,
      occupancyRate: occupancy, 
      avgRating: 0, // Requires reviews table
    };
  }).sort((a,b) => b.revenue - a.revenue);

  // 5. Upcoming Check-ins (confirmed, next 7 days)
  const upcomingCheckins = confirmedBookings.filter(b => {
      const checkInDate = new Date(b.check_in)
      return checkInDate > now && checkInDate < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  }).map(b => ({
      id: b.id,
      guestName: b.guest_name || 'Guest',
      villaName: villaMap.get(b.villa_id)?.name || 'Unknown Villa',
      checkInDate: b.check_in,
      checkInTime: '14:00', // Placeholder
      phone: '-', // Placeholder
      guests: b.guests,
  }))


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
    // Placeholder for data not available from bookings table
    analyticsData: {
      visitors: { total: 0, unique: 0, pageViews: 0, avgSessionDuration: '0m 0s', bounceRate: 0 },
      topPages: [],
      bookingAnalytics: { conversionRate: 0, avgBookingValue: 0, avgLengthOfStay: 0 },
      bookingSources: [],
      trafficSources: [],
      deviceDistribution: [],
      topCountries: [],
    },
  };
};
