"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Award,
  Heart,
  Users,
  MapPin,
  Instagram,
  Linkedin,
  Loader2,
} from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { useVillaStore } from "@/store/villaStore"
import { useTestimonialStore } from "@/store/testimonialStore"

// Team members data (static - could be moved to DB if needed)
const team = [
  {
    name: "Wayan Sudarma",
    role: "Founder & CEO",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    bio: "Born in Ubud, Wayan has dedicated his life to sharing Balinese hospitality with the world.",
  },
  {
    name: "Sarah Mitchell",
    role: "Operations Manager",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
    bio: "With 10+ years in luxury hospitality, Sarah ensures every guest experience is flawless.",
  },
  {
    name: "Made Arjuna",
    role: "Guest Relations",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop",
    bio: "Made is your local guide to the best of Ubud, from hidden waterfalls to authentic restaurants.",
  },
]

const values = [
  { icon: Heart, title: "Authentic Hospitality", desc: "We bring genuine Balinese warmth to every interaction." },
  { icon: Award, title: "Exceptional Quality", desc: "Every detail is carefully curated for your comfort." },
  { icon: Users, title: "Community First", desc: "We support local artisans and sustainable tourism." },
  { icon: MapPin, title: "Prime Locations", desc: "Our villas are situated in the most beautiful spots." },
]

const AboutPage = () => {
  const [testimonialIndex, setTestimonialIndex] = useState(0)

  const { villas, fetchVillas, isLoading: villasLoading } = useVillaStore()
  const { testimonials, fetchTestimonials, isLoading: testimonialsLoading } = useTestimonialStore()

  useEffect(() => {
    fetchVillas()
    fetchTestimonials()
  }, [fetchVillas, fetchTestimonials])

  const nextTestimonial = () => {
    if (testimonials.length > 0) {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length)
    }
  }

  const prevTestimonial = () => {
    if (testimonials.length > 0) {
      setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }
  }

  const currentTestimonial = testimonials[testimonialIndex]

  return (
    <div className="min-h-screen bg-[#F1F3E0]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&h=1080&fit=crop"
          alt="Ubud landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">About StayinUBUD</h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto px-4">
              Bringing authentic Balinese hospitality to discerning travelers since 2018
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=600&fit=crop"
                alt="Villa garden"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#A1BC98] rounded-2xl -z-10" />
            </div>
            <div>
              <h2 className="text-4xl font-serif font-bold text-[#2d3a29] mb-6">Our Story</h2>
              <p className="text-[#6b7c67] mb-4 leading-relaxed">
                StayinUBUD was born from a simple dream: to share the magic of Ubud with the world while preserving its
                authentic spirit. What started as a single villa in 2018 has grown into a collection of exclusive
                properties, each uniquely designed to offer an unforgettable experience.
              </p>
              <p className="text-[#6b7c67] mb-4 leading-relaxed">
                Our founder, Wayan Sudarma, grew up in the rice fields surrounding Ubud. His deep connection to this
                land and its traditions guides everything we do—from the locally-sourced materials in our villas to the
                warm welcomes from our Balinese staff.
              </p>
              <p className="text-[#6b7c67] leading-relaxed">
                We believe luxury should feel personal, not pretentious. That's why we limit our collection, ensuring
                every guest receives the attention and care they deserve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-[#2d3a29] text-center mb-12">Why Choose Us</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#A1BC98]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon size={28} className="text-[#778873]" />
                </div>
                <h3 className="text-lg font-semibold text-[#2d3a29] mb-2">{value.title}</h3>
                <p className="text-sm text-[#6b7c67]">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-[#2d3a29] text-center mb-4">Meet Our Team</h2>
          <p className="text-center text-[#6b7c67] mb-12 max-w-2xl mx-auto">
            The people who make your stay unforgettable
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={member.photo || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#778873] hover:bg-[#A1BC98] hover:text-white transition-colors">
                      <Instagram size={18} />
                    </button>
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#778873] hover:bg-[#A1BC98] hover:text-white transition-colors">
                      <Linkedin size={18} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#2d3a29]">{member.name}</h3>
                  <p className="text-sm text-[#778873] mb-3">{member.role}</p>
                  <p className="text-[#6b7c67] text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Villas Section - Now loads from Supabase */}
      <section className="py-16 bg-[#2d3a29]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">
            {villas.length} Exclusive Villas in Prime Ubud Locations
          </h2>
          <p className="text-[#D2DCB6] mb-8 max-w-2xl mx-auto">
            Each villa has been carefully designed to offer privacy, comfort, and stunning views
          </p>
          {villasLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={32} className="animate-spin text-[#A1BC98]" />
            </div>
          ) : (
            <div className="flex gap-4 justify-center flex-wrap mb-8">
              {villas.slice(0, 4).map((villa) => (
                <img
                  key={villa.id}
                  src={villa.images[0] || "/placeholder.svg"}
                  alt={villa.name}
                  className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
          <Link
            to="/villas"
            className="inline-flex px-8 py-3 bg-[#A1BC98] text-[#2d3a29] font-semibold rounded-full hover:bg-[#D2DCB6] transition-colors"
          >
            Explore Our Villas
          </Link>
        </div>
      </section>

      {/* Testimonials Section - Now loads from Supabase */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-[#2d3a29] text-center mb-12">What Our Guests Say</h2>
          {testimonialsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={32} className="animate-spin text-[#778873]" />
            </div>
          ) : testimonials.length === 0 ? (
            <p className="text-center text-[#6b7c67]">No testimonials yet.</p>
          ) : (
            <div className="relative bg-white rounded-2xl p-8 md:p-12 shadow-lg">
              <div className="flex justify-center mb-6">
                {[...Array(currentTestimonial?.rating || 5)].map((_, i) => (
                  <Star key={i} size={24} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl text-center text-[#2d3a29] italic mb-6">
                "{currentTestimonial?.review}"
              </blockquote>
              <div className="text-center">
                <p className="font-semibold text-[#2d3a29]">{currentTestimonial?.guest_name}</p>
                <p className="text-sm text-[#6b7c67]">
                  {currentTestimonial?.guest_country} •{" "}
                  {currentTestimonial?.review_date
                    ? new Date(currentTestimonial.review_date).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </p>
              </div>
              {testimonials.length > 1 && (
                <div className="flex justify-center gap-4 mt-8">
                  <button
                    onClick={prevTestimonial}
                    className="w-10 h-10 bg-[#F1F3E0] rounded-full flex items-center justify-center hover:bg-[#D2DCB6] transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextTestimonial}
                    className="w-10 h-10 bg-[#F1F3E0] rounded-full flex items-center justify-center hover:bg-[#D2DCB6] transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-[#A1BC98]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold text-[#2d3a29] mb-4">Have Questions? We're Here to Help</h2>
          <p className="text-[#2d3a29]/80 mb-8">
            Our team is ready to assist you in planning your perfect Ubud getaway
          </p>
          <Link
            to="/contact"
            className="inline-flex px-8 py-3 bg-[#2d3a29] text-white font-semibold rounded-full hover:bg-[#778873] transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default AboutPage
