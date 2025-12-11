import { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Eye,
} from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    addMonths,
    subMonths,
    getDay,
    parseISO,
} from 'date-fns';
import { villas } from '@/data/villas';
import { recentBookings } from '../data/adminData';

const AdminBookingCalendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedVilla, setSelectedVilla] = useState<string>('all');

    // Generate calendar days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOffset = getDay(monthStart);

    // Filter villas
    const displayVillas = selectedVilla === 'all' ? villas : villas.filter((v) => v.id === selectedVilla);

    // Get bookings for a villa on a date
    const getBookingsForDate = (villaId: string, date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return recentBookings.filter(
            (b) =>
                b.villaId === villaId &&
                dateStr >= b.checkIn &&
                dateStr < b.checkOut &&
                b.status !== 'cancelled'
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#2d3a29]">Booking Calendar</h1>
                    <p className="text-sm text-[#6b7c67]">Overview of all villa bookings</p>
                </div>
                <select
                    value={selectedVilla}
                    onChange={(e) => setSelectedVilla(e.target.value)}
                    className="admin-input w-48"
                >
                    <option value="all">All Villas</option>
                    {villas.map((villa) => (
                        <option key={villa.id} value={villa.id}>
                            {villa.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Calendar */}
            <div className="admin-card p-6">
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
                <div className="flex gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#778873] rounded" />
                        <span>Confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-[#fbbf24] rounded" />
                        <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white border border-[#d4dbc8] rounded" />
                        <span>Available</span>
                    </div>
                </div>

                {/* Timeline View */}
                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        {/* Day Headers */}
                        <div className="grid" style={{ gridTemplateColumns: `150px repeat(${monthDays.length}, 1fr)` }}>
                            <div className="p-2 font-medium text-[#6b7c67] text-sm border-b border-[#d4dbc8]">
                                Villa
                            </div>
                            {monthDays.map((day) => (
                                <div
                                    key={day.toISOString()}
                                    className="p-1 text-center text-xs border-b border-l border-[#d4dbc8]"
                                >
                                    <div className="text-[#6b7c67]">{format(day, 'EEE')}</div>
                                    <div className="font-medium">{format(day, 'd')}</div>
                                </div>
                            ))}
                        </div>

                        {/* Villa Rows */}
                        {displayVillas.map((villa) => (
                            <div
                                key={villa.id}
                                className="grid"
                                style={{ gridTemplateColumns: `150px repeat(${monthDays.length}, 1fr)` }}
                            >
                                {/* Villa Name */}
                                <div className="p-2 border-b border-[#d4dbc8] flex items-center gap-2">
                                    <img
                                        src={villa.images[0]}
                                        alt={villa.name}
                                        className="w-8 h-8 rounded object-cover"
                                    />
                                    <span className="text-sm font-medium truncate">{villa.name}</span>
                                </div>

                                {/* Days */}
                                {monthDays.map((day) => {
                                    const bookings = getBookingsForDate(villa.id, day);
                                    const hasBooking = bookings.length > 0;
                                    const booking = bookings[0];

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className={`p-1 border-b border-l border-[#d4dbc8] min-h-[40px] ${hasBooking
                                                    ? booking?.status === 'pending'
                                                        ? 'bg-yellow-100'
                                                        : 'bg-[#A1BC98]'
                                                    : 'hover:bg-[#F1F3E0]'
                                                }`}
                                            title={booking ? `${booking.guestName} - ${booking.id}` : 'Available'}
                                        >
                                            {hasBooking && (
                                                <div className="text-xs truncate px-1">
                                                    {booking?.guestName.split(' ')[0]}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBookingCalendar;
