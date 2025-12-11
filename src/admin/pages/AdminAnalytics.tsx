import { useState } from 'react';
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
} from 'lucide-react';
import {
    LineChart,
    Line,
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
import { analyticsData } from '../data/adminData';

// Format currency
const formatIDR = (value: number) => {
    if (value >= 1000000000) return `IDR ${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `IDR ${(value / 1000000).toFixed(1)}M`;
    return `IDR ${value.toLocaleString()}`;
};

// Date Range Options
const dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'Custom', value: 'custom' },
];

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
    const [dateRange, setDateRange] = useState('month');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };

    const sortedVillaPerformance = [...analyticsData.villaPerformance].sort((a, b) => {
        if (!sortColumn) return 0;
        const aVal = a[sortColumn as keyof typeof a];
        const bVal = b[sortColumn as keyof typeof b];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        return 0;
    });

    const handleExport = (format: 'pdf' | 'csv') => {
        alert(`Exporting ${dateRange} report as ${format.toUpperCase()}...`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#2d3a29]">Analytics</h1>
                    <p className="text-sm text-[#6b7c67]">
                        Track your website and booking performance.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="admin-btn admin-btn-outline">
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                    <div className="relative group">
                        <button className="admin-btn admin-btn-primary">
                            <Download size={16} />
                            Export Report
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-[#d4dbc8] hidden group-hover:block z-10">
                            <button
                                onClick={() => handleExport('pdf')}
                                className="block w-full px-4 py-2 text-sm text-left hover:bg-[#F1F3E0]"
                            >
                                Export as PDF
                            </button>
                            <button
                                onClick={() => handleExport('csv')}
                                className="block w-full px-4 py-2 text-sm text-left hover:bg-[#F1F3E0]"
                            >
                                Export as CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Date Range Selector */}
            <div className="admin-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-[#6b7c67] font-medium">Date Range:</span>
                    {dateRanges.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => setDateRange(range.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${dateRange === range.value
                                    ? 'bg-[#778873] text-white'
                                    : 'bg-[#F1F3E0] text-[#2d3a29] hover:bg-[#D2DCB6]'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Visitor Analytics */}
            <div className="admin-card p-6">
                <h2 className="admin-section-title">Visitor Analytics</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <StatCard
                        title="Total Visitors"
                        value={analyticsData.visitors.total.toLocaleString()}
                        icon={Users}
                    />
                    <StatCard
                        title="Unique Visitors"
                        value={analyticsData.visitors.unique.toLocaleString()}
                        icon={Eye}
                    />
                    <StatCard
                        title="Page Views"
                        value={analyticsData.visitors.pageViews.toLocaleString()}
                        icon={MousePointer}
                    />
                    <StatCard
                        title="Avg Session"
                        value={analyticsData.visitors.avgSessionDuration}
                        icon={Clock}
                    />
                    <StatCard
                        title="Bounce Rate"
                        value={`${analyticsData.visitors.bounceRate}%`}
                        icon={TrendingUp}
                    />
                </div>

                {/* Top Pages Bar Chart */}
                <h3 className="text-sm font-semibold text-[#2d3a29] mb-4">Top Pages Visited</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.topPages} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#d4dbc8" />
                            <XAxis type="number" stroke="#6b7c67" fontSize={12} />
                            <YAxis type="category" dataKey="page" stroke="#6b7c67" fontSize={12} width={100} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="views" fill="#778873" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Booking Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="admin-card p-6">
                    <h2 className="admin-section-title">Booking Analytics</h2>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <StatCard
                            title="Conversion Rate"
                            value={`${analyticsData.bookingAnalytics.conversionRate}%`}
                            icon={TrendingUp}
                        />
                        <StatCard
                            title="Avg Booking Value"
                            value={formatIDR(analyticsData.bookingAnalytics.avgBookingValue)}
                            icon={Calendar}
                        />
                        <StatCard
                            title="Avg Stay Length"
                            value={`${analyticsData.bookingAnalytics.avgLengthOfStay} nights`}
                            icon={Clock}
                        />
                    </div>

                    {/* Popular Months */}
                    <h3 className="text-sm font-semibold text-[#2d3a29] mb-4">Popular Booking Months</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.popularMonths}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#d4dbc8" />
                                <XAxis dataKey="month" stroke="#6b7c67" fontSize={12} />
                                <YAxis stroke="#6b7c67" fontSize={12} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="bookings" fill="#A1BC98" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Booking Sources Pie Chart */}
                <div className="admin-card p-6">
                    <h2 className="admin-section-title">Booking Sources</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analyticsData.bookingSources}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                    nameKey="source"
                                    label={({ source, value }) => `${source}: ${value}%`}
                                    labelLine={false}
                                >
                                    {analyticsData.bookingSources.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {analyticsData.bookingSources.map((source) => (
                            <div key={source.source} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: source.color }}
                                />
                                <span className="text-xs text-[#6b7c67]">{source.source}</span>
                            </div>
                        ))}
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
                                <th
                                    className="cursor-pointer hover:bg-[#D2DCB6]"
                                    onClick={() => handleSort('totalBookings')}
                                >
                                    Total Bookings {sortColumn === 'totalBookings' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="cursor-pointer hover:bg-[#D2DCB6]"
                                    onClick={() => handleSort('revenue')}
                                >
                                    Revenue {sortColumn === 'revenue' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="cursor-pointer hover:bg-[#D2DCB6]"
                                    onClick={() => handleSort('occupancyRate')}
                                >
                                    Occupancy {sortColumn === 'occupancyRate' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="cursor-pointer hover:bg-[#D2DCB6]"
                                    onClick={() => handleSort('avgRating')}
                                >
                                    Avg Rating {sortColumn === 'avgRating' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedVillaPerformance.map((villa) => (
                                <tr key={villa.id}>
                                    <td className="font-medium">{villa.name}</td>
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

            {/* Traffic & Device Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Sources */}
                <div className="admin-card p-6">
                    <h2 className="admin-section-title">Traffic Sources</h2>
                    <div className="space-y-4">
                        {analyticsData.trafficSources.map((source) => (
                            <div key={source.source}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-[#2d3a29]">{source.source}</span>
                                    <span className="text-[#6b7c67]">
                                        {source.visitors.toLocaleString()} ({source.percentage}%)
                                    </span>
                                </div>
                                <div className="h-2 bg-[#F1F3E0] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{ width: `${source.percentage}%`, backgroundColor: source.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Device Distribution */}
                <div className="admin-card p-6">
                    <h2 className="admin-section-title">Device Distribution</h2>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analyticsData.deviceDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="percentage"
                                    nameKey="device"
                                >
                                    {analyticsData.deviceDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value}%`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        {analyticsData.deviceDistribution.map((device) => {
                            const Icon =
                                device.device === 'Desktop'
                                    ? Monitor
                                    : device.device === 'Mobile'
                                        ? Smartphone
                                        : Tablet;
                            return (
                                <div key={device.device} className="flex items-center gap-2">
                                    <Icon size={16} style={{ color: device.color }} />
                                    <span className="text-sm text-[#6b7c67]">
                                        {device.device}: {device.percentage}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Geographic Data */}
                <div className="admin-card p-6">
                    <h2 className="admin-section-title">Top Countries</h2>
                    <div className="space-y-3">
                        {analyticsData.topCountries.slice(0, 7).map((country, index) => (
                            <div key={country.country} className="flex items-center gap-3">
                                <span className="text-xl">{country.flag}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[#2d3a29]">{country.country}</span>
                                        <span className="text-[#6b7c67]">{country.visitors.toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 bg-[#F1F3E0] rounded-full overflow-hidden mt-1">
                                        <div
                                            className="h-full bg-[#778873] rounded-full"
                                            style={{
                                                width: `${(country.visitors / analyticsData.topCountries[0].visitors) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
