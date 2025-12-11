import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote, Loader2 } from "lucide-react";
import { useTestimonialStore } from '@/store/testimonialStore';
import { useVillaStore } from '@/store/villaStore';
import { format } from 'date-fns';

const TestimonialsSection = () => {
  const sectionRef = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Stores
  const { testimonials: dbTestimonials, fetchTestimonials, isLoading } = useTestimonialStore();
  const { villas } = useVillaStore(); // Likely already fetched by parent/sibling, but good to have

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const testimonials = dbTestimonials.map(t => ({
    id: t.id,
    name: t.guest_name,
    country: t.guest_country || 'International',
    avatar: t.guest_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.guest_name)}`,
    rating: t.rating,
    review: t.review || '',
    date: t.review_date ? format(new Date(t.review_date), 'MMMM yyyy') : '',
    villaName: villas.find(v => v.id === t.villa_id)?.name || t.villa_name || 'StayinUBUD Villa'
  }));

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScroll);
      checkScroll();
      return () => scrollElement.removeEventListener("scroll", checkScroll);
    }
  }, [testimonials]); // Re-run when data changes

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="testimonials" className="section-padding bg-background overflow-hidden" ref={sectionRef}>
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary uppercase tracking-widest text-sm font-medium mb-4 block">
            Guest Stories
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-semibold text-foreground mb-6">
            What Our Guests Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Read authentic reviews from guests who have experienced the magic
            of staying at our Ubud villas.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-background shadow-lg rounded-full transition-all ${canScrollLeft
                ? "opacity-100 hover:bg-secondary"
                : "opacity-0 pointer-events-none"
              }`}
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} className="text-foreground" />
          </button>

          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-background shadow-lg rounded-full transition-all ${canScrollRight
                ? "opacity-100 hover:bg-secondary"
                : "opacity-0 pointer-events-none"
              }`}
            aria-label="Scroll right"
          >
            <ChevronRight size={24} className="text-foreground" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto hide-scrollbar px-4 py-4 -mx-4 items-stretch"
          >
            {isLoading ? (
              <div className="w-full flex justify-center py-20">
                <Loader2 size={32} className="animate-spin text-muted-foreground" />
              </div>
            ) : testimonials.length > 0 ? (
              testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex-shrink-0 w-[340px] sm:w-[400px]"
                >
                  <div className="glass-card rounded-2xl p-8 h-full relative flex flex-col">
                    {/* Quote Icon */}
                    <Quote
                      size={40}
                      className="absolute top-6 right-6 text-primary/20"
                    />

                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 fill-gray-300"}`}
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    <p className="text-foreground/80 mb-6 line-clamp-4 flex-grow italic">
                      "{testimonial.review}"
                    </p>

                    {/* Villa Name */}
                    <p className="text-primary text-sm font-medium mb-6">
                      Stayed at {testimonial.villaName}
                    </p>

                    {/* Guest Info */}
                    <div className="flex items-center gap-4 pt-4 border-t border-border mt-auto">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.country} {testimonial.date && `• ${testimonial.date}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="w-full text-center py-12 text-muted-foreground">
                No testimonials yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
