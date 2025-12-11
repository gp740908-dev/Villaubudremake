import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight, SlidersHorizontal, ArrowUpDown, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VillaCard from "@/components/VillaCard";
import FilterSidebar from "@/components/FilterSidebar";
import { useFilterStore, useBookingStore } from "@/store/bookingStore";
import { useVillaStore } from "@/store/villaStore";
import { filterVillas, sortVillas } from "@/utils/booking";
import { mapDbVillaToFrontend } from "@/utils/dbMapping";

const VillasPage = () => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const filters = useFilterStore();
  const { villas: dbVillas, fetchVillas, isLoading: isLoadingVillas } = useVillaStore();
  const { globalBookedDates, fetchAllBookedDates } = useBookingStore();

  useEffect(() => {
    fetchVillas();
    fetchAllBookedDates();
  }, [fetchVillas, fetchAllBookedDates]);

  // Convert DB villas to frontend format with booked dates merged
  const allVillas = useMemo(() => {
    return dbVillas.map(villa =>
      mapDbVillaToFrontend(villa, globalBookedDates[villa.id] || [])
    );
  }, [dbVillas, globalBookedDates]);

  const filteredVillas = useMemo(() => {
    const filtered = filterVillas(allVillas, {
      checkIn: filters.checkIn,
      checkOut: filters.checkOut,
      guests: filters.guests,
      priceRange: filters.priceRange,
      amenities: filters.amenities,
      location: filters.location,
    });
    return sortVillas(filtered, filters.sortBy);
  }, [filters, allVillas]);

  const sortOptions = [
    { value: "rating", label: "Top Rated" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "capacity", label: "Capacity" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-secondary/50 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-foreground font-medium">Villas</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl lg:text-5xl font-semibold text-foreground mb-4">
              Our Villa Collection
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Discover handpicked luxury villas in the heart of Ubud, each offering
              a unique blend of Balinese tradition and modern comfort.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <FilterSidebar availableCount={filteredVillas.length} />
            </aside>

            {/* Villa Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">{filteredVillas.length}</span> villas found
                </p>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <ArrowUpDown size={16} className="text-muted-foreground" />
                    <select
                      value={filters.sortBy}
                      onChange={(e) => filters.setSortBy(e.target.value as typeof filters.sortBy)}
                      className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm font-medium"
                  >
                    <SlidersHorizontal size={16} />
                    Filters
                  </button>
                </div>
              </div>

              {/* Grid or Loader */}
              {isLoadingVillas ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#6b7c67]">
                  <Loader2 size={40} className="animate-spin mb-4" />
                  <p>Loading villas...</p>
                </div>
              ) : filteredVillas.length > 0 ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredVillas.map((villa, index) => (
                    <VillaCard
                      key={villa.id}
                      villa={villa}
                      index={index}
                      checkIn={filters.checkIn}
                      checkOut={filters.checkOut}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">
                    {dbVillas.length === 0 ? "No villas available in database." : "No villas match your criteria."}
                  </p>
                  <button onClick={filters.resetFilters} className="btn-primary">
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/50 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background"
              onClick={(e) => e.stopPropagation()}
            >
              <FilterSidebar
                availableCount={filteredVillas.length}
                isMobile
                onClose={() => setShowMobileFilters(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default VillasPage;
