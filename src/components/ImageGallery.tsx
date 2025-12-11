import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

const ImageGallery = ({ images, alt }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const nextImage = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") setIsLightboxOpen(false);
    },
    [nextImage, prevImage]
  );

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl group">
          <motion.img
            key={selectedIndex}
            src={images[selectedIndex]}
            alt={`${alt} - Image ${selectedIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Zoom button */}
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-4 right-4 p-3 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            aria-label="View fullscreen"
          >
            <ZoomIn size={20} className="text-foreground" />
          </button>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} className="text-foreground" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                aria-label="Next image"
              >
                <ChevronRight size={24} className="text-foreground" />
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-foreground/80 text-background text-sm rounded-full">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail Grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                  index === selectedIndex
                    ? "ring-2 ring-primary ring-offset-2"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={image}
                  alt={`${alt} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 text-background hover:bg-background/10 rounded-full transition-colors z-50"
              aria-label="Close lightbox"
            >
              <X size={32} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 p-3 bg-background/10 hover:bg-background/20 rounded-full transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={32} className="text-background" />
            </button>

            <motion.img
              key={selectedIndex}
              src={images[selectedIndex]}
              alt={`${alt} - Image ${selectedIndex + 1}`}
              className="max-w-[90vw] max-h-[90vh] object-contain"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 p-3 bg-background/10 hover:bg-background/20 rounded-full transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={32} className="text-background" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-background/20 text-background rounded-full">
              {selectedIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGallery;
