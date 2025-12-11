import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  CreditCard,
  Building2,
  Wallet,
  Check,
  Calendar,
  Users,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format, addDays, eachDayOfInterval } from "date-fns";
import { useBookingStore, generateReferenceNumber } from "@/store/bookingStore";
import { formatCurrency } from "@/utils/booking";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EmailConfirmationModal from "@/components/EmailConfirmationModal";

const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard },
  { id: "bank", name: "Bank Transfer", icon: Building2 },
  { id: "wallet", name: "E-Wallet (GoPay, OVO, Dana)", icon: Wallet },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { booking, setGuestDetails, addCompletedBooking, addBookedDates, clearBooking, saveBookingToSupabase } =
    useBookingStore();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [completedBookingData, setCompletedBookingData] = useState<{
    referenceNumber: string;
    villaName: string;
    guestName: string;
    guestEmail: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    total: number;
  } | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("+62 ");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [agreedCancellation, setAgreedCancellation] = useState(false);
  const [agreedHouseRules, setAgreedHouseRules] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!booking) {
      navigate("/villas");
    }
  }, [booking, navigate]);

  if (!booking) return null;

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (fullName.trim().length > 100) {
      newErrors.fullName = "Name must be less than 100 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    } else if (email.length > 255) {
      newErrors.email = "Email must be less than 255 characters";
    }

    if (!whatsapp.trim() || whatsapp === "+62 ") {
      newErrors.whatsapp = "WhatsApp number is required";
    } else if (!/^\+62\s?\d{9,13}$/.test(whatsapp.replace(/\s/g, ""))) {
      newErrors.whatsapp = "Invalid Indonesian WhatsApp format (e.g., +62 812 3456 7890)";
    }

    if (specialRequests.length > 1000) {
      newErrors.specialRequests = "Special requests must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) {
      return;
    }
    setStep(step + 1);
  };

  const handleCompleteBooking = async () => {
    if (!agreedCancellation || !agreedHouseRules || !agreedPrivacy) {
      toast({
        title: "Agreement required",
        description: "Please agree to all terms and policies.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const referenceNumber = generateReferenceNumber();
    const bookingId = crypto.randomUUID();

    // Generate booked dates
    const checkInDate = new Date(booking.checkIn!);
    const checkOutDate = new Date(booking.checkOut!);
    const bookedDates = eachDayOfInterval({
      start: checkInDate,
      end: addDays(checkOutDate, -1),
    }).map((date) => format(date, "yyyy-MM-dd"));

    const guestDetailsData = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      whatsapp: whatsapp.trim(),
      specialRequests: specialRequests.trim(),
    };

    // Save guest details
    setGuestDetails(guestDetailsData);

    const completedBooking = {
      id: bookingId,
      referenceNumber,
      villaId: booking.villaId,
      villaName: booking.villaName,
      villaImage: booking.villaImage,
      checkIn: format(checkInDate, "yyyy-MM-dd"),
      checkOut: format(checkOutDate, "yyyy-MM-dd"),
      guests: booking.guests,
      total: booking.total,
      status: "confirmed" as const,
      guestDetails: guestDetailsData,
      paymentMethod,
      createdAt: new Date().toISOString(),
    };

    // Save to Supabase
    const { success, error } = await saveBookingToSupabase(completedBooking);

    if (!success) {
      setIsSubmitting(false);
      toast({
        title: "Booking failed",
        description: error || "Failed to save booking. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Add completed booking to local state
    addCompletedBooking(completedBooking);

    // Add booked dates globally
    addBookedDates(booking.villaId, bookedDates);

    setIsSubmitting(false);

    // Show email confirmation modal
    setCompletedBookingData({
      referenceNumber,
      villaName: booking.villaName,
      guestName: guestDetailsData.fullName,
      guestEmail: guestDetailsData.email,
      checkIn: format(checkInDate, "yyyy-MM-dd"),
      checkOut: format(checkOutDate, "yyyy-MM-dd"),
      guests: booking.guests,
      total: booking.total,
    });
    setShowEmailModal(true);
  };

  const handleEmailModalClose = () => {
    setShowEmailModal(false);
    if (completedBookingData) {
      navigate(`/booking-confirmation?ref=${completedBookingData.referenceNumber}`);
    }
  };

  const checkInDate = booking.checkIn ? new Date(booking.checkIn) : null;
  const checkOutDate = booking.checkOut ? new Date(booking.checkOut) : null;
  const cancellationDate = checkInDate ? addDays(checkInDate, -2) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Button */}
          <Link
            to={`/villas/${booking.villaId}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Villa
          </Link>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  {step > s ? <Check size={16} /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-12 md:w-24 h-1 mx-1 rounded ${step > s ? "bg-primary" : "bg-muted"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Booking Summary (Sticky) */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24"
              >
                <div className="glass-card rounded-2xl overflow-hidden shadow-elevated">
                  <img
                    src={booking.villaImage}
                    alt={booking.villaName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="font-display text-xl font-semibold mb-4">
                      {booking.villaName}
                    </h3>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-primary" />
                        <div>
                          <span className="font-medium">
                            {checkInDate && format(checkInDate, "MMM d")}
                          </span>
                          <span className="text-muted-foreground"> → </span>
                          <span className="font-medium">
                            {checkOutDate && format(checkOutDate, "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users size={18} className="text-primary" />
                        <span>{booking.guests} guests</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {formatCurrency(booking.nightlyRate)} × {booking.nights} nights
                        </span>
                        <span>{formatCurrency(booking.nightlyRate * booking.nights)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cleaning fee</span>
                        <span>{formatCurrency(booking.cleaningFee)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service fee</span>
                        <span>{formatCurrency(booking.serviceFee)}</span>
                      </div>
                      <div className="pt-3 border-t border-border flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-primary">{formatCurrency(booking.total)}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-sm text-primary">
                      <Shield size={16} />
                      <span className="font-medium">Secure Booking</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Form Steps */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Contact Details */}
                {step === 1 && (
                  <div className="glass-card rounded-2xl p-8">
                    <h2 className="font-display text-2xl font-semibold mb-6">Contact Details</h2>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Full Name <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border ${errors.fullName ? "border-destructive" : "border-border"
                            } bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                          placeholder="Enter your full name"
                        />
                        {errors.fullName && (
                          <p className="mt-1 text-sm text-destructive">{errors.fullName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email Address <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border ${errors.email ? "border-destructive" : "border-border"
                            } bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                          placeholder="your@email.com"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          WhatsApp Number <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border ${errors.whatsapp ? "border-destructive" : "border-border"
                              } bg-background focus:outline-none focus:ring-2 focus:ring-primary`}
                            placeholder="+62 812 3456 7890"
                            maxLength={20}
                          />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          We will contact you via WhatsApp for booking updates
                        </p>
                        {errors.whatsapp && (
                          <p className="mt-1 text-sm text-destructive">{errors.whatsapp}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Special Requests (Optional)
                        </label>
                        <textarea
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          rows={4}
                          maxLength={1000}
                          className={`w-full px-4 py-3 rounded-xl border ${errors.specialRequests ? "border-destructive" : "border-border"
                            } bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none`}
                          placeholder="Early check-in, late check-out, dietary requirements, airport pickup, etc..."
                        />
                        <div className="flex justify-between mt-1">
                          <p className="text-xs text-muted-foreground">
                            Let us know how we can make your stay special
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {specialRequests.length}/1000
                          </span>
                        </div>
                        {errors.specialRequests && (
                          <p className="mt-1 text-sm text-destructive">{errors.specialRequests}</p>
                        )}
                      </div>
                    </div>

                    <button onClick={handleNextStep} className="w-full mt-8 btn-primary py-4">
                      Continue to Payment
                    </button>
                  </div>
                )}

                {/* Step 2: Payment Method */}
                {step === 2 && (
                  <div className="glass-card rounded-2xl p-8">
                    <h2 className="font-display text-2xl font-semibold mb-6">Payment Method</h2>

                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-colors ${paymentMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                            }`}
                        >
                          <method.icon
                            size={24}
                            className={
                              paymentMethod === method.id ? "text-primary" : "text-muted-foreground"
                            }
                          />
                          <span className="font-medium">{method.name}</span>
                          {paymentMethod === method.id && (
                            <Check size={20} className="ml-auto text-primary" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Mock Payment Details */}
                    {paymentMethod === "card" && (
                      <div className="mt-6 p-4 bg-secondary/50 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-4">
                          Card details will be collected on the next screen (demo mode)
                        </p>
                        <div className="flex gap-2">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png"
                            alt="Mastercard"
                            className="h-6"
                          />
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png"
                            alt="Visa"
                            className="h-6"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === "bank" && (
                      <div className="mt-6 p-4 bg-secondary/50 rounded-xl">
                        <p className="text-sm font-medium mb-2">Bank Transfer Details:</p>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Bank: Bank Central Asia (BCA)</p>
                          <p>Account: 1234567890</p>
                          <p>Name: PT StayinUBUD Indonesia</p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "wallet" && (
                      <div className="mt-6 p-4 bg-secondary/50 rounded-xl flex gap-4">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-blue-500 rounded-xl mb-1" />
                          <span className="text-xs">GoPay</span>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-purple-500 rounded-xl mb-1" />
                          <span className="text-xs">OVO</span>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-blue-600 rounded-xl mb-1" />
                          <span className="text-xs">Dana</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 mt-8">
                      <button onClick={() => setStep(1)} className="flex-1 btn-outline py-4">
                        Back
                      </button>
                      <button onClick={handleNextStep} className="flex-1 btn-primary py-4">
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Cancellation Policy */}
                {step === 3 && (
                  <div className="glass-card rounded-2xl p-8">
                    <h2 className="font-display text-2xl font-semibold mb-6">Cancellation Policy</h2>

                    <div className="bg-secondary/50 rounded-xl p-6 mb-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Check size={24} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Free Cancellation</h3>
                          <p className="text-sm text-muted-foreground">
                            Cancel for free before{" "}
                            <span className="font-medium text-foreground">
                              {cancellationDate && format(cancellationDate, "MMMM d, yyyy")}
                            </span>{" "}
                            (48 hours before check-in)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 text-sm text-muted-foreground">
                      <p>
                        • Full refund if cancelled at least 48 hours before check-in time
                      </p>
                      <p>
                        • 50% refund if cancelled between 24-48 hours before check-in
                      </p>
                      <p>• No refund if cancelled less than 24 hours before check-in</p>
                      <p>• Check-in time is 3:00 PM local time</p>
                    </div>

                    <label className="flex items-start gap-3 mt-6 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedCancellation}
                        onChange={(e) => setAgreedCancellation(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm">
                        I have read and agree to the cancellation policy
                      </span>
                    </label>

                    <div className="flex gap-4 mt-8">
                      <button onClick={() => setStep(2)} className="flex-1 btn-outline py-4">
                        Back
                      </button>
                      <button
                        onClick={handleNextStep}
                        disabled={!agreedCancellation}
                        className={`flex-1 py-4 rounded-xl font-semibold transition-colors ${agreedCancellation
                          ? "btn-primary"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                          }`}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Terms & Complete */}
                {step === 4 && (
                  <div className="glass-card rounded-2xl p-8">
                    <h2 className="font-display text-2xl font-semibold mb-6">
                      Terms & Conditions
                    </h2>

                    <div className="space-y-4">
                      <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-border hover:border-primary/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={agreedHouseRules}
                          onChange={(e) => setAgreedHouseRules(e.target.checked)}
                          className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        <div>
                          <span className="font-medium">House Rules</span>
                          <p className="text-sm text-muted-foreground mt-1">
                            I agree to follow the house rules including check-in/out times, no
                            smoking, and quiet hours policies.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-border hover:border-primary/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={agreedPrivacy}
                          onChange={(e) => setAgreedPrivacy(e.target.checked)}
                          className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        <div>
                          <span className="font-medium">Privacy Policy</span>
                          <p className="text-sm text-muted-foreground mt-1">
                            I have read and agree to the privacy policy and terms of service.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-border hover:border-primary/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={newsletter}
                          onChange={(e) => setNewsletter(e.target.checked)}
                          className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary"
                        />
                        <div>
                          <span className="font-medium">Newsletter (Optional)</span>
                          <p className="text-sm text-muted-foreground mt-1">
                            Receive exclusive offers and updates from StayinUBUD.
                          </p>
                        </div>
                      </label>
                    </div>

                    {(!agreedHouseRules || !agreedPrivacy) && (
                      <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg mt-6">
                        <AlertCircle size={18} />
                        <span className="text-sm">
                          Please agree to the house rules and privacy policy to continue.
                        </span>
                      </div>
                    )}

                    <div className="flex gap-4 mt-8">
                      <button onClick={() => setStep(3)} className="flex-1 btn-outline py-4">
                        Back
                      </button>
                      <button
                        onClick={handleCompleteBooking}
                        disabled={!agreedHouseRules || !agreedPrivacy || isSubmitting}
                        className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-colors ${agreedHouseRules && agreedPrivacy && !isSubmitting
                          ? "btn-primary"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                          }`}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          `Complete Booking • ${formatCurrency(booking.total)}`
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Email Confirmation Modal */}
      {completedBookingData && (
        <EmailConfirmationModal
          isOpen={showEmailModal}
          onClose={handleEmailModalClose}
          booking={completedBookingData}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
