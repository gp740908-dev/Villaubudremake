import villa1 from "@/assets/villa-1.jpg";
import villa2 from "@/assets/villa-2.jpg";
import villa3 from "@/assets/villa-3.jpg";
import villa4 from "@/assets/villa-4.jpg";
import villa1Interior from "@/assets/villa-1-interior.jpg";
import villa1Bathroom from "@/assets/villa-1-bathroom.jpg";
import villa1Pool from "@/assets/villa-1-pool.jpg";
import villa1Dining from "@/assets/villa-1-dining.jpg";

export interface Villa {
  id: string;
  name: string;
  tagline: string;
  description: string;
  shortDescription: string;
  pricePerNight: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  amenities: string[];
  amenitiesDetailed: AmenityCategory[];
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  location: string;
  coordinates: { lat: number; lng: number };
  houseRules: HouseRule[];
  host: Host;
  bookedDates: string[];
  cleaningFee: number;
  serviceFee: number;
  minimumStay: number;
}

export interface AmenityCategory {
  category: string;
  items: { name: string; icon: string }[];
}

export interface HouseRule {
  title: string;
  description: string;
}

export interface Host {
  name: string;
  photo: string;
  verified: boolean;
  responseRate: number;
  responseTime: string;
  joinedDate: string;
}

export interface Testimonial {
  id: string;
  name: string;
  country: string;
  avatar: string;
  rating: number;
  review: string;
  date: string;
  villaId: string;
  villaName: string;
  ratings: {
    cleanliness: number;
    communication: number;
    checkIn: number;
    accuracy: number;
    location: number;
    value: number;
  };
  hostResponse?: string;
}

