import { supabase } from './supabase';

// IMPORTANT: RLS should be disabled for seeding.

const villasToSeed = [
    {
        id: "1",
        name: "Serenity Pool Villa",
        tagline: "Your private oasis in the heart of Ubud",
        description: `Escape to Serenity Pool Villa, a stunning private villa located just minutes from the vibrant heart of Ubud. This luxurious property offers the perfect blend of modern comfort and traditional Balinese charm, making it an ideal retreat for couples, families, and small groups.\n\nThe villa features a spacious open-plan living area that seamlessly flows onto a lush tropical garden and a sparkling private swimming pool. The floor-to-ceiling glass doors allow for an abundance of natural light and offer uninterrupted views of the surrounding greenery. Relax on the comfortable sofa, enjoy a meal at the elegant dining table, or simply soak up the sun on the poolside loungers.\n\nEach bedroom is a private sanctuary, complete with a king-sized bed, high-quality linens, and an en-suite bathroom. The master bathroom boasts a luxurious bathtub and a separate rain shower, providing a spa-like experience. All rooms are fully air-conditioned and equipped with modern amenities to ensure a comfortable stay.\n\nOur dedicated staff is on hand to assist with any needs you may have, from arranging in-villa massages and private yoga sessions to organizing tours and cooking classes. A delicious daily breakfast is included, and a private chef can be arranged for other meals upon request.`,
        shortDescription: "Stunning rice terrace views with traditional Balinese charm",
        pricePerNight: 4500000,
        capacity: 6,
        bedrooms: 3,
        bathrooms: 3,
        images: [
            'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1613553474173-860427ac201d?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1612320493393-09724a1b05c5?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        ],
        amenities: ["Private Pool", "Rice Terrace View", "Kitchen", "WiFi", "AC", "Daily Breakfast"],
        isAvailable: true,
        rating: 4.9,
        reviewCount: 127,
        location: "Tegallalang, Ubud",
        coordinates: { lat: -8.4333, lng: 115.2833 },
        cleaningFee: 500000,
        serviceFee: 350000,
        minimumStay: 2,
    },
    {
        id: "2",
        name: "Jungle Hideaway Villa",
        tagline: "A secluded retreat surrounded by nature",
        description: `Discover the ultimate jungle escape at Jungle Hideaway Villa. Nestled in a secluded valley just outside Ubud, this unique villa offers breathtaking views of the lush tropical rainforest and the tranquil sounds of nature. It's the perfect choice for those seeking peace, privacy, and a deep connection with the natural world.\n\nThe villa's design emphasizes open-air living, with a spacious lounge and dining area that opens directly onto the jungle canopy. The infinity pool appears to float above the treetops, providing a truly magical spot for a morning swim or an evening cocktail. The architecture blends rustic wooden elements with modern comforts, creating a warm and inviting atmosphere.\n\nEach of the two bedrooms is a cozy haven, featuring a comfortable bed, an en-suite bathroom with natural stone finishes, and large windows that frame the stunning jungle vistas. Wake up to the sound of birdsong and enjoy your morning coffee on your private balcony.\n\nPractice yoga on your private deck at sunrise, take a dip in the infinity pool at sunset, or simply relax in the day bed listening to the calls of tropical birds.`, 
        shortDescription: "Private jungle sanctuary with infinity pool",
        pricePerNight: 3800000,
        capacity: 4,
        bedrooms: 2,
        bathrooms: 2,
        images: [
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1617806118233-5cf3b468def5?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1615875605825-5eb9bb5fea22?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        ],
        amenities: ["Infinity Pool", "Jungle View", "Open Living", "WiFi", "AC", "Yoga Deck"],
        isAvailable: true,
        rating: 4.8,
        reviewCount: 89,
        location: "Petulu, Ubud",
        coordinates: { lat: -8.4667, lng: 115.2667 },
        cleaningFee: 400000,
        serviceFee: 300000,
        minimumStay: 2,
    },
    {
        id: "3",
        name: "Canopy Treehouse Villa",
        tagline: "Romance among the treetops",
        description: `Live out your childhood dreams in our magical Canopy Treehouse Villa. This enchanting and romantic retreat is built around a majestic tree, offering a unique and unforgettable accommodation experience. It's perfect for couples and honeymooners looking for a one-of-a-kind getaway.\n\nThe Treehouse features a cozy and intimate interior with a comfortable queen-sized bed, a charming seating area, and a modern en-suite bathroom. The highlight is the spacious wrap-around balcony, where you can enjoy panoramic views of the surrounding rice paddies and jungle. It's the perfect spot for a romantic dinner under the stars or a lazy afternoon with a good book.\n\nDespite its rustic charm, the Treehouse is equipped with all the modern conveniences you need, including air conditioning, Wi-Fi, and a minibar. Guests also have access to a shared swimming pool and a restaurant located on the property.\n\nLocated in a quiet and peaceful area, the Treehouse is still just a short drive from the main attractions of Ubud. It offers the perfect combination of seclusion and convenience.`, 
        shortDescription: "Unique treehouse with panoramic views",
        pricePerNight: 2800000,
        capacity: 2,
        bedrooms: 1,
        bathrooms: 1,
        images: [
            'https://images.unsplash.com/photo-1542314831-068cd1dbb5ed?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        ],
        amenities: ["Panoramic View", "Balcony", "AC", "WiFi", "Shared Pool", "Romantic"],
        isAvailable: true,
        rating: 4.9,
        reviewCount: 215,
        location: "Pejeng, Ubud",
        coordinates: { lat: -8.513, lng: 115.304 },
        cleaningFee: 300000,
        serviceFee: 250000,
        minimumStay: 1,
    },
    {
        id: "4",
        name: "Royal Joglo Estate",
        tagline: "Experience Javanese elegance in Ubud",
        description: `Step into a world of timeless elegance at the Royal Joglo Estate. This expansive property features an authentic Javanese Joglo, a traditional wooden house, that has been lovingly restored and transformed into a luxurious villa. The intricate carvings and antique furniture create an atmosphere of royal splendor and cultural heritage.\n\nThe estate is set within beautifully landscaped tropical gardens, complete with a large swimming pool, a serene koi pond, and multiple relaxation areas. The main Joglo houses the grand living and dining pavilion, an ideal space for entertaining or simply unwinding with family and friends. A separate, fully equipped modern kitchen is also available for your convenience.\n\nFour spacious bedroom suites are located in separate pavilions surrounding the main Joglo, ensuring privacy for all guests. Each suite features a unique design, a plush king-sized bed, and a lavish en-suite bathroom. The blend of traditional architecture and modern luxury creates a truly unique and comfortable environment.\n\nOur in-house chef specializes in both Balinese and international cuisine, and cooking classes can be arranged. The villa is ideal for families or groups seeking an immersive cultural experience.`, 
        shortDescription: "Traditional Joglo with tropical gardens",
        pricePerNight: 6500000,
        capacity: 8,
        bedrooms: 4,
        bathrooms: 4,
        images: [
            'https://images.unsplash.com/photo-1571880829813-f4a292695c47?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2524&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1590490359855-359c6361bd93?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        ],
        amenities: ["Koi Pond", "Traditional Joglo", "Chef Service", "WiFi", "AC", "Private Garden"],
        isAvailable: true,
        rating: 4.9,
        reviewCount: 156,
        location: "Central Ubud",
        coordinates: { lat: -8.5069, lng: 115.2625 },
        cleaningFee: 600000,
        serviceFee: 500000,
        minimumStay: 3,
    }
];


export const seedVillas = async () => {
    console.log('Deleting existing villas...');
    const { error: deleteError } = await supabase.from('villas').delete().neq('id', '0');
    if (deleteError) {
        console.error('Error deleting villas:', deleteError);
        return;
    }
    console.log('Villas deleted.');

    console.log('Seeding villas...');
    const { data, error } = await supabase.from('villas').insert(villasToSeed).select();

    if (error) {
        console.error('Error seeding villas:', error);
    } else {
        console.log('Seeded villas:', data);
    }
};

export const seedBookings = async () => {
    // Create some bookings for the last year
    const bookings = [];
    const today = new Date();

    for (let i = 0; i < 50; i++) {
        const villa = villasToSeed[Math.floor(Math.random() * villasToSeed.length)];
        const checkIn = new Date(today.getFullYear(), today.getMonth() - Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        const checkOut = new Date(checkIn.getTime() + (Math.floor(Math.random() * 7) + 2) * 24 * 60 * 60 * 1000);
        const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = (villa.pricePerNight * nights) + villa.cleaningFee + villa.serviceFee;

        bookings.push({
            villa_id: villa.id,
            guest_name: `Test Guest ${i}`,
            check_in: checkIn.toISOString().split('T')[0],
            check_out: checkOut.toISOString().split('T')[0],
            status: ['confirmed', 'pending', 'cancelled'][Math.floor(Math.random() * 3)],
            total_price: totalPrice,
            guests: Math.floor(Math.random() * villa.capacity) + 1,
            created_at: checkIn.toISOString(),
        });
    }

    console.log('Deleting existing bookings...');
    const { error: deleteError } = await supabase.from('bookings').delete().neq('id', 0);
    if (deleteError) {
        console.error('Error deleting bookings:', deleteError);
        return;
    }
    console.log('Bookings deleted.');

    console.log('Seeding bookings...');
    const { error } = await supabase.from('bookings').insert(bookings as any);

    if (error) {
        console.error('Error seeding bookings:', error);
    } else {
        console.log('Successfully seeded bookings.');
    }
}
