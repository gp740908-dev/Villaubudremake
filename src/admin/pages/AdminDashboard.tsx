import { useEffect, useMemo } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    Building2,
    Gauge,
    Phone,
    RefreshCw,
    Loader2
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
import {
    format,
    parseISO,
    isToday,
    isTomorrow,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    subMonths,
    startOfDay,
    isWithinInterval,
    isFuture
} from 'date-fns';
import { useBookingStore, CompletedBooking } from '@/store/bookingStore';
import { useVillaStore } from '@/store/villaStore';

// Format currency for display
const formatIDR = (value: number) => {
    if (value >= 1000000000) {
        return `IDR ${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
        return `IDR ${(value / 1000000).toFixed(1)}M`;
    }
    return `IDR ${value.toLocaleString()}`;
};

// KPI Card Component
const KPICard = ({
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
}) => (
    <div className="admin-card admin-kpi-card">
        <div className="flex items-start justify-between">
            <div>
                <p className="kpi-label">{title}</p>
                <p className="kpi-value">{formatFn(value)}</p>
                {trend && percentChange !== undefined && (
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
    const { adminBookings, fetchAllBookings, isLoading } = useBookingStore();
    const { villas, fetchVillas } = useVillaStore();

    useEffect(() => {
        fetchAllBookings();
        fetchVillas();
    }, [fetchAllBookings, fetchVillas]);

    // Calculate Stats
    const stats = useMemo(() => {
        const now = new Date();
        const currentMonthStart = startOfMonth(now);
        const currentMonthEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        // Helper to check if a date range overlaps with a month
        const getDaysInMonth = (checkIn: Date, checkOut: Date, monthStart: Date, monthEnd: Date) => {
            // Simple intersection logic could be complex, but for stats:
            // We want bookings CREATED in this month? Or revenue REALIZED?
            // Usually dashboard "Revenue (This Month)" means revenue from bookings that fall in this month OR bookings made this month.
            // Let's assume "Revenue from bookings made this month" for simplicity as per common dashboard metrics, 
            // OR "Revenue for stays in this month".
            // Given the mock data "revenueChartData" was by month, it implies accrued revenue.
            // Let's stick to "Bookings confirmed/paid in this month" based on `createdAt` or checkIn? 
            // Usually "Sales" = bookings made. "Revenue" = stays happened. 
            // Let's go with "Bookings made (created_at)" for 'Total Bookings'.
            // And "Revenue" as total value of bookings made (Sales).
            return 0;
        };

        // 1. Total Bookings (This Month vs Last Month)
        const currentMonthBookings = adminBookings.filter(b => isSameMonth(parseISO(b.createdAt), now) && b.status !== 'cancelled');
        const lastMonthBookings = adminBookings.filter(b => isSameMonth(parseISO(b.createdAt), subMonths(now, 1)) && b.status !== 'cancelled');

        const bookingGrowth = lastMonthBookings.length > 0
            ? ((currentMonthBookings.length - lastMonthBookings.length) / lastMonthBookings.length) * 100
            : 0;

        // 2. Revenue (Sales this month)
        const currentrevenue = currentMonthBookings.reduce((sum, b) => sum + b.total, 0);
        const lastRevenue = lastMonthBookings.reduce((sum, b) => sum + b.total, 0);
        const revenueGrowth = lastRevenue > 0
            ? ((currentrevenue - lastRevenue) / lastRevenue) * 100
            : 0;

        // 3. Occupancy Rate (This Month)
        // (Total booked nights in month / (Total Villas * Days in Month)) * 100
        const daysInCurrentMonth = eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd });
        let bookedNights = 0;

        // Iterate all active bookings that might overlap current month
        adminBookings.forEach(b => {
            if (b.status === 'cancelled') return;
            const start = parseISO(b.checkIn);
            const end = parseISO(b.checkOut); // Checkout day is usually not counted as occupied night, dealing with nights.

            // Check overlap with current month month
            // Simple approach: Iterate days of month, check if booked
            // Optimization: Filter candidates first? No, specific check is fine.
            // Actually, `eachDayOfInterval` for booking intersects current month interval.

            // Easier: Check each day of the month if it falls within any booking
            // This is O(Days * Bookings), acceptable for small scale.
        });

        // Optimized Occupancy:
        const occupiedDates = new Set();
        adminBookings.forEach(b => {
            if (b.status === 'cancelled') return;
            // get all dates between checkIn and checkOut (exclusive of checkout for nights, or inclusive? standard is nights)
            // standard hotelling: checkin date is occupied night. checkout date is NOT occupied night.
            const start = parseISO(b.checkIn);
            const end = parseISO(b.checkOut);

            if (end <= currentMonthStart || start > currentMonthEnd) return;

            const intervalStart = start < currentMonthStart ? currentMonthStart : start;
            const intervalEnd = end > currentMonthEnd ? currentMonthEnd : end; // max checks

            // Count nights
            const nights = eachDayOfInterval({ start: intervalStart, end: intervalEnd });
            // Remove the last day if it equals actual checkout date?
            // Actually `eachDayOfInterval` includes end.
            // If intervals overlap, we shouldn't double count if same villa?
            // We need to key by villa_id + date.

            nights.forEach(date => {
                // Don't count the checkout day itself as a night?
                // If b.checkOut is today, last night was yesterday.
                // We will count nights.
                if (date.getTime() === end.getTime()) return; // Exclude checkout day
                if (isSameMonth(date, now)) {
                    occupiedDates.add(`${b.villaId}-${format(date, 'yyyy-MM-dd')}`);
                }
            });
        });

        const totalCapacityNights = villas.length * daysInCurrentMonth.length;
        const occupancyRate = totalCapacityNights > 0 ? (occupiedDates.size / totalCapacityNights) * 100 : 0;

        // 4. Active Villas
        const activeVillasCount = villas.length;

        // 5. Chart Data (Last 12 Month Revenue)
        const chartData = [];
        for (let i = 11; i >= 0; i--) {
            const month = subMonths(now, i);
            const monthBookings = adminBookings.filter(b =>
                isSameMonth(parseISO(b.createdAt), month) && b.status !== 'cancelled'
            );
            const monthRevenue = monthBookings.reduce((sum, b) => sum + b.total, 0);
            chartData.push({
                month: format(month, 'MMM'),
                revenue: monthRevenue,
                fullDate: month
            });
        }

        // 6. Villa Occupancy Breakdown
        const villaStats = villas.map(villa => {
            // Count nights for this specific villa in current month
            let nightsCount = 0;
            adminBookings.forEach(b => {
                if (b.villaId !== villa.id || b.status === 'cancelled') return;
                const start = parseISO(b.checkIn);
                const end = parseISO(b.checkOut);

                // Logic same as above
                if (end <= currentMonthStart || start > currentMonthEnd) return;

                const intervalStart = start < currentMonthStart ? currentMonthStart : start;
                const intervalEnd = end > currentMonthEnd ? currentMonthEnd : end;

                const dates = eachDayOfInterval({ start: intervalStart, end: intervalEnd });
                dates.forEach(d => {
                    if (d.getTime() < end.getTime() && isSameMonth(d, now)) {
                        nightsCount++;
                    }
                });
            });
            const rate = (nightsCount / daysInCurrentMonth.length) * 100;
            return {
                ...villa,
                occupancyRate: Math.round(rate)
            };
        });

        // 7. Upcoming Checkins
        const upcoming = adminBookings
            .filter(b => {
                const checkIn = parseISO(b.checkIn);
                return isFuture(checkIn) || isToday(checkIn);
            })
            .sort((a, b) => parseISO(a.checkIn).getTime() - parseISO(b.checkIn).getTime())
            .slice(0, 5)
            .map(b => ({
                id: b.id,
                guestName: b.guestDetails.fullName,
                villaName: villas.find(v => v.id === b.villaId)?.name || 'Unknown',
                checkInDate: b.checkIn,
                checkInTime: '2:00 PM', // Default
                guests: b.guests,
            }));

        return {
            totalBookings: { value: currentMonthBookings.length, trend: bookingGrowth >= 0 ? 'up' : 'down', percent: Math.abs(bookingGrowth) },
            revenue: { value: currentrevenue, trend: revenueGrowth >= 0 ? 'up' : 'down', percent: Math.abs(revenueGrowth) },
            occupancy: { value: Math.round(occupancyRate), trend: 'up', percent: 0 }, // Trend hard to calc without history
            activeVillas: { value: activeVillasCount, total: activeVillasCount },
            chartData,
            villaStats,
            upcoming,
            recent: adminBookings.slice(0, 6)
        };
    }, [adminBookings, villas]);

    if (isLoading && adminBookings.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-[#778873]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#2d3a29]">Dashboard</h1>
                    <p className="text-sm text-[#6b7c67]">
                        Welcome back! Here's what's happening with your villas.
                    </p>
                </div>
                <button
                    onClick={() => { fetchAllBookings(); fetchVillas(); }}
                    className="admin-btn admin-btn-outline"
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Bookings (This Month)"
                    value={stats.totalBookings.value}
                    trend={stats.totalBookings.trend as any}
                    percentChange={stats.totalBookings.percent}
                    icon={Calendar}
                />
                <KPICard
                    title="Revenue (This Month)"
                    value={stats.revenue.value}
                    trend={stats.revenue.trend as any}
                    percentChange={stats.revenue.percent}
                    icon={DollarSign}
                    format={formatIDR}
                />
                <KPICard
                    title="Occupancy Rate"
                    value={stats.occupancy.value}
                    // trend="up"
                    // percentChange={0}
                    icon={Gauge}
                    format={(v) => `${v}%`}
                />
                <KPICard
                    title="Active Villas"
                    value={stats.activeVillas.value}
                    icon={Building2}
                    format={(v) => `${v} / ${stats.activeVillas.total}`}
                />
            </div>

            {/* Revenue Chart */}
            <div className="admin-card p-6">
                <h2 className="admin-section-title">Revenue Overview (Last 12 Months)</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#d4dbc8" />
                            <XAxis
                                dataKey="month"
                                stroke="#6b7c67"
                                fontSize={12}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#6b7c67"
                                fontSize={12}
                                tickLine={false}
                                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Bookings */}
                <div className="lg:col-span-2 admin-card">
                    <div className="p-6 border-b border-[#d4dbc8] flex items-center justify-between">
                        <h2 className="admin-section-title mb-0">Recent Bookings</h2>
                        <button className="text-sm text-[#778873] hover:text-[#2d3a29] font-medium">
                            View All →
                        </button>
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
                                {stats.recent.map((booking) => {
                                    const villaName = villas.find(v => v.id === booking.villaId)?.name || 'Unknown';
                                    return (
                                        <tr key={booking.id}>
                                            <td className="font-mono text-xs">{booking.referenceNumber}</td>
                                            <td className="font-medium">{booking.guestDetails.fullName}</td>
                                            <td className="text-[#6b7c67]">{villaName}</td>
                                            <td>{format(parseISO(booking.checkIn), 'MMM d, yyyy')}</td>
                                            <td className="font-semibold">{formatIDR(booking.total)}</td>
                                            <td>
                                                <StatusBadge status={booking.status} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upcoming Check-ins */}
                <div className="admin-card">
                    <div className="p-6 border-b border-[#d4dbc8]">
                        <h2 className="admin-section-title mb-0">Upcoming Check-ins</h2>
                    </div>
                    <div className="p-4 space-y-4">
                        {stats.upcoming.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No upcoming check-ins.</p>
                        ) : (
                            stats.upcoming.map((checkin) => {
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
                                                {checkin.checkInTime} • {checkin.guests} guests
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

            {/* Villa Occupancy Overview */}
            <div className="admin-card p-6">
                <h2 className="admin-section-title">Villa Occupancy Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.villaStats.map((villa) => {
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
                                    src={villa.images[0]}
                                    alt={villa.name}
                                    className="w-full h-32 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="font-semibold text-[#2d3a29] text-sm mb-2">
                                        {villa.name}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-[#6b7c67]">Occupancy</span>
                                        <span
                                            className={`text-sm font-bold px-2 py-1 rounded ${occupancyColor}`}
                                        >
                                            {villa.occupancyRate}%
                                        </span>
                                    </div>
                                    {/* Mini progress bar */}
                                    <div className="mt-2 h-2 bg-[#F1F3E0] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#778873] rounded-full transition-all"
                                            style={{ width: `${villa.occupancyRate}%` }}
                                        />
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
