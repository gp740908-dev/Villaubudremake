import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Users, Bed, Bath, ArrowRight, MapPin } from "lucide-react";
import { Villa } from "@/data/villas";
import { formatCurrency, getAvailabilityForVilla } from "@/utils/booking";
import { useState } from "react";

interface VillaCardProps {
  villa: Villa;
  index: number;
  checkIn?: Date | null;
  checkOut?: Date | null;
}

const VillaCard = ({ villa, index, checkIn, checkOut }: VillaCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isAvailable = getAvailabilityForVilla(villa, checkIn || null, checkOut || null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-500"
    >
      {/* Image Container */}
      <div
        className="relative aspect-[4/3] overflow-hidden"
        onMouseEnter={() => villa.images.length > 1 && setCurrentImageIndex(1)}
        onMouseLeave={() => setCurrentImageIndex(0)}
      >
        <img
          src={villa.images[currentImageIndex]}
          alt={villa.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Availability Badge */}
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
            isAvailable
              ? "bg-primary text-primary-foreground"
              : "bg-destructive text-destructive-foreground"
          }`}
        >
          {isAvailable ? "Available" : "Booked"}
        </div>

        {/* Rating */}
        <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full">
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium">{villa.rating}</span>
        </div>

        {/* Image dots */}
        {villa.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {villa.images.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentImageIndex ? "bg-background w-4" : "bg-background/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
          <MapPin size={14} />
          <span>{villa.location}</span>
        </div>

        {/* Name & Tagline */}
        <h3 className="font-display text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
          {villa.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-1">
          {villa.tagline}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{villa.capacity}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed size={14} />
            <span>{villa.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={14} />
            <span>{villa.bathrooms}</span>
          </div>
        </div>

        {/* Amenities Preview */}
        <div className="flex flex-wrap gap-2 mb-4">
          {villa.amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity}
              className="px-2 py-1 bg-secondary/50 rounded-full text-xs text-muted-foreground"
            >
              {amenity}
            </span>
          ))}
          {villa.amenities.length > 3 && (
            <span className="px-2 py-1 bg-secondary/50 rounded-full text-xs text-muted-foreground">
              +{villa.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(villa.pricePerNight)}
            </span>
            <span className="text-muted-foreground text-sm"> /night</span>
          </div>
          <Link
            to={`/villas/${villa.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            View
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default VillaCard;
