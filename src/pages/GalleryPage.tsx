import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useGalleryStore } from '@/store/galleryStore';

const categories = ['All', 'Villa Exteriors', 'Villa Interiors', 'Ubud Views', 'Guest Experiences'];

const GalleryPage = () => {
    const { images, isLoading, fetchImages } = useGalleryStore();
    const [activeCategory, setActiveCategory] = useState('All');
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const filteredImages = activeCategory === 'All'
        ? images
        : images.filter((img) => img.category === activeCategory);

    const openLightbox = (index: number) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = '';
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % filteredImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') closeLightbox();
    };

    return (
        <div className="min-h-screen bg-[#F1F3E0]">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-24 pb-12 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl font-serif font-bold text-[#2d3a29] mb-4">Gallery</h1>
                    <p className="text-xl text-[#6b7c67] max-w-2xl mx-auto">
                        Explore our beautiful villas and the stunning landscapes of Ubud
                    </p>
                </div>
            </section>

            {/* Filter Tabs */}
            <section className="pb-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-wrap gap-3 justify-center">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category
                                    ? 'bg-[#778873] text-white'
                                    : 'bg-white text-[#6b7c67] hover:bg-[#D2DCB6]'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Photo Grid */}
            <section className="py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    {isLoading && images.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <Loader2 size={32} className="animate-spin text-[#778873]" />
                        </div>
                    ) : (
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                            {filteredImages.map((image, index) => (
                                <div
                                    key={image.id}
                                    className="break-inside-avoid relative rounded-xl overflow-hidden shadow-lg group cursor-pointer bg-gray-200"
                                    onClick={() => openLightbox(index)}
                                >
                                    <img
                                        src={image.image_url}
                                        alt={image.title || image.category}
                                        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <ZoomIn size={32} className="text-white" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-sm font-medium">{image.title}</p>
                                        <p className="text-white/70 text-xs">{image.category}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {!isLoading && filteredImages.length === 0 && (
                        <div className="text-center py-12 text-[#6b7c67]">
                            No images found in this category.
                        </div>
                    )}
                </div>
            </section>

            {/* Lightbox */}
            {lightboxOpen && filteredImages.length > 0 && (
                <div
                    className="fixed inset-0 z-50 bg-black flex items-center justify-center"
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
                    >
                        <X size={24} />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute top-4 left-4 text-white/80 text-sm">
                        {currentImageIndex + 1} / {filteredImages.length}
                    </div>

                    {/* Previous Button */}
                    <button
                        onClick={prevImage}
                        className="absolute left-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    {/* Image */}
                    <img
                        src={filteredImages[currentImageIndex].image_url}
                        alt={filteredImages[currentImageIndex].title}
                        className="max-w-[90vw] max-h-[80vh] object-contain"
                    />

                    {/* Next Button */}
                    <button
                        onClick={nextImage}
                        className="absolute right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Caption */}
                    <div className="absolute bottom-8 left-0 right-0 text-center">
                        <p className="text-white text-lg font-medium mb-1">
                            {filteredImages[currentImageIndex].title}
                        </p>
                        <p className="text-white/60 text-sm">
                            {filteredImages[currentImageIndex].category}
                        </p>
                    </div>

                    {/* Download Button */}
                    <a
                        href={filteredImages[currentImageIndex].image_url}
                        download
                        className="absolute bottom-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                        <Download size={18} />
                    </a>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default GalleryPage;
