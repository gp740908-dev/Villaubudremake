import { useEffect, useState } from 'react';
import {
    RefreshCw,
    Users,
    Eye,
    Clock,
    MousePointer,
    TrendingUp,
    Calendar,
    Loader2,
    MapPin
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
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
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
}) => (
    <div className="admin-card p-4">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#A1BC98]/20 flex items-center justify-center">
                <Icon size={20} className="text-[#778873]" />
            </div>
            <div>
                <p className="text-xs text-[#6b7c67] uppercase tracking-wide">{title}</p>
                <p className="text-xl font-bold text-[#2d3a29]">{value}</p>
            </div>
        </div>
    </div>
);

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-[#d4dbc8]">
                <p className="text-sm font-medium text-[#2d3a29]">{label}</p>
                <p className="text-sm text-[#A1BC98]">
                    {payload[0].name}: {payload[0].value.toLocaleString()}
                </p>
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
            <div className="flex items-center justify-center h-96">
                <Loader2 size={32} className="animate-spin text-[#778873]" />
            </div>
        );
    }

    if (error) {
        return (
             <div className="text-red-500 bg-red-100 p-4 rounded-lg">
                <p className="font-bold">Error Loading Analytics</p>
                <p>{error}</p>
                <button onClick={fetchData} className="mt-2 admin-btn admin-btn-outline">
                    Try Again
                </button>
            </div>
        );
    }
    
    if (!bookingAnalytics || !visitorAnalytics) {
        return <div className="text-center text-gray-500 py-12">No analytics data available.</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#2d3a29]">Analytics</h1>
                    <p className="text-sm text-[#6b7c67]">
                        Real-time tracking of your website and booking performance.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="admin-btn admin-btn-outline">
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Main KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <StatCard title="Total Views" value={visitorAnalytics.totalViews.toLocaleString()} icon={Eye} />
                 <StatCard title="Page Views" value={visitorAnalytics.pageViews.length.toLocaleString()} icon={MousePointer} />
                 <StatCard title="Avg Booking Value" value={formatIDR(bookingAnalytics.bookingAnalytics.avgBookingValue)} icon={Calendar} />
                 <StatCard title="Avg Stay Length" value={`${bookingAnalytics.bookingAnalytics.avgLengthOfStay.toFixed(1)} nights`} icon={Clock} />
            </div>

            {/* Visitor & Booking Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 admin-card p-6">
                    <h2 className="admin-section-title">Top Pages Visited</h2>
                    <div className="h-80 -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={visitorAnalytics.topPages} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e0e0" />
                                <XAxis type="number" tick={{ fill: '#6b7c67', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis 
                                    type="category" 
                                    dataKey="path" 
                                    width={100} 
                                    tick={{ fill: '#2d3a29', fontSize: 12 }} 
                                    tickLine={false} 
                                    axisLine={false}
                                    style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F4F6F1' }} />
                                <Bar dataKey="views" name="Views" fill="#A1BC98" radius={[0, 4, 4, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="admin-card p-6">
                    <h2 className="admin-section-title">Top Countries</h2>
                     <div className="-mx-6 -mb-6 mt-4">
                        <ul className="divide-y divide-[#d4dbc8]">
                            {visitorAnalytics.topCountries.map((country, index) => (
                                 <li key={index} className="flex items-center justify-between px-6 py-3.5 hover:bg-[#F4F6F1]">
                                    <div className="flex items-center gap-3">
                                         <MapPin size={16} className="text-[#778873]" />
                                         <span className="font-medium text-sm text-[#2d3a29]">{country.country || 'Unknown'}</span>
                                    </div>
                                     <span className="font-bold text-sm text-[#2d3a29]">{country.views.toLocaleString()}</span>
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
                                    Bookings {sortColumn === 'totalBookings' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="cursor-pointer hover:bg-[#D2DCB6]" onClick={() => handleSort('revenue')}>
                                    Revenue {sortColumn === 'revenue' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="cursor-pointer hover:bg-[#D2DCB6]" onClick={() => handleSort('occupancyRate')}>
                                    Occupancy {sortColumn === 'occupancyRate' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${villa.occupancyRate >= 80 ? 'bg-green-100 text-green-700' : villa.occupancyRate >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700' }`}>
                                            {villa.occupancyRate}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
