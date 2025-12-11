import { villas } from '@/data/villas';

// Dashboard KPIs
export const dashboardKPIs = {
    totalBookings: {
        value: 47,
        previousValue: 38,
        trend: 'up' as const,
        percentChange: 23.7,
    },
    revenue: {
        value: 156800000, // IDR
        previousValue: 128500000,
        trend: 'up' as const,
        percentChange: 22.0,
    },
    occupancyRate: {
        value: 78,
        previousValue: 72,
        trend: 'up' as const,
        percentChange: 8.3,
    },
    activeVillas: {
        value: 4,
        total: 4,
    },
};

// Revenue Chart Data (Last 12 months)
export const revenueChartData = [
    { month: 'Jan', revenue: 89000000 },
    { month: 'Feb', revenue: 72000000 },
    { month: 'Mar', revenue: 98000000 },
    { month: 'Apr', revenue: 115000000 },
    { month: 'May', revenue: 132000000 },
    { month: 'Jun', revenue: 145000000 },
    { month: 'Jul', revenue: 168000000 },
    { month: 'Aug', revenue: 178000000 },
    { month: 'Sep', revenue: 142000000 },
    { month: 'Oct', revenue: 128000000 },
    { month: 'Nov', revenue: 138000000 },
    { month: 'Dec', revenue: 156800000 },
];

// Recent Bookings
export const recentBookings = [
    {
        id: 'SU-ABC123',
        guestName: 'John Smith',
        villaId: '1',
        villaName: 'Serenity Pool Villa',
        checkIn: '2024-12-15',
        checkOut: '2024-12-18',
        total: 14700000,
        status: 'confirmed' as const,
    },
    {
        id: 'SU-DEF456',
        guestName: 'Emma Watson',
        villaId: '2',
        villaName: 'Jungle Hideaway',
        checkIn: '2024-12-14',
        checkOut: '2024-12-17',
        total: 10800000,
        status: 'confirmed' as const,
    },
    {
        id: 'SU-GHI789',
        guestName: 'Michael Chen',
        villaId: '3',
        villaName: 'Canopy Treehouse',
        checkIn: '2024-12-13',
        checkOut: '2024-12-15',
        total: 8400000,
        status: 'pending' as const,
    },
    {
        id: 'SU-JKL012',
        guestName: 'Sophie Miller',
        villaId: '4',
        villaName: 'Royal Joglo Estate',
        checkIn: '2024-12-20',
        checkOut: '2024-12-25',
        total: 37500000,
        status: 'confirmed' as const,
    },
    {
        id: 'SU-MNO345',
        guestName: 'David Brown',
        villaId: '1',
        villaName: 'Serenity Pool Villa',
        checkIn: '2024-12-10',
        checkOut: '2024-12-12',
        total: 9800000,
        status: 'cancelled' as const,
    },
    {
        id: 'SU-PQR678',
        guestName: 'Lisa Anderson',
        villaId: '2',
        villaName: 'Jungle Hideaway',
        checkIn: '2024-12-22',
        checkOut: '2024-12-26',
        total: 14400000,
        status: 'confirmed' as const,
    },
    {
        id: 'SU-STU901',
        guestName: 'James Wilson',
        villaId: '3',
        villaName: 'Canopy Treehouse',
        checkIn: '2024-12-18',
        checkOut: '2024-12-20',
        total: 8400000,
        status: 'confirmed' as const,
    },
    {
        id: 'SU-VWX234',
        guestName: 'Anna Taylor',
        villaId: '4',
        villaName: 'Royal Joglo Estate',
        checkIn: '2024-12-28',
        checkOut: '2025-01-02',
        total: 37500000,
        status: 'pending' as const,
    },
];

// Villa Occupancy Data
export const villaOccupancy = villas.map((villa) => ({
    id: villa.id,
    name: villa.name,
    image: villa.images[0],
    occupancyRate: Math.floor(Math.random() * 30) + 60, // 60-90%
    bookedDates: villa.bookedDates.slice(0, 10),
}));

