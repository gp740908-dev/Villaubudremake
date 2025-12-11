import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import heroVilla from "@/assets/hero-villa.jpg";

const CTASection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32 overflow-hidden" ref={sectionRef}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroVilla}
          alt="Luxury Villa"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/50" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/90 rounded-full mb-8"
          >
            <Sparkles size={16} className="text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">
              Special Rates Available
            </span>
          </motion.div>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-background mb-6 leading-tight">
            Ready to Experience
            <br />
            <span className="italic">Paradise</span>?
          </h2>

          <p className="text-xl text-background/80 mb-10 max-w-2xl mx-auto">
            Book your dream villa today and let us create an unforgettable
            Balinese experience for you and your loved ones.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="#villas"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
            >
              Find Your Perfect Villa
              <ArrowRight size={20} />
            </motion.a>

            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-outline border-background/50 text-background hover:bg-background hover:text-foreground inline-flex items-center justify-center gap-2 text-lg px-8 py-4"
            >
              Contact Us
            </motion.a>
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 pt-8 border-t border-background/20"
          >
            <p className="text-background/60 text-sm mb-4">Trusted by travelers worldwide</p>
            <div className="flex flex-wrap justify-center gap-8 text-background/40">
              <span className="font-display text-xl">TripAdvisor</span>
              <span className="font-display text-xl">Booking.com</span>
              <span className="font-display text-xl">Airbnb</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
