import { useState, useEffect } from 'react';
import { Phone, Mail, MessageCircle, MapPin, Clock, Send, Instagram, Facebook } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';
import { useSettingsStore } from '@/store/settingsStore';

const ContactPage = () => {
  const {
    settings,
    fetchSettings,
    getSetting,
  } = useSettingsStore();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const contactEmail = getSetting('contact_email');
  const contactPhone = getSetting('contact_phone');
  const whatsapp = getSetting('whatsapp');
  const address = getSetting('address');
  const socialInstagram = getSetting('social_instagram');
  const socialFacebook = getSetting('social_facebook');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.message) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('contact_submissions').insert([formData]);
      if (error) throw error;

      toast({
        title: 'Message sent!',
        description: "We'll get back to you within 24 hours.",
        className: 'bg-[#778873] text-white border-none',
      });
      setFormData({ full_name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3E0]">
      <Navbar />

      <section className="pt-28 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-serif font-bold text-[#2d3a29] mb-4">Get in Touch</h1>
          <p className="text-xl text-[#6b7c67] max-w-2xl mx-auto">
            Have questions about our villas or need help planning your stay? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="pb-12 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          <a
            href={`tel:${contactPhone}`}
            className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow group"
          >
            <div className="w-14 h-14 bg-[#A1BC98]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#A1BC98] transition-colors">
              <Phone size={24} className="text-[#778873] group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-semibold text-[#2d3a29] mb-1">Phone</h3>
            <p className="text-[#778873]">{contactPhone}</p>
          </a>
          <a
            href={`mailto:${contactEmail}`}
            className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow group"
          >
            <div className="w-14 h-14 bg-[#A1BC98]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#A1BC98] transition-colors">
              <Mail size={24} className="text-[#778873] group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-semibold text-[#2d3a29] mb-1">Email</h3>
            <p className="text-[#778873]">{contactEmail}</p>
          </a>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow group"
          >
            <div className="w-14 h-14 bg-[#A1BC98]/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#25D366] transition-colors">
              <MessageCircle size={24} className="text-[#778873] group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-semibold text-[#2d3a29] mb-1">WhatsApp</h3>
            <p className="text-[#778873]">{whatsapp}</p>
          </a>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-serif font-bold text-[#2d3a29] mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                  'Sending...'
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 bg-[#A1BC98]/20 rounded-full flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-[#778873]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2d3a29] mb-1">Our Office</h3>
                  <p className="text-[#6b7c67]">{address}</p>
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
                  href={socialInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#F1F3E0] rounded-full flex items-center justify-center text-[#778873] hover:bg-[#A1BC98] hover:text-white transition-colors"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href={socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-[#F1F3E0] rounded-full flex items-center justify-center text-[#778873] hover:bg-[#A1BC98] hover:text-white transition-colors"
                >
                  <Facebook size={20} />
                </a>
              </div>
            </div>

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

      <Footer />
    </div>
  );
};

export default ContactPage;