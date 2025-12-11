import { Villa } from "@/data/villas";
import { differenceInDays, isWithinInterval, parseISO } from "date-fns";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 1000000) {
    return `IDR ${(amount / 1000000).toFixed(1)}M`;
  }
  return formatCurrency(amount);
};

export const calculateNights = (checkIn: Date | null, checkOut: Date | null): number => {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, differenceInDays(checkOut, checkIn));
};

export const calculateTotal = (
  nightlyRate: number,
  nights: number,
  cleaningFee: number,
  serviceFee: number
): number => {
  return nightlyRate * nights + cleaningFee + serviceFee;
};

export const isDateBooked = (date: Date, bookedDates: string[]): boolean => {
  const dateStr = date.toISOString().split('T')[0];
  return bookedDates.includes(dateStr);
};

export const isDateRangeAvailable = (
  checkIn: Date,
  checkOut: Date,
  bookedDates: string[]
): boolean => {
  const current = new Date(checkIn);
  while (current < checkOut) {
    if (isDateBooked(current, bookedDates)) {
      return false;
    }
    current.setDate(current.getDate() + 1);
  }
  return true;
};

export const getAvailabilityForVilla = (
  villa: Villa,
  checkIn: Date | null,
  checkOut: Date | null
): boolean => {
  if (!villa.isAvailable) return false;
  if (!checkIn || !checkOut) return villa.isAvailable;
  return isDateRangeAvailable(checkIn, checkOut, villa.bookedDates);
};

export const filterVillas = (
  villas: Villa[],
  filters: {
    checkIn: Date | null;
    checkOut: Date | null;
    guests: number;
    priceRange: [number, number];
    amenities: string[];
    location: string;
  }
): Villa[] => {
  return villas.filter((villa) => {
    // Check capacity
    if (villa.capacity < filters.guests) return false;

    // Check price range
    if (
      villa.pricePerNight < filters.priceRange[0] ||
      villa.pricePerNight > filters.priceRange[1]
    ) {
      return false;
    }

    // Check amenities
    if (filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every((amenity) =>
        villa.amenities.some((a) => a.toLowerCase().includes(amenity.toLowerCase()))
      );
      if (!hasAllAmenities) return false;
    }

    // Check location
    if (filters.location !== "All Locations" && villa.location !== filters.location) {
      return false;
    }

    // Check availability for dates
    if (filters.checkIn && filters.checkOut) {
      if (!getAvailabilityForVilla(villa, filters.checkIn, filters.checkOut)) {
        return false;
      }
    }

    return true;
  });
};

export const sortVillas = (
  villas: Villa[],
  sortBy: 'price-asc' | 'price-desc' | 'capacity' | 'rating'
): Villa[] => {
  const sorted = [...villas];
  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.pricePerNight - b.pricePerNight);
    case 'price-desc':
      return sorted.sort((a, b) => b.pricePerNight - a.pricePerNight);
    case 'capacity':
      return sorted.sort((a, b) => b.capacity - a.capacity);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    default:
      return sorted;
  }
};

export const getAverageRating = (
  ratings: {
    cleanliness: number;
    communication: number;
    checkIn: number;
    accuracy: number;
    location: number;
    value: number;
  }
): number => {
  const values = Object.values(ratings);
  return values.reduce((a, b) => a + b, 0) / values.length;
};
