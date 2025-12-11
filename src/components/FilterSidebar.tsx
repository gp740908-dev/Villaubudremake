import { useState } from "react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  Calendar, 
  Users, 
  SlidersHorizontal, 
  X, 
  RotateCcw,
  Check
} from "lucide-react";
import { useFilterStore } from "@/store/bookingStore";
import { allAmenities, locations } from "@/data/villas";
import { formatCurrencyShort } from "@/utils/booking";
import { Slider } from "@/components/ui/slider";

interface FilterSidebarProps {
  availableCount: number;
  isMobile?: boolean;
  onClose?: () => void;
}

const FilterSidebar = ({ availableCount, isMobile, onClose }: FilterSidebarProps) => {
  const {
    checkIn,
    checkOut,
    guests,
    priceRange,
    amenities,
    location,
    setCheckIn,
    setCheckOut,
    setGuests,
    setPriceRange,
    toggleAmenity,
    setLocation,
    resetFilters,
  } = useFilterStore();

  const [localPriceRange, setLocalPriceRange] = useState(priceRange);

  const handlePriceChange = (value: number[]) => {
    setLocalPriceRange([value[0], value[1]]);
  };

  const applyPriceRange = () => {
    setPriceRange(localPriceRange);
  };

  const handleReset = () => {
    resetFilters();
    setLocalPriceRange([0, 10000000]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-background rounded-2xl border border-border p-6 ${
        isMobile ? "h-full overflow-y-auto" : "sticky top-24"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={20} className="text-primary" />
          <h3 className="font-display text-lg font-semibold">Filters</h3>
        </div>
        {isMobile && onClose && (
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Available Count */}
      <div className="mb-6 p-3 bg-primary/10 rounded-lg">
        <p className="text-sm font-medium text-primary">
          {availableCount} villa{availableCount !== 1 ? "s" : ""} available
        </p>
      </div>

      <div className="space-y-6">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            <Calendar size={16} className="inline mr-2" />
            Dates
          </label>
          <div className="space-y-2">
            <DatePicker
              selected={checkIn}
              onChange={(date) => setCheckIn(date)}
              selectsStart
              startDate={checkIn}
              endDate={checkOut}
              minDate={new Date()}
              placeholderText="Check-in"
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              dateFormat="MMM d, yyyy"
            />
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              selectsEnd
              startDate={checkIn}
              endDate={checkOut}
              minDate={checkIn || new Date()}
              placeholderText="Check-out"
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              dateFormat="MMM d, yyyy"
            />
          </div>
        </div>

        {/* Guests */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            <Users size={16} className="inline mr-2" />
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Price Range (per night)
          </label>
          <div className="px-2">
            <Slider
              min={0}
              max={10000000}
              step={100000}
              value={localPriceRange}
              onValueChange={handlePriceChange}
              onValueCommit={applyPriceRange}
              className="mb-3"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatCurrencyShort(localPriceRange[0])}</span>
            <span>{formatCurrencyShort(localPriceRange[1])}</span>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Location
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Amenities
          </label>
          <div className="grid grid-cols-2 gap-2">
            {allAmenities.slice(0, 8).map((amenity) => (
              <button
                key={amenity}
                onClick={() => toggleAmenity(amenity)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  amenities.includes(amenity)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-foreground hover:bg-secondary"
                }`}
              >
                {amenities.includes(amenity) && <Check size={12} />}
                <span className="truncate">{amenity}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 py-3 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
        >
          <RotateCcw size={16} />
          Reset Filters
        </button>

        {/* Apply (Mobile) */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="w-full btn-primary py-3"
          >
            Show {availableCount} Villa{availableCount !== 1 ? "s" : ""}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default FilterSidebar;
