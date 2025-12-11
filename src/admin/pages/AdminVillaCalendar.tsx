import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    X,
    Lock,
} from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isToday,
    addMonths,
    subMonths,
    getDay,
    parseISO,
} from 'date-fns';
import { villas } from '@/data/villas';
import { recentBookings } from '../data/adminData';
import { toast } from '@/hooks/use-toast';

const AdminVillaCalendar = () => {
    const { id } = useParams();
    const villa = villas.find((v) => v.id === id);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [blockReason, setBlockReason] = useState('');

    if (!villa) {
        return (
            <div className="text-center py-12">
                <p className="text-[#6b7c67]">Villa not found</p>
                <Link to="/admin/villas" className="text-[#778873] hover:underline">
                    Back to Villas
                </Link>
            </div>
        );
    }

    // Get booking for this villa
    const villaBookings = recentBookings.filter((b) => b.villaId === id);

    // Generate calendar days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get starting day offset (0 = Sunday)
    const startDayOffset = getDay(monthStart);

    // Check if date is booked
    const isDateBooked = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return villa.bookedDates.includes(dateStr) || villaBookings.some(
            (b) => dateStr >= b.checkIn && dateStr < b.checkOut && b.status !== 'cancelled'
        );
    };

    // Get booking info for date
    const getBookingInfo = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return villaBookings.find(
            (b) => dateStr >= b.checkIn && dateStr < b.checkOut && b.status !== 'cancelled'
        );
    };

    // Check if date is blocked (not a booking, but unavailable)
    const isDateBlocked = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return villa.bookedDates.includes(dateStr) && !getBookingInfo(date);
    };

    const handleDateClick = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        if (selectedDates.includes(dateStr)) {
            setSelectedDates(selectedDates.filter((d) => d !== dateStr));
        } else {
            setSelectedDates([...selectedDates, dateStr]);
        }
    };

    const handleBlockDates = () => {
        if (selectedDates.length === 0) {
            toast({ title: 'No dates selected', variant: 'destructive' });
            return;
        }
        toast({
            title: 'Dates blocked',
            description: `${selectedDates.length} dates have been blocked.`,
        });
        setSelectedDates([]);
        setBlockReason('');
    };

    const handleUnblockDates = () => {
        if (selectedDates.length === 0) return;
        toast({
            title: 'Dates unblocked',
            description: `${selectedDates.length} dates are now available.`,
        });
        setSelectedDates([]);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    to="/admin/villas"
                    className="p-2 hover:bg-[#F1F3E0] rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-[#778873]" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-[#2d3a29]">{villa.name}</h1>
                    <p className="text-sm text-[#6b7c67]">Availability Calendar</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-3 admin-card p-6">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-2 hover:bg-[#F1F3E0] rounded-lg"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="text-xl font-semibold text-[#2d3a29]">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-2 hover:bg-[#F1F3E0] rounded-lg"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mb-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-white border border-[#d4dbc8] rounded" />
                            <span>Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#778873] rounded" />
                            <span>Booked</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#D2DCB6] rounded" />
                            <span>Blocked</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#A1BC98] border-2 border-[#778873] rounded" />
                            <span>Selected</span>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Day headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div
                                key={day}
                                className="text-center text-sm font-medium text-[#6b7c67] py-2"
                            >
                                {day}
                            </div>
                        ))}

                        {/* Empty cells for offset */}
                        {Array.from({ length: startDayOffset }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-20" />
                        ))}

                        {/* Days */}
                        {monthDays.map((day) => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const booked = isDateBooked(day);
                            const blocked = isDateBlocked(day);
                            const selected = selectedDates.includes(dateStr);
                            const booking = getBookingInfo(day);
                            const today = isToday(day);

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => handleDateClick(day)}
                                    className={`h-20 p-2 rounded-lg border transition-colors relative group ${selected
                                            ? 'bg-[#A1BC98] border-[#778873] border-2'
                                            : booked
                                                ? 'bg-[#778873] border-[#778873] text-white'
                                                : blocked
                                                    ? 'bg-[#D2DCB6] border-[#D2DCB6]'
                                                    : 'bg-white border-[#d4dbc8] hover:border-[#A1BC98]'
                                        }`}
                                >
                                    <span
                                        className={`text-sm font-medium ${today ? 'w-6 h-6 bg-red-500 text-white rounded-full inline-flex items-center justify-center' : ''
                                            }`}
                                    >
                                        {format(day, 'd')}
                                    </span>
                                    {booking && (
                                        <div className="absolute bottom-1 left-1 right-1 text-xs truncate">
                                            {booking.guestName.split(' ')[0]}
                                        </div>
                                    )}
                                    {blocked && (
                                        <Lock size={12} className="absolute top-2 right-2 text-[#778873]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Block */}
                    <div className="admin-card p-4">
                        <h3 className="font-semibold text-[#2d3a29] mb-4">Quick Block Dates</h3>
                        <p className="text-sm text-[#6b7c67] mb-4">
                            {selectedDates.length > 0
                                ? `${selectedDates.length} dates selected`
                                : 'Click calendar dates to select'}
                        </p>
                        <div className="space-y-3">
                            <textarea
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                placeholder="Reason for blocking (optional)"
                                className="admin-input text-sm"
                                rows={2}
                            />
                            <button
                                onClick={handleBlockDates}
                                disabled={selectedDates.length === 0}
                                className="w-full admin-btn admin-btn-primary text-sm disabled:opacity-50"
                            >
                                Block Selected Dates
                            </button>
                            <button
                                onClick={handleUnblockDates}
                                disabled={selectedDates.length === 0}
                                className="w-full admin-btn admin-btn-outline text-sm disabled:opacity-50"
                            >
                                Unblock Selected
                            </button>
                            {selectedDates.length > 0 && (
                                <button
                                    onClick={() => setSelectedDates([])}
                                    className="w-full text-sm text-[#6b7c67] hover:text-[#2d3a29]"
                                >
                                    Clear Selection
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Bookings */}
                    <div className="admin-card p-4">
                        <h3 className="font-semibold text-[#2d3a29] mb-4">Upcoming Bookings</h3>
                        <div className="space-y-3">
                            {villaBookings
                                .filter((b) => b.status !== 'cancelled')
                                .slice(0, 5)
                                .map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="p-3 bg-[#F1F3E0] rounded-lg text-sm"
                                    >
                                        <p className="font-medium text-[#2d3a29]">{booking.guestName}</p>
                                        <p className="text-[#6b7c67]">
                                            {format(parseISO(booking.checkIn), 'MMM d')} -{' '}
                                            {format(parseISO(booking.checkOut), 'MMM d')}
                                        </p>
                                    </div>
                                ))}
                            {villaBookings.filter((b) => b.status !== 'cancelled').length === 0 && (
                                <p className="text-sm text-[#6b7c67]">No upcoming bookings</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminVillaCalendar;
