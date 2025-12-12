import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Calendar, Users, Download, CalendarPlus, Home, Mail, Phone, Clock, MapPin, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useBookingStore, type CompletedBooking } from "@/store/bookingStore";
import { formatCurrency } from "@/utils/booking";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const BookingConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const referenceNumber = searchParams.get("ref");
  
  const { fetchBookingByReference, isLoading, error } = useBookingStore();
  const [booking, setBooking] = useState<CompletedBooking | null>(null);

  useEffect(() => {
    if (!referenceNumber) {
      navigate("/villas");
      return;
    }

    const loadBooking = async () => {
      const fetchedBooking = await fetchBookingByReference(referenceNumber);
      if (fetchedBooking) {
        setBooking(fetchedBooking);
      } 
    };

    loadBooking();

  }, [referenceNumber, fetchBookingByReference, navigate]);

  const handleDownloadReceipt = () => {
    if (!booking) return;
    const receiptContent = `
      STAYINUBUD BOOKING CONFIRMATION
      ================================
      Reference: ${booking.referenceNumber}
      Status: ${booking.status.toUpperCase()}
      
      VILLA: ${booking.villaName}
      DATES: ${format(parseISO(booking.checkIn), "MMM d, yyyy")} - ${format(parseISO(booking.checkOut), "MMM d, yyyy")}
      GUEST: ${booking.guestDetails.fullName} (${booking.guestDetails.email})
      TOTAL: ${formatCurrency(booking.total)}
      
      Thank you for your booking!
    `.trim();

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `StayinUBUD-Receipt-${booking.referenceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading || !booking && !error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
                <AlertTriangle size={48} className="mx-auto text-destructive"/>
                <h1 className="text-2xl font-bold">Booking Not Found</h1>
                <p className="text-muted-foreground">The booking reference <code className="bg-muted p-1 rounded">{referenceNumber}</code> is invalid or has expired.</p>
                <Button asChild><Link to="/villas">Browse Villas</Link></Button>
            </div>
      </div>
    );
  }
  
  if (!booking) return null; // Should not happen if logic is correct

  const checkInDate = parseISO(booking.checkIn);
  const checkOutDate = parseISO(booking.checkOut);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.6 }} className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 size={48} className="text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold mb-4">Booking Confirmed!</h1>
            <p className="text-muted-foreground text-lg">Thank you for choosing StayinUBUD</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-primary/10 rounded-2xl p-6 text-center mb-8">
            <p className="text-sm text-muted-foreground mb-2">Booking Reference</p>
            <p className="text-2xl font-mono font-bold text-primary tracking-wider">{booking.referenceNumber}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl overflow-hidden mb-8">
            <img src={booking.villaImage} alt={booking.villaName} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h2 className="font-display text-xl font-semibold mb-4">{booking.villaName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3"><Calendar size={20} className="text-primary" /><div><p className="text-sm text-muted-foreground">Check-in</p><p className="font-medium">{format(checkInDate, "EEE, MMM d, yyyy")}</p></div></div>
                  <div className="flex items-center gap-3"><Calendar size={20} className="text-primary" /><div><p className="text-sm text-muted-foreground">Check-out</p><p className="font-medium">{format(checkOutDate, "EEE, MMM d, yyyy")}</p></div></div>
              </div>
              <div className="flex items-center gap-3 mb-6"><Users size={20} className="text-primary" /><span>{booking.guests} guests</span></div>
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(booking.total)}</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={handleDownloadReceipt} variant="outline" size="lg" className="flex items-center gap-2"><Download size={20} />Download Receipt</Button>
            <Button variant="outline" size="lg" className="flex items-center gap-2"><CalendarPlus size={20} />Add to Calendar</Button>
            <Button asChild size="lg" className="flex items-center gap-2"><Link to="/"><Home size={20} />Back to Home</Link></Button>
          </motion.div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingConfirmationPage;
