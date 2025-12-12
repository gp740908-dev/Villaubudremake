import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Users, Star, AlertCircle, X, ChevronUp } from "lucide-react";
import { formatCurrency, calculateNights, calculateTotal } from "@/utils/booking";
import { useBookingStore } from "@/store/bookingStore";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

// Assuming Villa type is defined and mapped correctly in the parent component
interface BookingCardProps {
  villa: any; 
}

const BookingCard = ({ villa }: BookingCardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setBooking, isDateGloballyBooked, fetchAndSetGlobalBookedDates } = useBookingStore();
  
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch global booked dates on component mount
  useEffect(() => {
    fetchAndSetGlobalBookedDates();
  }, [fetchAndSetGlobalBookedDates]);

  const nights = useMemo(() => calculateNights(checkIn, checkOut), [checkIn, checkOut]);

  const total = useMemo(
    () => calculateTotal(villa.pricePerNight, nights, villa.cleaningFee, villa.serviceFee),
    [nights, villa.pricePerNight, villa.cleaningFee, villa.serviceFee]
  );

  // Use the global store to check for booked dates
  const isDateUnavailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    
    const formattedDate = format(date, "yyyy-MM-dd");
    return isDateGloballyBooked(villa.id, formattedDate);
  };

  const canBook = checkIn && checkOut && nights >= (villa.minimumStay || 1) && villa.isAvailable;

  const handleReserve = () => {
    if (!checkIn || !checkOut) {
      toast({ title: "Select dates", description: "Please select check-in and check-out dates.", variant: "destructive" });
      return;
    }

    if (nights < (villa.minimumStay || 1)) {
      toast({ title: "Minimum stay required", description: `This villa requires a minimum stay of ${villa.minimumStay || 1} nights.`, variant: "destructive" });
      return;
    }

    // Set booking data in the global store
    setBooking({
      villaId: villa.id,
      villaName: villa.name,
      villaImage: villa.images[0],
      checkIn,
      checkOut,
      guests,
      nightlyRate: villa.pricePerNight,
      nights,
      cleaningFee: villa.cleaningFee,
      serviceFee: villa.serviceFee,
      total,
    });

    toast({ title: "Reservation started!", description: "Complete your booking details to confirm." });
    navigate('/checkout');
  };

  const renderPriceHeader = () => (
    <div className="flex items-baseline justify-between mb-6">
      <div>
        <span className="text-2xl font-bold text-foreground">{formatCurrency(villa.pricePerNight)}</span>
        <span className="text-muted-foreground"> /night</span>
      </div>
      <div className="flex items-center gap-1 text-sm">
        <Star size={16} className="text-yellow-500 fill-yellow-500" />
        <span className="font-medium">{villa.rating?.toFixed(1) || 'New'}</span>
        <span className="text-muted-foreground">({villa.reviewCount || 0})</span>
      </div>
    </div>
  );

  const renderAvailabilityStatus = () => (
    !villa.isAvailable && (
      <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg mb-4">
        <AlertCircle size={18} />
        <span className="text-sm font-medium">Currently unavailable</span>
      </div>
    )
  );

  const renderDatePickers = (isPortal = false) => (
      <div className="border border-border rounded-xl overflow-hidden mb-4">
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="p-3">
              <label className="block text-xs font-medium text-muted-foreground mb-1">CHECK-IN</label>
              <DatePicker
                selected={checkIn}
                onChange={(date) => setCheckIn(date)}
                selectsStart
                startDate={checkIn}
                endDate={checkOut}
                minDate={new Date()}
                filterDate={(date) => !isDateUnavailable(date)}
                placeholderText="Add date"
                className="w-full bg-transparent text-foreground focus:outline-none text-sm font-medium cursor-pointer"
                dateFormat="MMM d, yyyy"
                popperPlacement="bottom-start"
                withPortal={isPortal}
              />
            </div>
            <div className="p-3">
              <label className="block text-xs font-medium text-muted-foreground mb-1">CHECK-OUT</label>
              <DatePicker
                selected={checkOut}
                onChange={(date) => setCheckOut(date)}
                selectsEnd
                startDate={checkIn}
                endDate={checkOut}
                minDate={checkIn || new Date()}
                filterDate={(date) => !isDateUnavailable(date)}
                placeholderText="Add date"
                className="w-full bg-transparent text-foreground focus:outline-none text-sm font-medium cursor-pointer"
                dateFormat="MMM d, yyyy"
                popperPlacement="bottom-end"
                withPortal={isPortal}
              />
            </div>
          </div>
          <div className="border-t border-border p-3">
            <label className="block text-xs font-medium text-muted-foreground mb-1">GUESTS</label>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-muted-foreground" />
              <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-transparent text-foreground focus:outline-none text-sm font-medium appearance-none cursor-pointer">
                {Array.from({ length: villa.capacity || 1 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>{num} {num === 1 ? "guest" : "guests"}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
  );

  const renderPriceBreakdown = () => (
     nights > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground underline">{formatCurrency(villa.pricePerNight)} x {nights} nights</span>
              <span>{formatCurrency(villa.pricePerNight * nights)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground underline">Cleaning fee</span>
              <span>{formatCurrency(villa.cleaningFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground underline">Service fee</span>
              <span>{formatCurrency(villa.serviceFee)}</span>
            </div>
            <div className="pt-3 border-t border-border flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        )
  );

  const DesktopBookingCard = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="sticky top-24">
      <div className="glass-card rounded-2xl p-6 shadow-elevated">
        {renderPriceHeader()}
        {renderAvailabilityStatus()}
        {renderDatePickers()}
        <Button onClick={handleReserve} disabled={!canBook} size="lg" className="w-full text-lg">
          {villa.isAvailable ? "Reserve" : "Not Available"}
        </Button>
        {canBook && <p className="text-center text-sm text-muted-foreground mt-3">You won't be charged yet</p>}
        {renderPriceBreakdown()}
      </div>
    </motion.div>
  );

  const MobileBookingCard = () => (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-t border-border p-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(villa.pricePerNight)} <span className="text-sm font-normal text-muted-foreground">/night</span></p>
            {nights > 0 && <p className="text-xs text-muted-foreground">{nights} nights · {formatCurrency(total)} total</p>}
          </div>
          <Button onClick={() => setIsExpanded(true)} size="lg" className="font-semibold flex items-center gap-2">
            {checkIn && checkOut ? "Reserve" : "Check Availability"}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsExpanded(false)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Book Your Stay</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)}><X size={20} /></Button>
              </div>
              <div className="p-4 space-y-4 pb-8">
                {renderPriceHeader()}
                {renderAvailabilityStatus()}
                {renderDatePickers(true)}
                {renderPriceBreakdown()}
                <Button onClick={handleReserve} disabled={!canBook} size="lg" className="w-full text-lg mt-4">
                  {villa.isAvailable ? "Reserve" : "Not Available"}
                </Button>
                 {canBook && <p className="text-center text-sm text-muted-foreground">You won't be charged yet</p>}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );

  return isMobile ? <MobileBookingCard /> : <DesktopBookingCard />;
};

export default BookingCard;
