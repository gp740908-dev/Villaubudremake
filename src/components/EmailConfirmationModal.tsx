import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, CheckCircle2, Calendar, Users, MapPin, Download } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/booking";

interface EmailConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: {
        referenceNumber: string;
        villaName: string;
        guestName: string;
        guestEmail: string;
        checkIn: string;
        checkOut: string;
        guests: number;
        total: number;
    };
}

const EmailConfirmationModal = ({
    isOpen,
    onClose,
    booking,
}: EmailConfirmationModalProps) => {
    const handleResendEmail = () => {
        // Simulate email resend
        alert("Confirmation email has been resent to " + booking.guestEmail);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25 }}
                        className="relative w-full max-w-lg bg-background rounded-2xl shadow-xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-primary/10 p-6 text-center">
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-primary-foreground" />
                            </div>
                            <h2 className="font-display text-2xl font-semibold text-foreground">
                                Confirmation Email Sent!
                            </h2>
                            <p className="text-muted-foreground mt-2">
                                We've sent the booking details to
                            </p>
                            <p className="font-medium text-primary">{booking.guestEmail}</p>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* Email Preview */}
                        <div className="p-6">
                            <div className="border border-border rounded-xl p-4 bg-secondary/30">
                                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span className="font-medium">Booking Confirmed</span>
                                    <span className="ml-auto text-sm text-muted-foreground">
                                        Ref: {booking.referenceNumber}
                                    </span>
                                </div>

                                <h3 className="font-display font-semibold text-lg mb-3">
                                    {booking.villaName}
                                </h3>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-primary" />
                                        <span>
                                            {format(new Date(booking.checkIn), "MMM d")} -{" "}
                                            {format(new Date(booking.checkOut), "MMM d, yyyy")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-primary" />
                                        <span>{booking.guests} guests</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-primary" />
                                        <span>Ubud, Bali, Indonesia</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                                    <span className="text-muted-foreground">Total Paid</span>
                                    <span className="font-semibold text-lg text-primary">
                                        {formatCurrency(booking.total)}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleResendEmail}
                                    className="flex-1 btn-outline py-3 flex items-center justify-center gap-2"
                                >
                                    <Mail size={18} />
                                    Resend Email
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 btn-primary py-3"
                                >
                                    Done
                                </button>
                            </div>

                            <p className="text-xs text-muted-foreground text-center mt-4">
                                Please check your spam folder if you don't see the email in your inbox.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EmailConfirmationModal;