// Upcoming Check-ins
export const upcomingCheckins = [
    {
        id: '1',
        guestName: 'John Smith',
        villaName: 'Serenity Pool Villa',
        checkInDate: new Date().toISOString().split('T')[0],
        checkInTime: '15:00',
        phone: '+1 234 567 8900',
        guests: 2,
    },
    {
        id: '2',
        guestName: 'Emma Watson',
        villaName: 'Jungle Hideaway',
        checkInDate: new Date().toISOString().split('T')[0],
        checkInTime: '14:00',
        phone: '+44 789 012 3456',
        guests: 3,
    },
    {
        id: '3',
        guestName: 'Michael Chen',
        villaName: 'Canopy Treehouse',
        checkInDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        checkInTime: '15:00',
        phone: '+86 123 456 7890',
        guests: 2,
    },
];

// Analytics Data
export const analyticsData = {
    visitors: {
        total: 12453,
        unique: 8932,
        pageViews: 45678,
        avgSessionDuration: '3m 42s',
        bounceRate: 42.3,
    },
    topPages: [
        { page: 'Homepage', views: 15234, percentage: 33 },
        { page: 'Villas', views: 12456, percentage: 27 },
        { page: 'Villa Detail', views: 8934, percentage: 20 },
        { page: 'Checkout', views: 4532, percentage: 10 },
        { page: 'About Us', views: 2345, percentage: 5 },
        { page: 'Contact', views: 2177, percentage: 5 },
    ],
    bookingAnalytics: {
        conversionRate: 3.8,
        avgBookingValue: 12500000,
        avgLengthOfStay: 3.2,
    },
    bookingSources: [
        { source: 'Direct', value: 42, color: '#778873' },
        { source: 'Google', value: 28, color: '#A1BC98' },
        { source: 'Social Media', value: 18, color: '#D2DCB6' },
        { source: 'Referral', value: 8, color: '#F1F3E0' },
        { source: 'Paid Ads', value: 4, color: '#5a6a56' },
    ],
    popularMonths: [
        { month: 'Jul', bookings: 58 },
        { month: 'Aug', bookings: 62 },
        { month: 'Dec', bookings: 55 },
        { month: 'Jun', bookings: 48 },
        { month: 'Apr', bookings: 42 },
        { month: 'May', bookings: 40 },
    ],
    villaPerformance: [
        {
            id: '1',
            name: 'Serenity Pool Villa',
            totalBookings: 89,
            revenue: 436100000,
            occupancyRate: 82,
            avgRating: 4.9,
        },
        {
            id: '2',
            name: 'Jungle Hideaway',
            totalBookings: 76,
            revenue: 273600000,
            occupancyRate: 75,
            avgRating: 4.8,
        },
        {
            id: '3',
            name: 'Canopy Treehouse',
            totalBookings: 64,
            revenue: 268800000,
            occupancyRate: 68,
            avgRating: 4.9,
        },
        {
            id: '4',
            name: 'Royal Joglo Estate',
            totalBookings: 42,
            revenue: 315000000,
            occupancyRate: 72,
            avgRating: 4.8,
        },
    ],
    trafficSources: [
        { source: 'Organic Search', visitors: 5234, percentage: 42, color: '#778873' },
        { source: 'Direct', visitors: 3456, percentage: 28, color: '#A1BC98' },
        { source: 'Social Media', visitors: 1867, percentage: 15, color: '#D2DCB6' },
        { source: 'Referral', visitors: 1234, percentage: 10, color: '#5a6a56' },
        { source: 'Paid Ads', visitors: 662, percentage: 5, color: '#F1F3E0' },
    ],
    deviceDistribution: [
        { device: 'Desktop', percentage: 45, color: '#778873' },
        { device: 'Mobile', percentage: 48, color: '#A1BC98' },
        { device: 'Tablet', percentage: 7, color: '#D2DCB6' },
    ],
    topCountries: [
        { country: 'United States', visitors: 2845, flag: '🇺🇸' },
        { country: 'Australia', visitors: 2134, flag: '🇦🇺' },
        { country: 'United Kingdom', visitors: 1567, flag: '🇬🇧' },
        { country: 'Singapore', visitors: 1234, flag: '🇸🇬' },
        { country: 'Germany', visitors: 987, flag: '🇩🇪' },
        { country: 'France', visitors: 876, flag: '🇫🇷' },
        { country: 'Netherlands', visitors: 654, flag: '🇳🇱' },
        { country: 'Canada', visitors: 543, flag: '🇨🇦' },
        { country: 'Japan', visitors: 432, flag: '🇯🇵' },
        { country: 'Indonesia', visitors: 398, flag: '🇮🇩' },
    ],
};
