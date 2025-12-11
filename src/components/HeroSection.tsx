"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Calendar, Users, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import heroVilla from "@/assets/hero-villa.jpg"
import villa1 from "@/assets/villa-1.jpg"
import villa2 from "@/assets/villa-2.jpg"
import villa3 from "@/assets/villa-3.jpg"
import villa4 from "@/assets/villa-4.jpg"

const heroImages = [heroVilla, villa1, villa2, villa3, villa4]

const HeroSection = () => {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [guests, setGuests] = useState(2)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroImages.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (checkIn) params.set("checkIn", checkIn.toISOString())
    if (checkOut) params.set("checkOut", checkOut.toISOString())
    params.set("guests", guests.toString())
    navigate(`/villas?${params.toString()}`)
  }

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img
              src={heroImages[currentSlide] || "/placeholder.svg"}
              alt="Luxury Villa in Ubud"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-foreground/20" />
      </div>

      {/* Carousel Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <button
          onClick={prevSlide}
          className="p-2 bg-background/20 backdrop-blur-sm rounded-full text-background hover:bg-background/30 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-background w-8" : "bg-background/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <button
          onClick={nextSlide}
          className="p-2 bg-background/20 backdrop-blur-sm rounded-full text-background hover:bg-background/30 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-background"
            >
              {/* Availability Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/90 backdrop-blur-sm rounded-full mb-6"
              >
                <Sparkles size={16} className="text-primary-foreground animate-pulse-soft" />
                <span className="text-sm font-medium text-primary-foreground">Villas Available Now</span>
              </motion.div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-tight mb-6">
                Experience
                <br />
                <span className="italic">Luxury</span> in the
                <br />
                Heart of <span className="text-primary">Ubud</span>
              </h1>

              <p className="text-lg sm:text-xl text-background/80 max-w-lg mb-8">
                Discover our collection of handpicked luxury villas, each offering a unique blend of Balinese tradition
                and modern comfort.
              </p>

              <div className="flex flex-wrap gap-4">
                <a href="#villas" className="btn-primary">
                  Explore Villas
                </a>
                <a
                  href="#experience"
                  className="btn-outline border-background/50 text-background hover:bg-background hover:text-foreground"
                >
                  Our Story
                </a>
              </div>
            </motion.div>

            {/* Right - Search Widget */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="hidden lg:block"
            >
              <div className="glass-card rounded-2xl p-8 max-w-md ml-auto">
                <h3 className="font-display text-2xl font-semibold text-foreground mb-6">Find Your Perfect Stay</h3>

                <div className="space-y-5">
                  {/* Check In */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Check In</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <DatePicker
                        selected={checkIn}
                        onChange={(date) => setCheckIn(date)}
                        minDate={new Date()}
                        placeholderText="Select date"
                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      />
                    </div>
                  </div>

                  {/* Check Out */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Check Out</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <DatePicker
                        selected={checkOut}
                        onChange={(date) => setCheckOut(date)}
                        minDate={checkIn || new Date()}
                        placeholderText="Select date"
                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Guests</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "Guest" : "Guests"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Search Button */}
                  <button onClick={handleSearch} className="w-full btn-primary text-center py-4">
                    Check Availability
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          className="w-6 h-10 border-2 border-background/50 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-background/80 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default HeroSection
