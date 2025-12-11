"use client"

import type React from "react"

import { useState } from "react"
import { Phone, Mail, MessageCircle, MapPin, Clock, Send, ChevronDown, Instagram, Facebook } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { toast } from "@/hooks/use-toast"

// FAQ data
const faqs = [
  {
    question: "How do I book a villa?",
    answer:
      "You can book directly through our website by selecting your preferred villa, dates, and completing the checkout process. Alternatively, you can contact us via WhatsApp or email for personalized assistance.",
  },
  {
    question: "What is the cancellation policy?",
    answer:
      "Cancellations made 14+ days before check-in receive a full refund. 7-14 days receives 50% refund. Less than 7 days is non-refundable. Special conditions may apply during peak seasons.",
  },
  {
    question: "Is airport pickup included?",
    answer:
      "Airport pickup is available as an add-on service for IDR 350,000 (up to 4 passengers). We can arrange pickup from Ngurah Rai International Airport (approximately 1.5 hours to Ubud).",
  },
  {
    question: "What amenities are included?",
    answer:
      "All villas include: Private pool, fully equipped kitchen, AC, WiFi, daily housekeeping, welcome basket, toiletries, and 24/7 concierge service. Specific amenities vary by villa.",
  },
  {
    question: "Can I extend my stay?",
    answer:
      "Yes! Subject to availability, you can extend your stay. Please contact our team at least 24 hours before your original check-out date to arrange an extension.",
  },
  {
    question: "How do I make payment?",
    answer:
      "We accept bank transfer (BCA), credit/debit cards, and Indonesian e-wallets (GoPay, OVO, DANA). Payment is required within 24 hours of booking to confirm your reservation.",
  },
]

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("contact_submissions").insert([formData])

      if (error) throw error

      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
        className: "bg-[#778873] text-white border-none",
      })
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F1F3E0]">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-serif font-bold text-[#2d3a29] mb-4">Get in Touch</h1>
          <p className="text-xl text-[#6b7c67] max-w-2xl mx-auto">
            Have questions about our villas or need help planning your stay? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="pb-12 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          <a
            href="tel:+623611234567"
            className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow group"
          >
            <div className="w-14 h-14 bg-[#A1BC98]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#A1BC98] transition-colors">
              <Phone size={24} className="text-[#778873] group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-semibold text-[#2d3a29] mb-1">Phone</h3>
            <p className="text-[#778873]">+62 361 123 4567</p>
          </a>
          <a
            href="mailto:hello@stayinubud.com"
            className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow group"
          >
            <div className="w-14 h-14 bg-[#A1BC98]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#A1BC98] transition-colors">
              <Mail size={24} className="text-[#778873] group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-semibold text-[#2d3a29] mb-1">Email</h3>
            <p className="text-[#778873]">hello@stayinubud.com</p>
          </a>
          <a
            href="https://wa.me/628123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow group"
          >
            <div className="w-14 h-14 bg-[#A1BC98]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#25D366] transition-colors">
              <MessageCircle size={24} className="text-[#778873] group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-semibold text-[#2d3a29] mb-1">WhatsApp</h3>
            <p className="text-[#778873]">+62 812 3456 789</p>
          </a>
        </div>
      </section>

      {/* Two Column: Form + Info */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-serif font-bold text-[#2d3a29] mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#d4dbc8] focus:outline-none focus:border-[#A1BC98]"
                  placeholder="Your name"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2d3a29] mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-[#d4dbc8] focus:outline-none focus:border-[#A1BC98]"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2d3a29] mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-[#d4dbc8] focus:outline-none focus:border-[#A1BC98]"
                    placeholder="+62..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#d4dbc8] focus:outline-none focus:border-[#A1BC98]"
                >
                  <option value="">Select a subject...</option>
                  <option value="general">General Inquiry</option>
                  <option value="booking">Booking Question</option>
                  <option value="partnership">Partnership</option>
                  <option value="press">Press</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-[#d4dbc8] focus:outline-none focus:border-[#A1BC98] resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#778873] text-white font-semibold rounded-lg hover:bg-[#2d3a29] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info & Map */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 bg-[#A1BC98]/20 rounded-full flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-[#778873]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2d3a29] mb-1">Our Office</h3>
                  <p className="text-[#6b7c67]">
                    Jl. Monkey Forest No. 123
                    <br />
                    Ubud, Gianyar, Bali 80571
                    <br />
                    Indonesia
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 bg-[#A1BC98]/20 rounded-full flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-[#778873]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2d3a29] mb-1">Operating Hours</h3>
                  <p className="text-[#6b7c67]">
                    Monday - Saturday: 8:00 AM - 8:00 PM
                    <br />
                    Sunday: 9:00 AM - 5:00 PM
                    <br />
                    (Bali Time, GMT+8)
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com/stayinubud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#F1F3E0] rounded-full flex items-center justify-center text-[#778873] hover:bg-[#A1BC98] hover:text-white transition-colors"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="https://facebook.com/stayinubud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#F1F3E0] rounded-full flex items-center justify-center text-[#778873] hover:bg-[#A1BC98] hover:text-white transition-colors"
                >
                  <Facebook size={20} />
                </a>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31563.63254766653!2d115.24843!3d-8.50695!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd23d739f22c9c3%3A0x54a38afd6bf5a15f!2sUbud%2C%20Gianyar%20Regency%2C%20Bali!5e0!3m2!1sen!2sid!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-[#2d3a29] text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-[#d4dbc8] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[#F1F3E0] transition-colors"
                >
                  <span className="font-medium text-[#2d3a29]">{faq.question}</span>
                  <ChevronDown
                    size={20}
                    className={`text-[#778873] transition-transform ${openFaq === index ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === index && <div className="px-5 pb-5 text-[#6b7c67]">{faq.answer}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default ContactPage
                      