// Generate booked dates for demo
const generateBookedDates = (): string[] => {
  const dates: string[] = [];
  const today = new Date();
  
  // Add some random booked dates
  for (let i = 5; i < 10; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  for (let i = 20; i < 25; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const defaultHost: Host = {
  name: "Made Wijaya",
  photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  verified: true,
  responseRate: 98,
  responseTime: "within an hour",
  joinedDate: "2019",
};

const defaultAmenities: AmenityCategory[] = [
  {
    category: "General",
    items: [
      { name: "WiFi", icon: "Wifi" },
      { name: "Air Conditioning", icon: "Wind" },
      { name: "Ceiling Fans", icon: "Fan" },
      { name: "Safe Box", icon: "Lock" },
      { name: "Daily Housekeeping", icon: "Sparkles" },
    ],
  },
  {
    category: "Kitchen",
    items: [
      { name: "Full Kitchen", icon: "ChefHat" },
      { name: "Refrigerator", icon: "Refrigerator" },
      { name: "Coffee Machine", icon: "Coffee" },
      { name: "Dishwasher", icon: "Droplets" },
      { name: "Cooking Basics", icon: "Utensils" },
    ],
  },
  {
    category: "Bedroom",
    items: [
      { name: "King Size Bed", icon: "Bed" },
      { name: "Premium Linens", icon: "BedDouble" },
      { name: "Blackout Curtains", icon: "Sun" },
      { name: "Wardrobe", icon: "ShirtIcon" },
    ],
  },
  {
    category: "Bathroom",
    items: [
      { name: "Outdoor Shower", icon: "Droplet" },
      { name: "Bathtub", icon: "Bath" },
      { name: "Premium Toiletries", icon: "Sparkle" },
      { name: "Hair Dryer", icon: "Wind" },
    ],
  },
  {
    category: "Outdoor",
    items: [
      { name: "Private Pool", icon: "Waves" },
      { name: "Garden", icon: "Trees" },
      { name: "BBQ Grill", icon: "Flame" },
      { name: "Sun Loungers", icon: "Armchair" },
      { name: "Outdoor Dining", icon: "UtensilsCrossed" },
    ],
  },
];

const defaultHouseRules: HouseRule[] = [
  { title: "Check-in", description: "From 3:00 PM" },
  { title: "Check-out", description: "Before 11:00 AM" },
  { title: "Smoking", description: "No smoking inside the villa" },
  { title: "Parties", description: "No parties or events allowed" },
  { title: "Pets", description: "Pets are not allowed" },
  { title: "Quiet Hours", description: "10:00 PM - 8:00 AM" },
];

export const villas: Villa[] = [
  {
    id: "1",
    name: "Sawah Terrace Villa",
    tagline: "Where tradition meets luxury",
    description: `Experience the magic of Ubud from our stunning Sawah Terrace Villa, featuring breathtaking views of the iconic rice terraces. This luxurious 3-bedroom retreat combines traditional Balinese architecture with modern amenities.

Wake up to the symphony of birds and the gentle rustle of palm trees. Your private infinity pool seems to merge with the emerald rice paddies below, creating a seamless connection with nature.

The villa features an open-plan living area with soaring traditional Alang-Alang roof, handcrafted furniture from local artisans, and a fully equipped kitchen where our private chef can prepare authentic Balinese cuisine.

Each bedroom offers complete privacy with its own ensuite bathroom featuring outdoor showers and garden views. The master suite includes a luxurious soaking tub perfect for romantic evenings.`,
    shortDescription: "Stunning rice terrace views with traditional Balinese charm",
    pricePerNight: 4500000,
    capacity: 6,
    bedrooms: 3,
    bathrooms: 3,
    images: [villa1, villa1Interior, villa1Bathroom, villa1Pool, villa1Dining],
    amenities: ["Private Pool", "Rice Terrace View", "Kitchen", "WiFi", "AC", "Daily Breakfast"],
    amenitiesDetailed: defaultAmenities,
    isAvailable: true,
    rating: 4.9,
    reviewCount: 127,
    location: "Tegallalang, Ubud",
    coordinates: { lat: -8.4333, lng: 115.2833 },
    houseRules: defaultHouseRules,
    host: defaultHost,
    bookedDates: generateBookedDates(),
    cleaningFee: 500000,
    serviceFee: 350000,
    minimumStay: 2,
  },
  {
    id: "2",
    name: "Jungle Hideaway Villa",
    tagline: "Your private sanctuary in the wild",
    description: `Nestled deep within the tropical jungle, our Jungle Hideaway Villa offers complete privacy and tranquility. Wake up to the sounds of nature and enjoy your private infinity pool overlooking the lush canopy.

This is where modern minimalism meets raw natural beauty. Floor-to-ceiling glass walls blur the line between indoor and outdoor living, while the surrounding jungle provides a natural privacy screen.

The villa's two bedrooms are designed as separate pavilions connected by covered walkways, ensuring complete privacy for each guest. The open-air living and dining areas float above the jungle canopy.

Practice yoga on your private deck at sunrise, take a dip in the infinity pool at sunset, or simply relax in the day bed listening to the calls of tropical birds.`,
    shortDescription: "Private jungle sanctuary with infinity pool",
    pricePerNight: 3800000,
    capacity: 4,
    bedrooms: 2,
    bathrooms: 2,
    images: [villa2, villa1Pool, villa1Interior, villa1Dining],
    amenities: ["Infinity Pool", "Jungle View", "Open Living", "WiFi", "AC", "Yoga Deck"],
    amenitiesDetailed: defaultAmenities,
    isAvailable: true,
    rating: 4.8,
    reviewCount: 89,
    location: "Petulu, Ubud",
    coordinates: { lat: -8.4667, lng: 115.2667 },
    houseRules: defaultHouseRules,
    host: defaultHost,
    bookedDates: generateBookedDates(),
    cleaningFee: 400000,
    serviceFee: 300000,
    minimumStay: 2,
  },
  {
    id: "3",
    name: "Canopy Treehouse Villa",
    tagline: "Romance among the treetops",
    description: `Our most unique property, the Canopy Treehouse Villa is perched among ancient trees offering an unforgettable experience. Perfect for romantic getaways with outdoor bathtub and panoramic forest views.

Built using sustainable bamboo architecture, this one-of-a-kind treehouse seamlessly integrates with its natural surroundings. Wake up suspended among the clouds, with nothing but birdsong and rustling leaves for company.

The outdoor bathtub is positioned to capture the most spectacular sunset views. Watch as the mist rolls in over the forest while you soak under the stars.

Every detail has been crafted for romance – from the four-poster bed draped in white linen to the private dining pavilion where candlelit dinners can be arranged.`,
    shortDescription: "Romantic treehouse with outdoor bathtub",
    pricePerNight: 5200000,
    capacity: 2,
    bedrooms: 1,
    bathrooms: 1,
    images: [villa3, villa1Bathroom, villa1Dining, villa1Interior],
    amenities: ["Outdoor Bathtub", "Forest View", "Bamboo Design", "WiFi", "Romantic Setup", "Breakfast"],
    amenitiesDetailed: defaultAmenities,
    isAvailable: false,
    rating: 5.0,
    reviewCount: 64,
    location: "Payangan, Ubud",
    coordinates: { lat: -8.3833, lng: 115.2500 },
    houseRules: defaultHouseRules,
    host: defaultHost,
    bookedDates: generateBookedDates(),
    cleaningFee: 400000,
    serviceFee: 400000,
    minimumStay: 2,
  },
  {
    id: "4",
    name: "Heritage Garden Villa",
    tagline: "Authentic luxury in paradise",
    description: `A meticulously restored traditional Joglo villa surrounded by tropical gardens and a serene koi pond. Experience authentic Balinese living with all the comforts of a luxury resort.

The heart of this estate is an 80-year-old Javanese Joglo, painstakingly dismantled, transported, and reconstructed here in Ubud. The intricate wooden carvings tell stories of Balinese mythology and craftsmanship.

Four separate bedroom pavilions surround the central living area, each with its own character and garden views. The estate includes a traditional bale for yoga or massage, and extensive gardens with tropical fruit trees.

Our in-house chef specializes in both Balinese and international cuisine, and cooking classes can be arranged. The villa is ideal for families or groups seeking an immersive cultural experience.`,
    shortDescription: "Traditional Joglo with tropical gardens",
    pricePerNight: 6500000,
    capacity: 8,
    bedrooms: 4,
    bathrooms: 4,
    images: [villa4, villa1Pool, villa1Interior, villa1Bathroom, villa1Dining],
    amenities: ["Koi Pond", "Traditional Joglo", "Chef Service", "WiFi", "AC", "Private Garden"],
    amenitiesDetailed: defaultAmenities,
    isAvailable: true,
    rating: 4.9,
    reviewCount: 156,
    location: "Central Ubud",
    coordinates: { lat: -8.5069, lng: 115.2625 },
    houseRules: defaultHouseRules,
    host: defaultHost,
    bookedDates: generateBookedDates(),
    cleaningFee: 600000,
    serviceFee: 500000,
    minimumStay: 3,
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    country: "Australia",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    rating: 5,
    review: "Absolutely magical experience! The Sawah Terrace Villa exceeded all our expectations. Waking up to the rice terrace views every morning was like a dream. The staff was incredibly attentive and made our honeymoon unforgettable. The private pool was perfect and the breakfast served daily was delicious.",
    date: "November 2024",
    villaId: "1",
    villaName: "Sawah Terrace Villa",
    ratings: {
      cleanliness: 5,
      communication: 5,
      checkIn: 5,
      accuracy: 5,
      location: 5,
      value: 5,
    },
    hostResponse: "Thank you so much Sarah! It was our pleasure hosting your honeymoon. We hope to welcome you back soon!",
  },
  {
    id: "2",
    name: "James Chen",
    country: "Singapore",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 5,
    review: "The Jungle Hideaway Villa is a true sanctuary. Perfect for disconnecting from the busy city life. The infinity pool overlooking the jungle is absolutely stunning. Will definitely be coming back! The yoga deck was an amazing bonus.",
    date: "October 2024",
    villaId: "2",
    villaName: "Jungle Hideaway Villa",
    ratings: {
      cleanliness: 5,
      communication: 5,
      checkIn: 5,
      accuracy: 4,
      location: 5,
      value: 5,
    },
  },
  {
    id: "3",
    name: "Emma Thompson",
    country: "United Kingdom",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 5,
    review: "The Canopy Treehouse was the most romantic experience we've ever had. Soaking in the outdoor bathtub while surrounded by misty forest - simply incredible. A must for couples! The bamboo architecture is stunning and eco-friendly.",
    date: "September 2024",
    villaId: "3",
    villaName: "Canopy Treehouse Villa",
    ratings: {
      cleanliness: 5,
      communication: 5,
      checkIn: 5,
      accuracy: 5,
      location: 5,
      value: 5,
    },
  },
  {
    id: "4",
    name: "Michael Bauer",
    country: "Germany",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    rating: 5,
    review: "Heritage Garden Villa is where authentic Bali meets luxury. The traditional architecture, the beautiful gardens, and the exceptional service made our family vacation perfect. The chef prepared amazing meals every day.",
    date: "August 2024",
    villaId: "4",
    villaName: "Heritage Garden Villa",
    ratings: {
      cleanliness: 5,
      communication: 5,
      checkIn: 4,
      accuracy: 5,
      location: 5,
      value: 5,
    },
    hostResponse: "Dear Michael, thank you for choosing Heritage Garden for your family vacation. It was wonderful to host you all!",
  },
  {
    id: "5",
    name: "Yuki Tanaka",
    country: "Japan",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    rating: 5,
    review: "Every detail was thoughtfully curated. From the welcome flowers to the daily breakfast, everything was perfect. StayinUBUD truly understands hospitality. The rice terrace view from the pool is unforgettable.",
    date: "July 2024",
    villaId: "1",
    villaName: "Sawah Terrace Villa",
    ratings: {
      cleanliness: 5,
      communication: 5,
      checkIn: 5,
      accuracy: 5,
      location: 5,
      value: 4,
    },
  },
  {
    id: "6",
    name: "Robert Wilson",
    country: "USA",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    rating: 4,
    review: "Great villa with stunning views. The location is perfect for exploring Ubud. Only minor suggestion would be better soundproofing in the bedrooms. Overall fantastic experience.",
    date: "June 2024",
    villaId: "2",
    villaName: "Jungle Hideaway Villa",
    ratings: {
      cleanliness: 5,
      communication: 4,
      checkIn: 5,
      accuracy: 4,
      location: 5,
      value: 4,
    },
  },
];

export const stats = [
  { value: 500, suffix: "+", label: "Happy Guests" },
  { value: 4, suffix: "", label: "Premium Villas" },
  { value: 100, suffix: "%", label: "Satisfaction" },
  { value: 5, suffix: "", label: "Years Experience" },
];

export const experiences = [
  {
    title: "Rice Terrace Walks",
    description: "Explore the iconic Tegallalang rice terraces, just minutes from our villas.",
  },
  {
    title: "Temple Visits",
    description: "Discover ancient temples and immerse yourself in Balinese spirituality.",
  },
  {
    title: "Cultural Experiences",
    description: "Traditional dance performances, cooking classes, and artisan workshops.",
  },
];

export const allAmenities = [
  "Private Pool",
  "Kitchen",
  "WiFi",
  "AC",
  "Garden",
  "Parking",
  "Rice Terrace View",
  "Jungle View",
  "Forest View",
  "Daily Breakfast",
  "Chef Service",
  "Yoga Deck",
  "Outdoor Bathtub",
  "Romantic Setup",
];

export const locations = [
  "All Locations",
  "Tegallalang, Ubud",
  "Petulu, Ubud",
  "Payangan, Ubud",
  "Central Ubud",
];
