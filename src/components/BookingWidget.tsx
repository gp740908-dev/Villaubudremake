import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, Star, AlertCircle, MessageCircle, Shield, ChevronDown } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Villa } from "@/data/villas";
import { formatCurrency } from "@/utils/booking";
import { useBookingStore } from "@/store/bookingStore";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import AdvancedDatePicker from "./AdvancedDatePicker";

interface BookingWidgetProps {
  villa: Villa;
  variant?: "sidebar" | "floating";
}

const BookingWidget = ({ villa, variant = "sidebar" }: BookingWidgetProps) => {
  const navigate = useNavigate();
  const { setBooking, isDateGloballyBooked } = useBookingStore();
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // Combine villa booked dates with global bookings
  const allBookedDates = useMemo(() => {
    const globalDates = useBookingStore.getState().globalBookedDates[villa.id] || [];
    return [...new Set([...villa.bookedDates, ...globalDates])];
  }, [villa.bookedDates, villa.id]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, differenceInDays(checkOut, checkIn));
  }, [checkIn, checkOut]);

  const subtotal = villa.pricePerNight * nights;
  const serviceAmount = Math.round(subtotal * 0.1);
  const total = subtotal + villa.cleaningFee + serviceAmount;

  const checkAvailability = async () => {
    if (!checkIn || !checkOut) {
      toast({
        title: "Select dates",
        description: "Please select check-in and check-out dates first.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);

    // Simulate API check
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check if any date in range is booked
    let available = true;
    const loopCheckIn = new Date(checkIn);
    const loopCheckOut = new Date(checkOut);

    for (let d = loopCheckIn; d < loopCheckOut; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, "yyyy-MM-dd");
        if (allBookedDates.includes(dateStr)) {
            available = false;
            break;
        }
    }

    setIsAvailable(available);
    setIsChecking(false);

    if (!available) {
      toast({
        title: "Dates not available",
        description: "Selected dates are not available. Please choose different dates.",
        variant: "destructive",
      });
    }
  };

  const handleReserve = () => {
    if (!checkIn || !checkOut) {
      toast({
        title: "Select dates",
        description: "Please select check-in and check-out dates.",
        variant: "destructive",
      });
      return;
    }

    if (nights < villa.minimumStay) {
      toast({
        title: "Minimum stay required",
        description: `This villa requires a minimum stay of ${villa.minimumStay} nights.`,
        variant: "destructive",
      });
      return;
    }

    if (isAvailable === false) {
      toast({
        title: "Dates not available",
        description: "Please select available dates.",
        variant: "destructive",
      });
      return;
    }

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
      serviceFee: serviceAmount,
      total,
    });

    toast({
      title: "Proceeding to checkout",
      description: "Complete your booking details to confirm.",
    });

    navigate("/checkout");
  };

  const canProceed = checkIn && checkOut && nights >= villa.minimumStay && villa.isAvailable;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={variant === "sidebar" ? "sticky top-24" : ""}
      >
        <div className="glass-card rounded-2xl p-6 shadow-elevated">
          {/* Price Header */}
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(villa.pricePerNight)}
              </span>
              <span className="text-muted-foreground"> /night</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{villa.rating}</span>
              <span className="text-muted-foreground">({villa.reviewCount})</span>
            </div>
          </div>

          {/* Availability Status */}
          {!villa.isAvailable && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg mb-4">
              <AlertCircle size={18} />
              <span className="text-sm font-medium">Currently unavailable</span>
            </div>
          )}

          {/* Date Selection */}
          <div className="border border-border rounded-xl overflow-hidden mb-4">
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="w-full grid grid-cols-2 divide-x divide-border hover:bg-secondary/50 transition-colors"
            >
              <div className="p-3 text-left">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  CHECK-IN
                </label>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <span className={`text-sm font-medium ${!checkIn ? "text-muted-foreground" : ""}`}>
                    {checkIn ? format(checkIn, "MMM d, yyyy") : "Add date"}
                  </span>
                </div>
              </div>
              <div className="p-3 text-left">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  CHECK-OUT
                </label>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  <span className={`text-sm font-medium ${!checkOut ? "text-muted-foreground" : ""}`}>
                    {checkOut ? format(checkOut, "MMM d, yyyy") : "Add date"}
                  </span>
                </div>
              </div>
            </button>

            {/* Guests */}
            <div className="border-t border-border p-3">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                GUESTS
              </label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {guests} {guests === 1 ? "guest" : "guests"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    disabled={guests <= 1}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{guests}</span>
                  <button
                    onClick={() => setGuests(Math.min(villa.capacity, guests + 1))}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    disabled={guests >= villa.capacity}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Check Availability Button */}
          {isAvailable === null && nights > 0 && (
            <button
              onClick={checkAvailability}
              disabled={isChecking}
              className="w-full py-3 rounded-xl font-medium text-sm btn-outline mb-3"
            >
              {isChecking ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Checking...
                </span>
              ) : (
                "Check Availability"
              )}
            </button>
          )}

          {/* Availability Result */}
          {isAvailable === true && nights > 0 && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-lg mb-4">
              <Shield size={18} />
              <span className="text-sm font-medium">Dates available!</span>
            </div>
          )}

          {isAvailable === false && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg mb-4">
              <AlertCircle size={18} />
              <span className="text-sm font-medium">
                Selected dates not available. Please choose different dates.
              </span>
            </div>
          )}

          {/* Reserve Button */}
          <button
            onClick={handleReserve}
            disabled={!canProceed || isAvailable === false}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              canProceed && isAvailable !== false
                ? "btn-primary"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {villa.isAvailable ? "Reserve" : "Not Available"}
          </button>

          {canProceed && isAvailable !== false && (
            <p className="text-center text-sm text-muted-foreground mt-3">
              You won't be charged yet
            </p>
          )}

          {/* Price Breakdown */}
          {nights > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground underline">
                  {formatCurrency(villa.pricePerNight)} × {nights} nights
                </span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground underline">Cleaning fee</span>
                <span>{formatCurrency(villa.cleaningFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground underline">Service fee (10%)</span>
                <span>{formatCurrency(serviceAmount)}</span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          )}

          {/* Minimum Stay Notice */}
          {nights > 0 && nights < villa.minimumStay && (
            <p className="text-sm text-destructive mt-3">
              Minimum stay: {villa.minimumStay} nights
            </p>
          )}

          {/* Contact Host */}
          <button className="w-full mt-4 btn-outline flex items-center justify-center gap-2">
            <MessageCircle size={18} />
            Contact Host
          </button>

          {/* Cancellation Policy */}
          <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
            <Shield size={18} className="text-primary flex-shrink-0 mt-0.5" />
            <p>
              <span className="font-medium text-foreground">Free cancellation</span> before 48 hours
              of check-in. Cancel anytime for a full refund.
            </p>
          </div>
        </div>
      </motion.div>

      <AdvancedDatePicker
        bookedDates={allBookedDates}
        checkIn={checkIn}
        checkOut={checkOut}
        onCheckInChange={(date) => {
          setCheckIn(date);
          setIsAvailable(null);
        }}
        onCheckOutChange={(date) => {
          setCheckOut(date);
          setIsAvailable(null);
        }}
        minimumStay={villa.minimumStay}
        maximumStay={30}
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />
    </>
  );
};

export default BookingWidget;
