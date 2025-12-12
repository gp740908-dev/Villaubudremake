import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Villa, Booking } from '@/lib/database.types';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

type BookingWithVilla = Booking & { villas: Pick<Villa, 'name' | 'images'> };

const AdminBookingCalendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedVilla, setSelectedVilla] = useState<string>('all');
    const [villas, setVillas] = useState<Villa[]>([]);
    const [bookings, setBookings] = useState<BookingWithVilla[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchVillasAndBookings = async () => {
            setIsLoading(true);

            // Fetch all villas for the dropdown
            const { data: villasData, error: villasError } = await supabase.from('villas').select('id, name, images');

            if (villasError) {
                toast({ title: 'Error fetching villas', description: villasError.message, variant: 'destructive' });
                setVillas([]);
            } else {
                setVillas(villasData as Villa[]);
            }

            // Fetch bookings for the current month view
            const monthStart = startOfMonth(currentMonth);
            const monthEnd = endOfMonth(currentMonth);

            let query = supabase
                .from('bookings')
                .select('*, villas(name, images)')
                .not('status', 'eq', 'cancelled')
                .lte('check_in', format(monthEnd, 'yyyy-MM-dd'))
                .gte('check_out', format(monthStart, 'yyyy-MM-dd'));

            if (selectedVilla !== 'all') {
                query = query.eq('villa_id', selectedVilla);
            }

            const { data: bookingsData, error: bookingsError } = await query;

            if (bookingsError) {
                toast({ title: 'Error fetching bookings', description: bookingsError.message, variant: 'destructive' });
                setBookings([]);
            } else {
                setBookings(bookingsData as unknown as BookingWithVilla[]);
            }

            setIsLoading(false);
        };

        fetchVillasAndBookings();
    }, [currentMonth, selectedVilla]);

    const monthDays = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
    const displayVillas = selectedVilla === 'all' ? villas : villas.filter((v) => v.id === selectedVilla);

    const getBookingForDate = (villaId: string, date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return bookings.find(b =>
            b.villa_id === villaId &&
            dateStr >= b.check_in &&
            dateStr < b.check_out
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#2d3a29]">Booking Calendar</h1>
                    <p className="text-sm text-[#6b7c67]">Overview of all villa bookings</p>
                </div>
                <select value={selectedVilla} onChange={(e) => setSelectedVilla(e.target.value)} className="admin-input w-full sm:w-48">
                    <option value="all">All Villas</option>
                    {villas.map((villa) => (
                        <option key={villa.id} value={villa.id}>{villa.name}</option>
                    ))}
                </select>
            </div>

            <div className="admin-card p-4 md:p-6">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-[#F1F3E0] rounded-lg"><ChevronLeft size={20} /></button>
                    <h2 className="text-lg md:text-xl font-semibold text-[#2d3a29]">{format(currentMonth, 'MMMM yyyy')}</h2>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-[#F1F3E0] rounded-lg"><ChevronRight size={20} /></button>
                </div>

                <div className="flex flex-wrap gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#778873] rounded" /><span>Confirmed</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 rounded" /><span>Pending</span></div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-[#d4dbc8] rounded" /><span>Available</span></div>
                </div>

                {isLoading ? (
                    <div className="text-center py-16">Loading...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="min-w-[1200px]">
                            <div className="grid items-center" style={{ gridTemplateColumns: `200px repeat(${monthDays.length}, minmax(50px, 1fr))` }}>
                                <div className="p-2 font-medium text-[#6b7c67] text-sm border-b border-t border-[#d4dbc8]">Villa</div>
                                {monthDays.map((day) => (
                                    <div key={day.toISOString()} className="p-1 text-center text-xs border-b border-t border-l border-[#d4dbc8]">
                                        <div className="text-[#6b7c67]">{format(day, 'EEE')}</div>
                                        <div className="font-semibold text-base">{format(day, 'd')}</div>
                                    </div>
                                ))}
                            </div>

                            {displayVillas.map((villa) => (
                                <div key={villa.id} className="grid items-center" style={{ gridTemplateColumns: `200px repeat(${monthDays.length}, minmax(50px, 1fr))` }}>
                                    <div className="p-2 border-b border-[#d4dbc8] flex items-center gap-2 whitespace-nowrap overflow-hidden">
                                        <img src={villa.images?.[0]} alt={villa.name} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-semibold truncate">{villa.name}</p>
                                            <Link to={`/admin/villas/${villa.id}/calendar`} className='text-xs text-blue-600 hover:underline'>View Calendar</Link>
                                        </div>
                                    </div>

                                    {monthDays.map((day) => {
                                        const booking = getBookingForDate(villa.id, day);
                                        const isStart = booking && format(day, 'yyyy-MM-dd') === booking.check_in;
                                        const statusColor = booking?.status === 'pending' ? 'bg-yellow-200 border-yellow-400' : 'bg-[#C8D9C5] border-[#A1BC98]';

                                        return (
                                            <div
                                                key={day.toISOString()}
                                                className={`h-full border-b border-l border-[#d4dbc8] min-h-[50px] ${booking ? 'cursor-pointer' : ''} ${!isStart && booking ? statusColor.replace("border-", "border-l-0") : ''}`}
                                                title={booking ? `${booking.guest_name} (${booking.status})` : 'Available'}
                                            >
                                                {isStart && (
                                                    <div className={`h-full p-1 text-xs truncate rounded-l-lg border ${statusColor}`}>
                                                        {booking.guest_name}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                             {displayVillas.length === 0 && <div className='text-center p-8'>No villas found for this selection.</div>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBookingCalendar;
