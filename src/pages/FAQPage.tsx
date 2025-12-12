import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, HelpCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useFaqStore } from '@/store/faqStore';

const FAQPage = () => {
    const { faqs, fetchFaqs, isLoading } = useFaqStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [openQuestion, setOpenQuestion] = useState<number | null>(null);

    useEffect(() => {
        fetchFaqs();
    }, [fetchFaqs]);

    useEffect(() => {
        if (faqs.length > 0 && !activeCategory) {
            const categories = [...new Set(faqs.map(faq => faq.category))];
            setActiveCategory(categories[0] || null);
        }
    }, [faqs, activeCategory]);

    const categories = [...new Set(faqs.map(faq => faq.category))];

    const currentFaqs = faqs.filter(
        (faq) =>
            faq.category === activeCategory &&
            (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const searchAllFaqs = () => {
        if (!searchQuery) return [];
        return faqs
            .filter(
                (faq) =>
                    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((faq) => ({ ...faq }));
    };

    const searchResults = searchAllFaqs();

    return (
        <div className="min-h-screen bg-[#F1F3E0]">
            <Navbar />

            <section className="pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-serif font-bold text-[#2d3a29] mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-xl text-[#6b7c67] max-w-2xl mx-auto mb-8">
                        Find answers to common questions about our villas and services
                    </p>
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

            {!searchQuery && (
                <section className="py-8 px-4">
                    <div className="max-w-4xl mx-auto">
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

                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            {isLoading ? (
                                <p className="p-6 text-center">Loading FAQs...</p>
                            ) : (
                                currentFaqs.map((faq, index) => (
                                    <div key={faq.id} className="border-b border-[#d4dbc8] last:border-b-0">
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
                                ))
                            )}
                        </div>
                    </div>
                </section>
            )}

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

export default FAQPage;ぴ