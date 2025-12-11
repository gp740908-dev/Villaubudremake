import { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, MapPin, Star, Users, Bed, Bath, Check, BadgeCheck, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import BookingCard from "@/components/BookingCard";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import ReviewsSection from "@/components/ReviewsSection";
import VillaCard from "@/components/VillaCard";
import { useVillaStore } from "@/store/villaStore";
import { useTestimonialStore } from "@/store/testimonialStore";
import { useBookingStore } from "@/store/bookingStore";
import { mapDbVillaToFrontend } from "@/utils/dbMapping";

const VillaDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  // Stores
  const { villas: dbVillas, fetchVillas, isLoading: isLoadingVillas } = useVillaStore();
  const { testimonials: dbTestimonials, fetchTestimonials } = useTestimonialStore();
  const { globalBookedDates, fetchAllBookedDates } = useBookingStore();

  useEffect(() => {
    fetchVillas();
    fetchTestimonials();
    fetchAllBookedDates();
  }, [fetchVillas, fetchTestimonials, fetchAllBookedDates]);

  // Derived Data
  const villa = useMemo(() => {
    const foundVilla = dbVillas.find((v) => v.id === id);
    if (!foundVilla) return null;
    return mapDbVillaToFrontend(foundVilla, globalBookedDates[foundVilla.id] || []);
  }, [id, dbVillas, globalBookedDates]);

  const villaReviews = useMemo(
    () => dbTestimonials
      .filter((t) => t.villa_id === id)
      .map(t => ({
        id: t.id,
        name: t.guest_name,
        country: t.guest_country || 'International',
        avatar: t.guest_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.guest_name)}`,
        rating: t.rating,
        ratings: {
          cleanliness: 5,
          communication: 5,
          checkIn: 5,
          accuracy: 5,
          location: 5,
          value: 5
        },
        review: t.review || '',
        date: t.review_date || t.created_at,
        villaId: t.villa_id,
        villaName: villa?.name || ''
      })),
    [id, dbTestimonials, villa]
  );

  const similarVillas = useMemo(
    () => dbVillas
      .filter((v) => v.id !== id)
      .slice(0, 3)
      .map(v => mapDbVillaToFrontend(v, globalBookedDates[v.id] || [])),
    [id, dbVillas, globalBookedDates]
  );

  if (isLoadingVillas) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!villa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Villa not found</h2>
          <Link to="/villas" className="text-primary hover:underline">Browse all villas</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "amenities", label: "Amenities" },
    { id: "rules", label: "House Rules" },
    { id: "reviews", label: "Reviews" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight size={14} />
            <Link to="/villas" className="hover:text-primary">Villas</Link>
            <ChevronRight size={14} />
            <span className="text-foreground font-medium">{villa.name}</span>
          </nav>

          {/* Image Gallery */}
          <ImageGallery images={villa.images} alt={villa.name} />

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mt-8 pb-24 lg:pb-0">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MapPin size={16} />
                  <span>{villa.location}</span>
                </div>
                <h1 className="font-display text-3xl lg:text-4xl font-semibold text-foreground mb-2">
                  {villa.name}
                </h1>
                <p className="text-lg text-muted-foreground italic mb-4">{villa.tagline}</p>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-1">
                    <Star size={18} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{villa.rating}</span>
                    <span className="text-muted-foreground">({villa.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1"><Users size={16} /> {villa.capacity} guests</span>
                    <span className="flex items-center gap-1"><Bed size={16} /> {villa.bedrooms} bedrooms</span>
                    <span className="flex items-center gap-1"><Bath size={16} /> {villa.bathrooms} bathrooms</span>
                  </div>
                </div>
              </motion.div>

              {/* Host Info */}
              <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                <img
                  src={villa.host.photo}
                  alt={villa.host.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{villa.host.name}</span>
                    {villa.host.verified && (
                      <BadgeCheck size={18} className="text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hosting since {villa.host.joinedDate} • {villa.host.responseRate}% response rate
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-border">
                <div className="flex gap-6 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px]">
                {activeTab === "overview" && (
                  <div className="prose prose-slate max-w-none">
                    {villa.description.split("\n\n").map((para, i) => (
                      <p key={i} className="text-foreground/80 mb-4">{para}</p>
                    ))}
                  </div>
                )}

                {activeTab === "amenities" && (
                  <div className="space-y-6">
                    {villa.amenitiesDetailed.map((category) => (
                      <div key={category.category}>
                        <h3 className="font-semibold text-foreground mb-3">{category.category}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {category.items.map((item) => (
                            <div key={item.name} className="flex items-center gap-2 text-muted-foreground">
                              <Check size={16} className="text-primary" />
                              <span>{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "rules" && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {villa.houseRules.map((rule) => (
                      <div key={rule.title} className="p-4 bg-secondary/30 rounded-xl">
                        <h4 className="font-semibold text-foreground">{rule.title}</h4>
                        <p className="text-muted-foreground">{rule.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <ReviewsSection
                    reviews={villaReviews}
                    averageRating={villa.rating}
                    totalReviews={villa.reviewCount}
                  />
                )}
              </div>

              {/* Calendar */}
              <AvailabilityCalendar bookedDates={villa.bookedDates} />
            </div>

            {/* Right Column - Booking Card (hidden on mobile, shown as fixed bar) */}
            <div className="hidden lg:block lg:col-span-1">
              <BookingCard villa={villa} />
            </div>
          </div>

          {/* Mobile Booking Card - renders fixed bottom bar */}
          <div className="lg:hidden">
            <BookingCard villa={villa} />
          </div>

          {/* Similar Villas */}
          <section className="mt-16 pt-16 border-t border-border">
            <h2 className="font-display text-2xl font-semibold mb-8">Similar Villas</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarVillas.map((v, i) => (
                <VillaCard key={v.id} villa={v} index={i} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VillaDetailPage;
