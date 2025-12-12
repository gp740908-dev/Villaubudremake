import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Shield, CreditCard, Building2, Wallet, Check, Calendar, Users, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useBookingStore, generateReferenceNumber, type CompletedBooking, type GuestDetails } from "@/store/bookingStore";
import { formatCurrency } from "@/utils/booking";
import { toast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmailConfirmationModal from "@/components/EmailConfirmationModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard },
  { id: "bank", name: "Bank Transfer", icon: Building2 },
  { id: "wallet", name: "E-Wallet (GoPay, OVO, Dana)", icon: Wallet },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { booking, saveBooking, clearBooking } = useBookingStore();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [finalizedBooking, setFinalizedBooking] = useState<CompletedBooking | null>(null);

  // Form state
  const [guestDetails, setGuestDetails] = useState<Omit<GuestDetails, 'specialRequests'> & { specialRequests?: string }>({ 
    fullName: "", email: "", whatsapp: "+62 ", country: "Indonesia", idType: "KTP", idNumber: "", arrivalTime: "15:00"
  });
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [agreements, setAgreements] = useState({ cancellation: false, rules: false, privacy: false, newsletter: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!booking) {
      toast({ title: "No active booking", description: "Please start a new booking.", variant: "destructive" });
      navigate("/villas");
    }
  }, [booking, navigate]);

  if (!booking) return null;

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!guestDetails.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!guestDetails.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestDetails.email)) newErrors.email = "Invalid email format";
    if (!guestDetails.whatsapp.trim() || guestDetails.whatsapp === "+62 ") newErrors.whatsapp = "WhatsApp number is required";
    if (!guestDetails.idNumber.trim()) newErrors.idNumber = "ID Number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCompleteBooking = async () => {
    if (!agreements.rules || !agreements.privacy) {
      toast({ title: "Agreement required", description: "Please agree to all terms and policies.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const fullGuestDetails: GuestDetails = { ...guestDetails, specialRequests: specialRequests.trim() };

    const completedBooking: CompletedBooking = {
      id: crypto.randomUUID(),
      referenceNumber: generateReferenceNumber(),
      villaId: booking.villaId,
      villaName: booking.villaName,
      villaImage: booking.villaImage,
      checkIn: format(booking.checkIn!, "yyyy-MM-dd"),
      checkOut: format(booking.checkOut!, "yyyy-MM-dd"),
      guests: booking.guests,
      nights: booking.nights,
      basePrice: booking.nightlyRate * booking.nights,
      cleaningFee: booking.cleaningFee,
      serviceFee: booking.serviceFee,
      discountAmount: 0, // Placeholder
      discountCode: null, // Placeholder
      total: booking.total,
      status: "confirmed",
      paymentStatus: "pending",
      guestDetails: fullGuestDetails,
      paymentMethod,
      createdAt: new Date().toISOString(),
    };

    const { success, error } = await saveBooking(completedBooking);

    setIsSubmitting(false);
    if (success) {
      setFinalizedBooking(completedBooking);
      setShowEmailModal(true);
    } else {
      toast({ title: "Booking Failed", description: error || "Could not save your booking. Please try again.", variant: "destructive" });
    }
  };

  const handleEmailModalClose = () => {
    setShowEmailModal(false);
    clearBooking();
    if (finalizedBooking) {
      navigate(`/booking-confirmation?ref=${finalizedBooking.referenceNumber}`);
    }
  };
  
  const handleInputChange = (field: keyof GuestDetails, value: string) => {
    setGuestDetails(prev => ({ ...prev, [field]: value }));
  };

  // Render logic for steps, form fields etc.
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
            <Link to={`/villas/${booking.villaId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
                <ArrowLeft size={18} /> Back to Villa
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 order-2 lg:order-1">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-24">
                        <div className="glass-card rounded-2xl overflow-hidden shadow-elevated">
                            <img src={booking.villaImage} alt={booking.villaName} className="w-full h-48 object-cover" />
                            <div className="p-6">
                                <h3 className="font-display text-xl font-semibold mb-4">{booking.villaName}</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3"><Calendar size={18} className="text-primary" /><div><span className="font-medium">{format(booking.checkIn!, "MMM d")}</span><span className="text-muted-foreground"> → </span><span className="font-medium">{format(booking.checkOut!, "MMM d, yyyy")}</span></div></div>
                                    <div className="flex items-center gap-3"><Users size={18} className="text-primary" /><span>{booking.guests} guests</span></div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-border space-y-3">
                                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">{formatCurrency(booking.nightlyRate)} × {booking.nights} nights</span><span>{formatCurrency(booking.nightlyRate * booking.nights)}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Cleaning fee</span><span>{formatCurrency(booking.cleaningFee)}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Service fee</span><span>{formatCurrency(booking.serviceFee)}</span></div>
                                    <div className="pt-3 border-t border-border flex justify-between font-semibold text-lg"><span>Total</span><span className="text-primary">{formatCurrency(booking.total)}</span></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="lg:col-span-2 order-1 lg:order-2">
                    <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        {step === 1 && (
                            <div className="glass-card rounded-2xl p-8">
                                <h2 className="font-display text-2xl font-semibold mb-6">Your Details</h2>
                                <div className="space-y-4">
                                    <Input label="Full Name" value={guestDetails.fullName} onChange={e => handleInputChange("fullName", e.target.value)} error={errors.fullName} required />
                                    <Input label="Email Address" type="email" value={guestDetails.email} onChange={e => handleInputChange("email", e.target.value)} error={errors.email} required />
                                    <Input label="WhatsApp Number" type="tel" value={guestDetails.whatsapp} onChange={e => handleInputChange("whatsapp", e.target.value)} error={errors.whatsapp} required />
                                    <Select value={guestDetails.country} onValueChange={value => handleInputChange("country", value)}><SelectTrigger><SelectValue placeholder="Country/Region" /></SelectTrigger><SelectContent><SelectItem value="Indonesia">Indonesia</SelectItem><SelectItem value="United States">United States</SelectItem></SelectContent></Select>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Select value={guestDetails.idType} onValueChange={value => handleInputChange("idType", value)}><SelectTrigger><SelectValue placeholder="ID Type" /></SelectTrigger><SelectContent><SelectItem value="KTP">KTP</SelectItem><SelectItem value="Passport">Passport</SelectItem></SelectContent></Select>
                                        <Input label="ID Number" value={guestDetails.idNumber} onChange={e => handleInputChange("idNumber", e.target.value)} error={errors.idNumber} required />
                                    </div>
                                    <Select value={guestDetails.arrivalTime} onValueChange={value => handleInputChange("arrivalTime", value)}><SelectTrigger><SelectValue placeholder="Arrival Time" /></SelectTrigger><SelectContent>{["15:00", "16:00", "17:00", "18:00", "19:00", "20:00+"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                                    <Textarea label="Special Requests" value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} placeholder="Airport pickup, dietary needs, etc." />
                                </div>
                                <Button onClick={() => validateStep1() && setStep(2)} size="lg" className="w-full mt-8">Continue</Button>
                            </div>
                        )}
                        {step === 2 && (
                             <div className="glass-card rounded-2xl p-8">
                                <h2 className="font-display text-2xl font-semibold mb-6">Final Confirmation</h2>
                                <div className="space-y-4">
                                   { /* Payment Method Selection */ }
                                   <h3 class="text-lg font-medium">Payment Method</h3>
                                   <div className="space-y-2">
                                     {paymentMethods.map((method) => (
                                        <button key={method.id} onClick={() => setPaymentMethod(method.id)} className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-colors ${paymentMethod === method.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                                          <method.icon size={24} className={paymentMethod === method.id ? "text-primary" : "text-muted-foreground"} />
                                          <span className="font-medium">{method.name}</span>
                                          {paymentMethod === method.id && <Check size={20} className="ml-auto text-primary" />}
                                        </button>
                                      ))}
                                   </div>
                                   { /* Agreements */ }
                                   <h3 class="text-lg font-medium pt-4">Agreements</h3>
                                   <div className="space-y-2">
                                        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-transparent hover:bg-secondary/50"><input type="checkbox" checked={agreements.rules} onChange={e => setAgreements(p => ({...p, rules: e.target.checked}))} className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary"/><div><span className="font-medium">House Rules</span><p className="text-sm text-muted-foreground">I agree to the house rules, including check-in/out times and no-smoking policy.</p></div></label>
                                        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-transparent hover:bg-secondary/50"><input type="checkbox" checked={agreements.privacy} onChange={e => setAgreements(p => ({...p, privacy: e.target.checked}))} className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary"/><div><span className="font-medium">Privacy Policy</span><p className="text-sm text-muted-foreground">I agree to the privacy policy and terms of service.</p></div></label>
                                   </div>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <Button onClick={() => setStep(1)} variant="outline" size="lg" className="flex-1">Back</Button>
                                    <Button onClick={handleCompleteBooking} disabled={!agreements.rules || !agreements.privacy || isSubmitting} size="lg" className="flex-1">
                                      {isSubmitting ? <Loader2 className="animate-spin" /> : `Complete Booking • ${formatCurrency(booking.total)}`}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
      </main>
      <Footer />
      {finalizedBooking && (
        <EmailConfirmationModal
          isOpen={showEmailModal}
          onClose={handleEmailModalClose}
          booking={{
              referenceNumber: finalizedBooking.referenceNumber,
              villaName: finalizedBooking.villaName,
              guestName: finalizedBooking.guestDetails.fullName,
              guestEmail: finalizedBooking.guestDetails.email,
              checkIn: finalizedBooking.checkIn,
              checkOut: finalizedBooking.checkOut,
              guests: finalizedBooking.guests,
              total: finalizedBooking.total
          }}
        />
      )}
    </div>
  );
};

// A generic Input component to reduce repetition
const Input = ({ label, error, required, ...props }) => (
    <div>
        <label className="block text-sm font-medium mb-2">{label} {required && <span className="text-destructive">*</span>}</label>
        <input {...props} className={`w-full px-4 py-3 rounded-xl border ${error ? "border-destructive" : "border-border"} bg-background focus:outline-none focus:ring-2 focus:ring-primary`} />
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
);

export default CheckoutPage;
