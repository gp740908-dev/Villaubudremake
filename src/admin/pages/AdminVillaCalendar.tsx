import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Lock,
    Loader2,
} from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isToday,
    addMonths,
    subMonths,
    getDay,
    parseISO,
} from 'date-fns';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Villa, Booking } from '@/lib/database.types'; // Corrected import

// This is the type for the data we get back from the query
type VillaWithBookedDates = Villa & {
    villa_booked_dates: { booked_date: string }[];
};

const AdminVillaCalendar = () => {
    const { id } = useParams<{ id: string }>(); // More specific type
    const [villa, setVilla] = useState<Villa | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [blockedDates, setBlockedDates] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState<string[]>([]);

    const fetchData = async () => {
        if (!id) return;
        setIsLoading(true);

        // Fetch villa data and joined blocked dates
        const { data: villaData, error: villaError } = await supabase
            .from('villas')
            .select('*, villa_booked_dates(booked_date)') // Corrected table and column
            .eq('id', id)
            .single();

        // Fetch bookings for this villa
        const { data: bookingsData, error: bookingsError } = await supabase
            .from('bookings')
            .select('*')
            .eq('villa_id', id)
            .in('status', ['confirmed', 'pending']);

        if (villaError || bookingsError) {
            toast({ title: 'Error fetching data', description: villaError?.message || bookingsError?.message, variant: 'destructive' });
            setVilla(null);
        } else if (villaData) {
            const typedVillaData = villaData as VillaWithBookedDates; // Cast to our specific type
            setVilla(typedVillaData);
            setBookings(bookingsData || []);
            // Extract the date strings from the joined data
            setBlockedDates(typedVillaData.villa_booked_dates.map(d => d.booked_date));
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // Calendar logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOffset = getDay(monthStart);

    // Checkers
    const isDateBooked = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return bookings.some(b => dateStr >= b.check_in && dateStr < b.check_out);
    };

    const getBookingInfo = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return bookings.find(b => dateStr >= b.check_in && dateStr < b.check_out);
    };

    // A date is blocked if it's in our blockedDates list AND it's not part of a booking
    const isDateBlocked = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return blockedDates.includes(dateStr) && !isDateBooked(date);
    };

    // Handlers
    const handleDateClick = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        if (selectedDates.includes(dateStr)) {
            setSelectedDates(selectedDates.filter(d => d !== dateStr));
        } else {
            setSelectedDates([...selectedDates, dateStr]);
        }
    };

    const handleBlockDates = async () => {
        if (!id || selectedDates.length === 0) return;

        // Corrected table name and column name
        const records = selectedDates.map(date => ({ villa_id: id, booked_date: date }));
        const { error } = await supabase.from('villa_booked_dates').insert(records);

        if (error) {
            toast({ title: 'Error blocking dates', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Dates blocked', description: `${selectedDates.length} dates have been blocked.` });
            setSelectedDates([]);
            fetchData(); // Refresh data
        }
    };

    const handleUnblockDates = async () => {
        if (!id || selectedDates.length === 0) return;

        // Corrected table name and column name
        const { error } = await supabase
            .from('villa_booked_dates')
            .delete()
            .eq('villa_id', id)
            .in('booked_date', selectedDates);

        if (error) {
            toast({ title: 'Error unblocking dates', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Dates unblocked', description: `${selectedDates.length} dates are now available.` });
            setSelectedDates([]);
            fetchData(); // Refresh data
        }
    };

    // Render logic
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" size={48} /></div>;
    }

    if (!villa) {
        return (
            <div className="text-center py-12">
                <p className="text-[#6b7c67]">Villa not found</p>
                <Link to="/admin/villas" className="text-[#778873] hover:underline">Back to Villas</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/admin/villas" className="p-2 hover:bg-[#F1F3E0] rounded-lg transition-colors">
                    <ArrowLeft size={20} className="text-[#778873]" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-[#2d3a29]">{villa.name}</h1>
                    <p className="text-sm text-[#6b7c67]">Availability Calendar</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 admin-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-[#F1F3E0] rounded-lg"><ChevronLeft size={20} /></button>
                        <h2 className="text-xl font-semibold text-[#2d3a29]">{format(currentMonth, 'MMMM yyyy')}</h2>
                        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-[#F1F3E0] rounded-lg"><ChevronRight size={20} /></button>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-6 text-sm">
                         <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-[#d4dbc8] rounded" /><span>Available</span></div>
                         <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#778873] rounded" /><span>Booked</span></div>
                         <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#D2DCB6] rounded" /><span>Blocked</span></div>
                         <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#A1BC98] border-2 border-[#778873] rounded" /><span>Selected</span></div>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-center text-sm font-medium text-[#6b7c67] py-2">{day}</div>)}
                        {Array.from({ length: startDayOffset }).map((_, i) => <div key={`empty-${i}`} className="h-20" />)}
                        {monthDays.map(day => {
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
                                    className={`h-20 p-2 rounded-lg border transition-colors relative group ${selected ? 'bg-[#A1BC98] border-[#778873] border-2' : booked ? 'bg-[#778873] border-[#778873] text-white' : blocked ? 'bg-[#D2DCB6] border-[#D2DCB6]' : 'bg-white border-[#d4dbc8] hover:border-[#A1BC98]'}`}>
                                    <span className={`text-sm font-medium ${today ? 'w-6 h-6 bg-red-500 text-white rounded-full inline-flex items-center justify-center' : ''}`}>{format(day, 'd')}</span>
                                    {booking && <div className="absolute bottom-1 left-1 right-1 text-xs truncate">{booking.guest_name?.split(' ')[0]}</div>}
                                    {blocked && <Lock size={12} className="absolute top-2 right-2 text-[#778873]" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="admin-card p-4">
                        <h3 className="font-semibold text-[#2d3a29] mb-4">Quick Block Dates</h3>
                        <p className="text-sm text-[#6b7c67] mb-4">{selectedDates.length > 0 ? `${selectedDates.length} dates selected` : 'Click calendar dates to select'}</p>
                        <div className="space-y-3">
                             <button onClick={handleBlockDates} disabled={selectedDates.length === 0} className="w-full admin-btn admin-btn-primary text-sm disabled:opacity-50">Block Selected</button>
                             <button onClick={handleUnblockDates} disabled={selectedDates.length === 0} className="w-full admin-btn admin-btn-outline text-sm disabled:opacity-50">Unblock Selected</button>
                             {selectedDates.length > 0 && <button onClick={() => setSelectedDates([])} className="w-full text-sm text-[#6b7c67] hover:text-[#2d3a29]">Clear Selection</button>}
                        </div>
                    </div>

                    <div className="admin-card p-4">
                        <h3 className="font-semibold text-[#2d3a29] mb-4">Upcoming Bookings</h3>
                        <div className="space-y-3">
                            {bookings.filter(b => new Date(b.check_in) >= new Date()).slice(0, 5).map(booking => (
                                <div key={booking.id} className="p-3 bg-[#F1F3E0] rounded-lg text-sm">
                                    <p className="font-medium text-[#2d3a29]">{booking.guest_name}</p>
                                    <p className="text-[#6b7c67]">{format(parseISO(booking.check_in), 'MMM d')} - {format(parseISO(booking.check_out), 'MMM d')}</p>
                                </div>
                            ))}
                            {bookings.filter(b => new Date(b.check_in) >= new Date()).length === 0 && <p className="text-sm text-[#6b7c67]">No upcoming bookings</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminVillaCalendar;