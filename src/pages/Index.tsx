import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import VillaShowcase from "@/components/VillaShowcase";
import ExperienceSection from "@/components/ExperienceSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import LocationSection from "@/components/LocationSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    // Update page title and meta
    document.title = "StayinUBUD | Luxury Villa Rentals in Ubud, Bali";
  }, []);

  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <VillaShowcase />
      <ExperienceSection />
      <TestimonialsSection />
      <LocationSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;
