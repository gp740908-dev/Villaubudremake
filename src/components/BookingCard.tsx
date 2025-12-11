import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Users,
  MessageCircle,
  Shield,
  Star,
  AlertCircle,
  X,
  ChevronUp
} from "lucide-react";
import { Villa } from "@/data/villas";
import { formatCurrency, calculateNights, calculateTotal, isDateBooked } from "@/utils/booking";
import { useBookingStore } from "@/store/bookingStore";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface BookingCardProps {
  villa: Villa;
}

const BookingCard = ({ villa }: BookingCardProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setBooking } = useBookingStore();
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [isExpanded, setIsExpanded] = useState(false);

  const nights = useMemo(() => calculateNights(checkIn, checkOut), [checkIn, checkOut]);

  const total = useMemo(
    () => calculateTotal(villa.pricePerNight, nights, villa.cleaningFee, villa.serviceFee),
    [nights, villa.pricePerNight, villa.cleaningFee, villa.serviceFee]
  );

  const isDateUnavailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || isDateBooked(date, villa.bookedDates);
  };

  const canBook = checkIn && checkOut && nights >= villa.minimumStay && villa.isAvailable;

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

    toast({
      title: "Reservation started!",
      description: "Complete your booking details to confirm.",
    });

    // Navigate to checkout
    navigate('/checkout');
  };

  // Desktop version
  const DesktopBookingCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-24"
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

        {/* Date Pickers */}
        <div className="border border-border rounded-xl overflow-hidden mb-4">
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="p-3">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                CHECK-IN
              </label>
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
              />
            </div>
            <div className="p-3">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                CHECK-OUT
              </label>
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
              />
            </div>
          </div>
          <div className="border-t border-border p-3">
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              GUESTS
            </label>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-muted-foreground" />
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full bg-transparent text-foreground focus:outline-none text-sm font-medium appearance-none cursor-pointer"
              >
                {Array.from({ length: villa.capacity }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "guest" : "guests"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Reserve Button */}
        <button
          onClick={handleReserve}
          disabled={!canBook}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${canBook
              ? "btn-primary"
              : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
        >
          {villa.isAvailable ? "Reserve" : "Not Available"}
        </button>

        {canBook && (
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
            <span className="font-medium text-foreground">Free cancellation</span> before
            48 hours of check-in. Cancel anytime for a full refund.
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Mobile version - Fixed bottom bar with expandable sheet
  const MobileBookingCard = () => (
    <>
      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(villa.pricePerNight)}
              </span>
              <span className="text-sm text-muted-foreground">/night</span>
            </div>
            {nights > 0 && (
              <p className="text-xs text-muted-foreground">
                {nights} nights · {formatCurrency(total)} total
              </p>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            {checkIn && checkOut ? "Reserve" : "Check Availability"}
            <ChevronUp size={18} />
          </button>
        </div>
      </div>

      {/* Expandable Booking Sheet */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-foreground/50 z-50"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Book Your Stay</h3>
                  <p className="text-sm text-muted-foreground">{villa.name}</p>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 space-y-4 pb-8">
                {/* Price Header */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-bold text-foreground">
                      {formatCurrency(villa.pricePerNight)}
                    </span>
                    <span className="text-muted-foreground"> /night</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{villa.rating}</span>
                    <span className="text-muted-foreground">({villa.reviewCount})</span>
                  </div>
                </div>

                {/* Availability Status */}
                {!villa.isAvailable && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">Currently unavailable</span>
                  </div>
                )}

                {/* Date Pickers */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="p-3 border-b border-border">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      CHECK-IN
                    </label>
                    <DatePicker
                      selected={checkIn}
                      onChange={(date) => setCheckIn(date)}
                      selectsStart
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={new Date()}
                      filterDate={(date) => !isDateUnavailable(date)}
                      placeholderText="Add date"
                      className="w-full bg-transparent text-foreground focus:outline-none text-sm font-medium"
                      dateFormat="MMM d, yyyy"
                      withPortal
                    />
                  </div>
                  <div className="p-3 border-b border-border">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      CHECK-OUT
                    </label>
                    <DatePicker
                      selected={checkOut}
                      onChange={(date) => setCheckOut(date)}
                      selectsEnd
                      startDate={checkIn}
                      endDate={checkOut}
                      minDate={checkIn || new Date()}
                      filterDate={(date) => !isDateUnavailable(date)}
                      placeholderText="Add date"
                      className="w-full bg-transparent text-foreground focus:outline-none text-sm font-medium"
                      dateFormat="MMM d, yyyy"
                      withPortal
                    />
                  </div>
                  <div className="p-3">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      GUESTS
                    </label>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-muted-foreground" />
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full bg-transparent text-foreground focus:outline-none text-sm font-medium appearance-none cursor-pointer"
                      >
                        {Array.from({ length: villa.capacity }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "guest" : "guests"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                {nights > 0 && (
                  <div className="space-y-2 p-4 bg-secondary/30 rounded-xl">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatCurrency(villa.pricePerNight)} × {nights} nights
                      </span>
                      <span>{formatCurrency(villa.pricePerNight * nights)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cleaning fee</span>
                      <span>{formatCurrency(villa.cleaningFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service fee</span>
                      <span>{formatCurrency(villa.serviceFee)}</span>
                    </div>
                    <div className="pt-2 border-t border-border flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                )}

                {/* Minimum Stay Notice */}
                {nights > 0 && nights < villa.minimumStay && (
                  <p className="text-sm text-destructive">
                    Minimum stay: {villa.minimumStay} nights
                  </p>
                )}

                {/* Reserve Button */}
                <button
                  onClick={handleReserve}
                  disabled={!canBook}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${canBook
                      ? "btn-primary"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                >
                  {villa.isAvailable ? "Reserve" : "Not Available"}
                </button>

                {canBook && (
                  <p className="text-center text-sm text-muted-foreground">
                    You won't be charged yet
                  </p>
                )}

                {/* Contact Host */}
                <button className="w-full btn-outline flex items-center justify-center gap-2">
                  <MessageCircle size={18} />
                  Contact Host
                </button>

                {/* Cancellation Policy */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Shield size={18} className="text-primary flex-shrink-0 mt-0.5" />
                  <p>
                    <span className="font-medium text-foreground">Free cancellation</span> before
                    48 hours of check-in.
                  </p>
                </div>
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
