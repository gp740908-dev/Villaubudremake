import { useEffect, useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    Building2,
    Gauge,
    Phone,
    RefreshCw,
    Loader2,
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { getDashboardAnalytics } from '@/lib/admin-analytics';

// Define types for our analytics data
type KPIType = {
    value: number;
    previousValue: number;
};

type AnalyticsState = Awaited<ReturnType<typeof getDashboardAnalytics>>;

// ... (rest of the components like formatIDR, KPICard, CustomTooltip, StatusBadge remain the same)
// Format currency for display
const formatIDR = (value: number) => {
    if (!value) return 'IDR 0';
    if (value >= 1000000000) {
        return `IDR ${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
        return `IDR ${(value / 1000000).toFixed(1)}M`;
    }
    return `IDR ${value.toLocaleString()}`;
};

// KPI Card Component
const KPICard = (
    {
        title,
        value,
        trend,
        percentChange,
        icon: Icon,
        format: formatFn = (v: number) => v.toLocaleString(),
    }: {
        title: string;
        value: number;
        trend?: 'up' | 'down';
        percentChange?: number;
        icon: React.ElementType;
        format?: (v: number) => string;
    }
) => (
    <div className="admin-card admin-kpi-card">
        <div className="flex items-start justify-between">
            <div>
                <p className="kpi-label">{title}</p>
                <p className="kpi-value">{formatFn(value)}</p>
                {trend && percentChange !== undefined && percentChange !== Infinity && (
                    <div className={`kpi-trend ${trend}`}>
                        {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{percentChange.toFixed(1)}% vs last month</span>
                    </div>
                )}
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#A1BC98]/20 flex items-center justify-center">
                <Icon size={24} className="text-[#778873]" />
            </div>
        </div>
    </div>
);

// Custom Tooltip for Chart
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-[#d4dbc8]">
                <p className="text-sm font-medium text-[#2d3a29]">{label}</p>
                <p className="text-lg font-bold text-[#778873]">
                    {formatIDR(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        confirmed: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
        cancelled: 'bg-red-100 text-red-700',
        completed: 'bg-blue-100 text-blue-700',
    };
    const style = styles[status as keyof typeof styles] || styles.confirmed;

    return (
        <span className={`admin-badge ${style}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState<AnalyticsState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getDashboardAnalytics();
            setAnalytics(data);
        } catch (e: any) {
            setError(e.message || 'Failed to fetch analytics');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getTrend = (current: number, previous: number): { trend: 'up' | 'down', percent: number } => {
        if (previous === 0) {
            return { trend: current > 0 ? 'up' : 'down', percent: current > 0 ? 100 : 0 };
        }
        const percent = ((current - previous) / previous) * 100;
        return {
            trend: percent >= 0 ? 'up' : 'down',
            percent: Math.abs(percent),
        };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-[#778873]" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 bg-red-100 p-4 rounded-lg">
                <p className="font-bold">Error loading dashboard:</p>
                <p>{error}</p>
                <button onClick={fetchData} className="mt-2 admin-btn admin-btn-outline">
                    Try Again
                </button>
            </div>
        );
    }

    if (!analytics) {
        return <p>No data available.</p>;
    }

    const { kpis, revenueChartData, recentBookings, villaPerformance, upcomingCheckins } = analytics;
    const bookingTrend = getTrend(kpis.totalBookings.value, kpis.totalBookings.previousValue);
    const revenueTrend = getTrend(kpis.revenue.value, kpis.revenue.previousValue);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#2d3a29]">Dashboard</h1>
                    <p className="text-sm text-[#6b7c67]">
                        Welcome back! Here's what's happening with your villas.
                    </p>
                </div>
                <button onClick={fetchData} className="admin-btn admin-btn-outline">
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Bookings (This Month)"
                    value={kpis.totalBookings.value}
                    trend={bookingTrend.trend}
                    percentChange={bookingTrend.percent}
                    icon={Calendar}
                />
                <KPICard
                    title="Revenue (This Month)"
                    value={kpis.revenue.value}
                    trend={revenueTrend.trend}
                    percentChange={revenueTrend.percent}
                    icon={DollarSign}
                    format={formatIDR}
                />
                <KPICard
                    title="Occupancy Rate"
                    value={kpis.occupancyRate.value}
                    icon={Gauge}
                    format={(v) => `${v}%`}
                />
                <KPICard
                    title="Active Villas"
                    value={kpis.activeVillas.value}
                    icon={Building2}
                    format={(v) => `${v} / ${kpis.activeVillas.total}`}
                />
            </div>

            {/* Revenue Chart */}
            <div className="admin-card p-6">
                <h2 className="admin-section-title">Revenue Overview (Last 12 Months)</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueChartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d4dbc8" />
                            <XAxis dataKey="month" stroke="#6b7c67" fontSize={12} tickLine={false} />
                            <YAxis
                                stroke="#6b7c67"
                                fontSize={12}
                                tickLine={false}
                                tickFormatter={(value) => formatIDR(value as number)}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#778873"
                                strokeWidth={3}
                                dot={{ fill: '#778873', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: '#A1BC98' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Bookings & Upcoming Checkins */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 admin-card">
                    <div className="p-6 border-b border-[#d4dbc8]">
                        <h2 className="admin-section-title mb-0">Recent Bookings</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Ref Number</th>
                                    <th>Guest</th>
                                    <th>Villa</th>
                                    <th>Check-in</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td className="font-mono text-xs">{booking.referenceNumber}</td>
                                        <td className="font-medium">{booking.guestName}</td>
                                        <td className="text-[#6b7c67]">{booking.villaName}</td>
                                        <td>{format(parseISO(booking.checkIn), 'MMM d, yyyy')}</td>
                                        <td className="font-semibold">{formatIDR(booking.total)}</td>
                                        <td>
                                            <StatusBadge status={booking.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="admin-card">
                     <div className="p-6 border-b border-[#d4dbc8]">
                        <h2 className="admin-section-title mb-0">Upcoming Check-ins</h2>
                    </div>
                    <div className="p-4 space-y-4">
                        {upcomingCheckins.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No upcoming check-ins.</p>
                        ) : (
                           upcomingCheckins.map((checkin) => {
                                const date = parseISO(checkin.checkInDate);
                                const isCheckInToday = isToday(date);
                                const isCheckInTomorrow = isTomorrow(date);

                                return (
                                    <div
                                        key={checkin.id}
                                        className="p-4 bg-[#F1F3E0] rounded-xl"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-[#2d3a29]">
                                                    {checkin.guestName}
                                                </p>
                                                <p className="text-sm text-[#6b7c67]">{checkin.villaName}</p>
                                            </div>
                                            <span
                                                className={`text-xs font-medium px-2 py-1 rounded-full ${isCheckInToday
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                    }`}
                                            >
                                                {isCheckInToday ? 'Today' : isCheckInTomorrow ? 'Tomorrow' : format(date, 'MMM d')}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-sm text-[#6b7c67]">
                                                {checkin.guests} guests
                                            </span>
                                            <button className="p-2 bg-[#A1BC98] text-white rounded-lg hover:bg-[#778873] transition-colors">
                                                <Phone size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Villa Performance */}
            <div className="admin-card p-6">
                <h2 className="admin-section-title">Villa Performance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {villaPerformance.map((villa) => {
                        const occupancyColor =
                            villa.occupancyRate >= 80
                                ? 'text-green-600 bg-green-100'
                                : villa.occupancyRate >= 60
                                    ? 'text-yellow-600 bg-yellow-100'
                                    : 'text-red-600 bg-red-100';

                        return (
                            <div
                                key={villa.id}
                                className="border border-[#d4dbc8] rounded-xl overflow-hidden"
                            >
                                <img
                                    src={villa.image}
                                    alt={villa.name}
                                    className="w-full h-32 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="font-semibold text-[#2d3a29] text-sm mb-2">
                                        {villa.name}
                                    </h3>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-[#6b7c67]">Bookings</span>
                                        <span className="font-medium">{villa.totalBookings}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-1">
                                        <span className="text-[#6b7c67]">Revenue</span>
                                        <span className="font-medium">{formatIDR(villa.revenue)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-3">
                                        <span className="text-[#6b7c67]">Occupancy</span>
                                        <span
                                            className={`font-bold px-2 py-1 rounded ${occupancyColor}`}
                                        >
                                            {villa.occupancyRate}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
