import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Calendar,
  Users,
  MapPin,
  Download,
  CalendarPlus,
  Home,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useBookingStore } from "@/store/bookingStore";
import { formatCurrency } from "@/utils/booking";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BookingConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const referenceNumber = searchParams.get("ref");
  const { completedBookings, clearBooking } = useBookingStore();

  const booking = useMemo(() => {
    return completedBookings.find((b) => b.referenceNumber === referenceNumber);
  }, [completedBookings, referenceNumber]);

  useEffect(() => {
    if (!booking) {
      // Allow some time for the store to hydrate
      const timeout = setTimeout(() => {
        if (!booking) {
          navigate("/villas");
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
    // Clear the pending booking after showing confirmation
    clearBooking();
  }, [booking, navigate, clearBooking]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  const checkInDate = parseISO(booking.checkIn);
  const checkOutDate = parseISO(booking.checkOut);

  const handleDownloadReceipt = () => {
    // In production, this would generate a PDF
    const receiptContent = `
STAYINUBUD BOOKING CONFIRMATION
================================
Reference: ${booking.referenceNumber}
Status: ${booking.status.toUpperCase()}

VILLA DETAILS
-------------
${booking.villaName}

DATES
-----
Check-in: ${format(checkInDate, "EEEE, MMMM d, yyyy")} at 3:00 PM
Check-out: ${format(checkOutDate, "EEEE, MMMM d, yyyy")} at 11:00 AM

GUEST
-----
Name: ${booking.guestDetails.fullName}
Email: ${booking.guestDetails.email}
WhatsApp: ${booking.guestDetails.whatsapp}
Guests: ${booking.guests}

PAYMENT
-------
Total: ${formatCurrency(booking.total)}
Payment Method: ${booking.paymentMethod}

Thank you for booking with StayinUBUD!
    `.trim();

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `StayinUBUD-${booking.referenceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddToCalendar = () => {
    const title = `Stay at ${booking.villaName}`;
    const details = `Booking Reference: ${booking.referenceNumber}`;
    const startDate = format(checkInDate, "yyyyMMdd");
    const endDate = format(checkOutDate, "yyyyMMdd");

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}`;

    window.open(googleCalendarUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <CheckCircle2 size={48} className="text-primary" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="font-display text-3xl md:text-4xl font-semibold mb-4">
                Booking Confirmed!
              </h1>
              <p className="text-muted-foreground text-lg">
                Thank you for choosing StayinUBUD
              </p>
            </motion.div>
          </motion.div>

          {/* Reference Number */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-primary/10 rounded-2xl p-6 text-center mb-8"
          >
            <p className="text-sm text-muted-foreground mb-2">Booking Reference</p>
            <p className="text-2xl font-mono font-bold text-primary tracking-wider">
              {booking.referenceNumber}
            </p>
          </motion.div>

          {/* Booking Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card rounded-2xl overflow-hidden mb-8"
          >
            <img
              src={booking.villaImage}
              alt={booking.villaName}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="font-display text-xl font-semibold mb-4">
                {booking.villaName}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Check-in</p>
                    <p className="font-medium">
                      {format(checkInDate, "EEE, MMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">from 3:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Check-out</p>
                    <p className="font-medium">
                      {format(checkOutDate, "EEE, MMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">before 11:00 AM</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <Users size={20} className="text-primary" />
                <span>{booking.guests} guests</span>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(booking.total)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card rounded-2xl p-6 mb-8"
          >
            <h3 className="font-display text-lg font-semibold mb-4">What's Next?</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">Check Your Email</p>
                  <p className="text-sm text-muted-foreground">
                    Confirmation details have been sent to {booking.guestDetails.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Phone size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">Host Contact</p>
                  <p className="text-sm text-muted-foreground">
                    Your host will contact you within 24 hours with arrival instructions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">Arrival Instructions</p>
                  <p className="text-sm text-muted-foreground">
                    Check-in is at 3:00 PM. Detailed directions will be sent before your
                    arrival.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">Airport Transfer</p>
                  <p className="text-sm text-muted-foreground">
                    Contact your host if you need assistance arranging transportation
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <button
              onClick={handleDownloadReceipt}
              className="btn-outline flex items-center justify-center gap-2 py-4"
            >
              <Download size={20} />
              Download Receipt
            </button>

            <button
              onClick={handleAddToCalendar}
              className="btn-outline flex items-center justify-center gap-2 py-4"
            >
              <CalendarPlus size={20} />
              Add to Calendar
            </button>

            <Link
              to="/"
              className="btn-primary flex items-center justify-center gap-2 py-4"
            >
              <Home size={20} />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingConfirmationPage;
