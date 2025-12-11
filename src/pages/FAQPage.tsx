import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, HelpCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// FAQ data organized by category
const faqData = {
    Booking: [
        {
            question: 'How do I book a villa?',
            answer: 'You can book directly through our website by selecting your preferred villa, choosing your dates, and completing the checkout process. Alternatively, contact us via WhatsApp for personalized assistance.',
        },
        {
            question: 'How far in advance should I book?',
            answer: 'We recommend booking at least 2-4 weeks in advance, especially during peak seasons (July-August, December-January). Last-minute bookings are possible subject to availability.',
        },
        {
            question: 'Can I modify my booking after confirmation?',
            answer: 'Yes, you can modify your booking dates subject to availability. Please contact us at least 7 days before your check-in date. Modification fees may apply.',
        },
    ],
    Payments: [
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept bank transfer (BCA, Mandiri), credit/debit cards (Visa, Mastercard), and Indonesian e-wallets including GoPay, OVO, and DANA.',
        },
        {
            question: 'Is a deposit required?',
            answer: 'Yes, we require a 50% deposit to confirm your booking. The remaining balance is due 7 days before check-in or upon arrival for last-minute bookings.',
        },
        {
            question: 'Do you charge in USD or IDR?',
            answer: 'All prices are displayed in IDR (Indonesian Rupiah). International guests can pay in their local currency; the conversion will be handled by your bank.',
        },
    ],
    Policies: [
        {
            question: 'What is the cancellation policy?',
            answer: 'Free cancellation up to 14 days before check-in. 50% refund for cancellations 7-14 days before. No refund for cancellations less than 7 days before check-in.',
        },
        {
            question: 'What are the check-in and check-out times?',
            answer: 'Standard check-in is 3:00 PM and check-out is 11:00 AM. Early check-in or late check-out may be arranged subject to availability (additional fees may apply).',
        },
        {
            question: 'Are pets allowed?',
            answer: 'We do not allow pets in our villas to ensure a comfortable stay for all guests and to maintain our properties.',
        },
    ],
    Amenities: [
        {
            question: 'What amenities are included?',
            answer: 'All villas include: private pool, fully equipped kitchen, AC, WiFi, daily housekeeping, welcome basket, toiletries, pool towels, and 24/7 concierge service.',
        },
        {
            question: 'Is breakfast included?',
            answer: 'A welcome breakfast basket is included on your first morning. Additional breakfast service can be arranged at an extra cost.',
        },
        {
            question: 'Is there WiFi?',
            answer: 'Yes, all villas have complimentary high-speed WiFi throughout the property.',
        },
    ],
    Location: [
        {
            question: 'How far is the villa from Ubud center?',
            answer: 'Our villas are located 5-15 minutes from Ubud center by car. Each villa page has specific location information.',
        },
        {
            question: 'Is airport transfer available?',
            answer: 'Yes, we offer airport pickup service for IDR 350,000 (up to 4 passengers). The drive from Ngurah Rai Airport to Ubud takes approximately 1.5 hours.',
        },
        {
            question: 'Can you arrange tours and activities?',
            answer: 'Absolutely! Our concierge team can arrange tours to temples, rice terraces, waterfalls, as well as cooking classes, spa treatments, and more.',
        },
    ],
    General: [
        {
            question: 'Is the villa suitable for families with children?',
            answer: 'Yes, our villas are family-friendly. We can provide baby cots, high chairs, and pool safety gates upon request. Please note that pools are not fenced by default.',
        },
        {
            question: 'Can I extend my stay?',
            answer: 'Subject to availability, you can extend your stay. Please contact us at least 24 hours before your scheduled check-out.',
        },
        {
            question: 'Do you offer long-term stays?',
            answer: 'Yes, we offer special rates for stays of 7 nights or longer. Contact us for a custom quote.',
        },
    ],
};

const categories = Object.keys(faqData);

const FAQPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('Booking');
    const [openQuestion, setOpenQuestion] = useState<number | null>(null);

    // Filter FAQs by search
    const currentFaqs = faqData[activeCategory as keyof typeof faqData].filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Search across all categories
    const searchAllFaqs = () => {
        if (!searchQuery) return [];
        const results: { category: string; question: string; answer: string }[] = [];
        Object.entries(faqData).forEach(([category, faqs]) => {
            faqs.forEach((faq) => {
                if (
                    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
                ) {
                    results.push({ category, ...faq });
                }
            });
        });
        return results;
    };

    const searchResults = searchAllFaqs();

    return (
        <div className="min-h-screen bg-[#F1F3E0]">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-serif font-bold text-[#2d3a29] mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-xl text-[#6b7c67] max-w-2xl mx-auto mb-8">
                        Find answers to common questions about our villas and services
                    </p>
                    {/* Search Bar */}
                    <div className="relative max-w-xl mx-auto">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7c67]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search FAQs..."
                            className="w-full pl-12 pr-4 py-4 rounded-full border border-[#d4dbc8] bg-white focus:outline-none focus:border-[#A1BC98] shadow-sm"
                        />
                    </div>
                </div>
            </section>

            {/* Search Results */}
            {searchQuery && searchResults.length > 0 && (
                <section className="px-4 pb-8">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-sm text-[#6b7c67] mb-4">
                            Found {searchResults.length} results for "{searchQuery}"
                        </p>
                        <div className="space-y-4">
                            {searchResults.map((result, index) => (
                                <div key={index} className="bg-white rounded-xl p-5 shadow-md">
                                    <span className="inline-block px-2 py-1 bg-[#A1BC98]/20 text-xs font-medium text-[#778873] rounded-full mb-2">
                                        {result.category}
                                    </span>
                                    <h3 className="font-medium text-[#2d3a29] mb-2">{result.question}</h3>
                                    <p className="text-sm text-[#6b7c67]">{result.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Category Tabs and FAQ List */}
            {!searchQuery && (
                <section className="py-8 px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Category Tabs */}
                        <div className="flex flex-wrap gap-2 justify-center mb-8">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => {
                                        setActiveCategory(category);
                                        setOpenQuestion(null);
                                    }}
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category
                                            ? 'bg-[#778873] text-white'
                                            : 'bg-white text-[#6b7c67] hover:bg-[#D2DCB6]'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* FAQ Accordion */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            {currentFaqs.map((faq, index) => (
                                <div key={index} className="border-b border-[#d4dbc8] last:border-b-0">
                                    <button
                                        onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                                        className="w-full flex items-center justify-between p-6 text-left hover:bg-[#F1F3E0] transition-colors"
                                    >
                                        <span className="font-medium text-[#2d3a29] pr-4">{faq.question}</span>
                                        <ChevronDown
                                            size={20}
                                            className={`text-[#778873] shrink-0 transition-transform ${openQuestion === index ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>
                                    {openQuestion === index && (
                                        <div className="px-6 pb-6 text-[#6b7c67] leading-relaxed animate-in slide-in-from-top-2">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Still Have Questions CTA */}
            <section className="py-16 px-4">
                <div className="max-w-2xl mx-auto bg-[#2d3a29] rounded-2xl p-8 md:p-12 text-center">
                    <HelpCircle size={48} className="text-[#A1BC98] mx-auto mb-4" />
                    <h2 className="text-2xl font-serif font-bold text-white mb-4">
                        Still Have Questions?
                    </h2>
                    <p className="text-white/80 mb-6">
                        Can't find what you're looking for? Our team is here to help!
                    </p>
                    <Link
                        to="/contact"
                        className="inline-flex px-8 py-3 bg-[#A1BC98] text-[#2d3a29] font-semibold rounded-full hover:bg-[#D2DCB6] transition-colors"
                    >
                        Contact Our Team
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default FAQPage;
