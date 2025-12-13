import { useEffect, useState } from 'react';
import {
    Download,
    RefreshCw,
    Users,
    Eye,
    Clock,
    MousePointer,
    TrendingUp,
    Calendar,
    Smartphone,
    Monitor,
    Tablet,
    Loader2,
    BarChart2,
    MapPin
} from 'lucide-react';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { getDashboardAnalytics } from '@/lib/admin-analytics';
import { getVisitorAnalytics, VisitorAnalytics } from '@/lib/visitor-analytics';

// Define types for our analytics data
type BookingAnalyticsState = Awaited<ReturnType<typeof getDashboardAnalytics>>;

// Format currency
const formatIDR = (value: number) => {
    if (value >= 1000000000) return `IDR ${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `IDR ${(value / 1000000).toFixed(1)}M`;
    return `IDR ${value.toLocaleString()}`;
};


// Stat Card Component
const StatCard = ({
    title,
    value,
    icon: Icon,
    subtext,
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    subtext?: string;
}) => (
    <div className="admin-card p-4">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#A1BC98]/20 flex items-center justify-center">
                <Icon size={20} className="text-[#778873]" />
            </div>
            <div>
                <p className="text-xs text-[#6b7c67] uppercase tracking-wide">{title}</p>
                <p className="text-xl font-bold text-[#2d3a29]">{value}</p>
                {subtext && <p className="text-xs text-[#6b7c67]">{subtext}</p>}
            </div>
        </div>
    </div>
);

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-[#d4dbc8]">
                <p className="text-sm font-medium text-[#2d3a29]">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const AdminAnalytics = () => {
    const [bookingAnalytics, setBookingAnalytics] = useState<BookingAnalyticsState | null>(null);
    const [visitorAnalytics, setVisitorAnalytics] = useState<VisitorAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<string | null>('revenue');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch both booking and visitor analytics in parallel
            const [bookingData, visitorData] = await Promise.all([
                getDashboardAnalytics(),
                getVisitorAnalytics(),
            ]);
            setBookingAnalytics(bookingData);
            setVisitorAnalytics(visitorData);
        } catch (e: any) {
            setError(e.message || 'Failed to load analytics data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };
    
    const sortedVillaPerformance = bookingAnalytics ? [...bookingAnalytics.villaPerformance].sort((a, b) => {
        if (!sortColumn) return 0;
        const aVal = a[sortColumn as keyof typeof a];
        const bVal = b[sortColumn as keyof typeof b];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
    }) : [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-[#778873]" />
            </div>
        );
    }

    if (error || !bookingAnalytics || !visitorAnalytics) {
        return (
             <div className="text-red-500 bg-red-100 p-4 rounded-lg">
                <p className="font-bold">Error loading analytics:</p>
                <p>{error || 'No data available.'}</p>
                <button onClick={fetchData} className="mt-2 admin-btn admin-btn-outline">
                    Try Again
                </button>
            </div>
        );
    }
    
    const { analyticsData } = bookingAnalytics;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#2d3a29]">Analytics</h1>
                    <p className="text-sm text-[#6b7c67]">
                        Track your website and booking performance.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="admin-btn admin-btn-outline">
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Visitor Analytics */}
            <div className="admin-card p-6">
                <h2 className="admin-section-title">Visitor Analytics</h2>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <StatCard title="Total Views" value={visitorAnalytics.totalViews.toLocaleString()} icon={Eye} />
                    <StatCard title="Page Views" value={visitorAnalytics.pageViews.length.toLocaleString()} icon={MousePointer} />
                    {/* Placeholders for metrics not yet implemented */}
                    <StatCard title="Unique Visitors" value="N/A" icon={Users} />
                    <StatCard title="Avg Session" value="N/A" icon={Clock} />
                    <StatCard title="Bounce Rate" value="N/A" icon={TrendingUp} />
                </div>

                <h3 className="text-sm font-semibold text-[#2d3a29] mb-4">Top Pages Visited</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={visitorAnalytics.topPages} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                            <XAxis dataKey="path" tick={{ fill: '#6b7c67', fontSize: 12 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fill: '#6b7c67', fontSize: 12 }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F4F6F1' }} />
                            <Bar dataKey="views" name="Views" fill="#A1BC98" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Countries */}
             <div className="admin-card p-6">
                <h2 className="admin-section-title">Top Countries</h2>
                 <div className="-mx-6 -mb-6">
                    <ul className="divide-y divide-[#d4dbc8]">
                        {visitorAnalytics.topCountries.map((country, index) => (
                             <li key={index} className="flex items-center justify-between px-6 py-3 hover:bg-[#F4F6F1]">
                                <div className="flex items-center gap-3">
                                     <MapPin size={16} className="text-[#778873]" />
                                     <span className="font-medium text-[#2d3a29]">{country.country || 'Unknown'}</span>
                                </div>
                                 <span className="font-bold text-[#2d3a29]">{country.views.toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>
                 </div>
                 {visitorAnalytics.topCountries.length === 0 && (
                     <div className="text-center text-gray-400 py-12">
                        <p>Geographic data not yet available.</p>
                    </div>
                 )}
            </div>

            {/* Booking Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="admin-card p-6">
                    <h2 className="admin-section-title">Booking Analytics</h2>
                     <div className="grid grid-cols-3 gap-4 mb-6">
                        <StatCard title="Conversion Rate" value={`${analyticsData.bookingAnalytics.conversionRate}%`} icon={TrendingUp} />
                        <StatCard title="Avg Booking Value" value={formatIDR(analyticsData.bookingAnalytics.avgBookingValue)} icon={Calendar} />
                        <StatCard title="Avg Stay Length" value={`${analyticsData.bookingAnalytics.avgLengthOfStay} nights`} icon={Clock} />
                    </div>
                </div>

                <div className="admin-card p-6">
                    <h2 className="admin-section-title">Booking Sources</h2>
                    <div className="h-64 text-center text-gray-400 flex items-center justify-center">
                         <p>Booking source data not yet available.</p>
                    </div>
                </div>
            </div>

            {/* Villa Performance Table */}
            <div className="admin-card">
                <div className="p-6 border-b border-[#d4dbc8]">
                    <h2 className="admin-section-title mb-0">Villa Performance</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Villa Name</th>
                                <th className="cursor-pointer hover:bg-[#D2DCB6]" onClick={() => handleSort('totalBookings')}>
                                    Total Bookings {sortColumn === 'totalBookings' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="cursor-pointer hover:bg-[#D2DCB6]" onClick={() => handleSort('revenue')}>
                                    Revenue {sortColumn === 'revenue' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="cursor-pointer hover:bg-[#D2DCB6]" onClick={() => handleSort('occupancyRate')}>
                                    Occupancy {sortColumn === 'occupancyRate' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="cursor-pointer hover:bg-[#D2DCB6]" onClick={() => handleSort('avgRating')}>
                                    Avg Rating {sortColumn === 'avgRating' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                           {sortedVillaPerformance.map((villa) => (
                                <tr key={villa.id}>
                                    <td className="font-medium flex items-center gap-3">
                                        <img src={villa.image} alt={villa.name} className="w-10 h-10 rounded-lg object-cover" />
                                        {villa.name}
                                    </td>
                                    <td>{villa.totalBookings}</td>
                                    <td className="font-semibold">{formatIDR(villa.revenue)}</td>
                                    <td>
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold ${villa.occupancyRate >= 80
                                                    ? 'bg-green-100 text-green-700'
                                                    : villa.occupancyRate >= 60
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {villa.occupancyRate}%
                                        </span>
                                    </td>
                                    <td>
                                        <span className="flex items-center gap-1">
                                            ⭐ {villa.avgRating}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Other Analytics - Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="admin-card p-6">
                    <h2 className="admin-section-title">Traffic Sources</h2>
                     <div className="h-48 text-center text-gray-400 flex items-center justify-center">
                         <p>Traffic source data not yet available.</p>
                    </div>
                </div>
                 <div className="admin-card p-6">
                    <h2 className="admin-section-title">Device Distribution</h2>
                     <div className="h-48 text-center text-gray-400 flex items-center justify-center">
                         <p>Device distribution data not yet available.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
