import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Facebook, 
  Send,
  ArrowRight
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const quickLinks = [
  { name: "Our Villas", href: "#villas" },
  { name: "Experience Ubud", href: "#experience" },
  { name: "Guest Reviews", href: "#testimonials" },
  { name: "Location", href: "#location" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "#" },
  { name: "Terms of Service", href: "#" },
  { name: "Cancellation Policy", href: "#" },
];

const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "Facebook", icon: Facebook, href: "#" },
];

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
    }
  };

  return (
    <footer id="contact" className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <a href="#" className="inline-block mb-6">
              <span className="font-display text-3xl font-semibold">
                Stay<span className="text-primary">in</span>UBUD
              </span>
            </a>
            <p className="text-background/70 mb-6">
              Discover the art of luxury living in the heart of Bali. 
              Our handpicked villas offer an authentic yet indulgent 
              Ubud experience.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                  aria-label={social.name}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors inline-flex items-center gap-2 group"
                  >
                    <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary flex-shrink-0 mt-1" />
                <span className="text-background/70">
                  Jl. Raya Ubud No. 88<br />
                  Gianyar, Bali 80571<br />
                  Indonesia
                </span>
              </li>
              <li>
                <a
                  href="tel:+62361123456"
                  className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors"
                >
                  <Phone size={18} className="text-primary" />
                  +62 361 123 456
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@stayinubud.com"
                  className="flex items-center gap-3 text-background/70 hover:text-primary transition-colors"
                >
                  <Mail size={18} className="text-primary" />
                  hello@stayinubud.com
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6">
              Newsletter
            </h4>
            <p className="text-background/70 mb-4">
              Subscribe for exclusive offers and travel inspiration.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-background/10 border border-background/20 rounded-lg focus:outline-none focus:border-primary text-background placeholder:text-background/50"
                  required
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                Subscribe
                <Send size={16} />
              </motion.button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/50 text-sm">
              © {new Date().getFullYear()} StayinUBUD. All rights reserved.
            </p>
            <div className="flex gap-6">
              {legalLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-background/50 hover:text-primary text-sm transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
