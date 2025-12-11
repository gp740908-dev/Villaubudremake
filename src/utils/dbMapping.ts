import { Villa as DbVilla } from '@/lib/database.types';
import { Villa as FrontendVilla, AmenityCategory, HouseRule, Host } from '@/data/villas';

// Default amenities structure since DB stores flat string array
const defaultAmenitiesDetailed: AmenityCategory[] = [
    {
        category: "General",
        items: [
            { name: "WiFi", icon: "Wifi" },
            { name: "Air Conditioning", icon: "Wind" },
            { name: "Safe Box", icon: "Lock" },
        ],
    },
    {
        category: "Outdoor",
        items: [
            { name: "Private Pool", icon: "Waves" },
            { name: "Garden", icon: "Trees" },
        ],
    },
];

const defaultHost: Host = {
    name: "StayinUBUD Team",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    verified: true,
    responseRate: 100,
    responseTime: "within an hour",
    joinedDate: "2024",
};

const defaultHouseRules: HouseRule[] = [
    { title: "Check-in", description: "From 3:00 PM" },
    { title: "Check-out", description: "Before 11:00 AM" },
    { title: "Smoking", description: "No smoking inside" },
    { title: "Parties", description: "No parties allowed" },
];

export const mapDbVillaToFrontend = (dbVilla: DbVilla, bookedDates: string[] = []): FrontendVilla => {
    return {
        id: dbVilla.id,
        name: dbVilla.name,
        tagline: dbVilla.tagline || '',
        description: dbVilla.description || '',
        shortDescription: dbVilla.short_description || '',
        pricePerNight: dbVilla.price_per_night,
        capacity: dbVilla.capacity,
        bedrooms: dbVilla.bedrooms,
        bathrooms: dbVilla.bathrooms,
        images: dbVilla.images || [],
        amenities: dbVilla.amenities || [],
        amenitiesDetailed: defaultAmenitiesDetailed, // In a real app we might infer these from the flat list
        isAvailable: dbVilla.is_available,
        rating: dbVilla.rating || 5.0,
        reviewCount: dbVilla.review_count || 0,
        location: dbVilla.location || 'Ubud, Bali',
        coordinates: dbVilla.coordinates || { lat: -8.5069, lng: 115.2625 },
        houseRules: defaultHouseRules, // Could be stored in JSON in DB
        host: defaultHost,
        bookedDates: bookedDates,
        cleaningFee: dbVilla.cleaning_fee || 0,
        serviceFee: dbVilla.service_fee || 0,
        minimumStay: dbVilla.minimum_stay || 1,
    };
};
