import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Calendar, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo.png";

const Navbar = () => {
  const location = useLocation();
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [showMobileNav, setShowMobileNav] = useState(true);
  const lastScrollY = useRef(0);

  const isHomePage = location.pathname === "/";

  // Handle scroll
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setScrollY(currentScrollY);

          // Detect scroll direction
          if (currentScrollY > lastScrollY.current) {
            setScrollDirection("down");
            if (currentScrollY > 50) setShowMobileNav(false);
          } else {
            setScrollDirection("up");
            setShowMobileNav(true);
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Calculate animation values based on scroll
  const scrollStart = 50;
  const scrollEnd = 80;
  const scrollProgress = Math.max(0, Math.min(1, (scrollY - scrollStart) / (scrollEnd - scrollStart)));

  const textOpacity = Math.max(0, 1 - scrollProgress);
  const logoOpacity = Math.min(1, scrollProgress);
  const textScale = Math.max(0.3, 1 - scrollProgress);
  const logoScale = Math.min(1, 0.5 + scrollProgress);

  // ============================================
  // DESKTOP NAVBAR (≥1024px)
  // ============================================
  if (!isMobile) {
    return (
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[1000] transition-all duration-300",
          scrollY > scrollEnd
            ? "h-[70px] bg-[rgba(241,243,224,0.95)] backdrop-blur-[15px] shadow-lg"
            : "h-[100px] bg-transparent backdrop-blur-[10px]"
        )}
      >
        <nav className="h-full mx-auto px-8 max-w-7xl flex items-center justify-between">
          {/* Left Menu */}
          <div className="flex items-center gap-[40px]">
            <div className="flex gap-8">
              {/* Villas Dropdown */}
              <DesktopDropdown label="Villas" dropdownId="villas" items={[
                { label: "All Villas", href: "/villas" },
                { label: "Luxury Villas", href: "/villas?type=luxury" },
                { label: "Budget Villas", href: "/villas?type=budget" },
                { label: "Ubud Villas", href: "/villas?location=ubud" },
                { label: "With Pool", href: "/villas?amenity=pool" },
              ]} />

              <a href="/about" className="text-[#778873] font-medium hover:text-[#A1BC98] transition-colors relative group">
                About
                <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-[#A1BC98] group-hover:w-full transition-all duration-300" />
              </a>

              {/* Blog Dropdown */}
              <DesktopDropdown label="Blog" dropdownId="blog" items={[
                { label: "All Articles", href: "/blog" },
                { label: "Travel Tips", href: "/blog/travel-tips" },
                { label: "Bali Guide", href: "/blog/bali-guide" },
                { label: "FAQ", href: "/faq" },
              ]} />
            </div>
          </div>

          {/* Center Logo/Text */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center h-full">
            <motion.div
              style={{ opacity: textOpacity, scale: textScale }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute"
            >
              <span
                className="text-4xl font-bold whitespace-nowrap"
                style={{ fontFamily: "'Knewave', cursive" }}
              >
                <span className="text-white">Stay</span>
                <span className="text-[#A1BC98]">in</span>
                <span className="text-white">UBUD</span>
              </span>
            </motion.div>
            <motion.div
              style={{ opacity: logoOpacity, scale: logoScale }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute"
            >
              <img src={logoImage} alt="StayinUBUD" className="h-[60px] object-contain" />
            </motion.div>
          </div>

          {/* Right Menu */}
          <div className="flex items-center gap-[32px]">
            <div className="flex gap-8 items-center">
              <a href="/offers" className="text-[#778873] font-medium hover:text-[#A1BC98] transition-colors relative group">
                Offers
                <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-[#A1BC98] group-hover:w-full transition-all duration-300" />
              </a>

              {/* Account Dropdown */}
              <DesktopDropdown label="Account" dropdownId="account" items={[
                { label: "My Bookings", href: "/my-bookings" },
                { label: "Profile", href: "/profile" },
                { label: "Settings", href: "/settings" },
              ]} alignRight />
            </div>

            {/* Book Now Button */}
            <Link
              to="/villas"
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#A1BC98] to-[#778873] text-white font-semibold hover:shadow-lg transition-shadow whitespace-nowrap"
            >
              <Calendar size={18} />
              Book Now
            </Link>
          </div>
        </nav>
      </header>
    );
  }

  // ============================================
  // MOBILE NAVBAR (<768px)
  // ============================================
  const isScrolled = scrollY > scrollEnd;
  const shouldShow = showMobileNav || scrollY < 50;

  return (
    <>
      <header
        className={cn(
          "fixed z-[1000] transition-all duration-300",
          shouldShow ? "opacity-100" : "opacity-0 pointer-events-none",
          isScrolled && shouldShow
            ? "top-0 left-0 right-0 w-[90%] max-w-[480px] mx-auto h-[70px] left-1/2 -translate-x-1/2 mt-[15px] rounded-[50px] bg-[rgba(241,243,224,0.95)] backdrop-blur-[15px] shadow-lg"
            : "top-0 left-0 right-0 w-full h-[70px] bg-transparent backdrop-blur-[10px]"
        )}
      >
        <nav className="h-full px-4 flex items-center justify-between">
          {/* Hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-black/10 rounded-lg transition-colors z-[1001]"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isMenuOpen ? <X size={24} className="text-[#778873]" /> : <Menu size={24} className="text-[#778873]" />}
            </motion.div>
          </button>

          {/* Center Logo/Text */}
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              style={{ opacity: textOpacity, scale: textScale }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute"
            >
              <span
                className="text-2xl font-bold whitespace-nowrap"
                style={{ fontFamily: "'Knewave', cursive" }}
              >
                <span className="text-white">Stay</span>
                <span className="text-[#A1BC98]">in</span>
                <span className="text-white">UBUD</span>
              </span>
            </motion.div>
            <motion.div
              style={{ opacity: logoOpacity, scale: logoScale }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute"
            >
              <img src={logoImage} alt="StayinUBUD" className="h-[40px] object-contain" />
            </motion.div>
          </div>

          {/* Search Icon */}
          <button className="p-2 hover:bg-black/10 rounded-lg transition-colors z-[1001]" aria-label="Search">
            <Search size={24} className="text-[#778873]" />
          </button>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={isMenuOpen ? { x: 0 } : { x: "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 right-0 w-full h-screen max-w-xs bg-white z-[999] shadow-2xl"
      >
        {/* Drawer Header - Fixed at top */}
        <div className="fixed top-0 right-0 w-full max-w-xs h-[100px] bg-white border-b border-[#F1F3E0] flex items-center justify-between px-6 z-[1000]">
          {/* Logo + Text at top */}
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="StayinUBUD" className="h-14" />
            <span className="text-lg font-bold" style={{ fontFamily: "'Knewave', cursive" }}>
              <span className="text-[#2d3a29]">Stay</span>
              <span className="text-[#A1BC98]">in</span>
              <span className="text-[#2d3a29]">UBUD</span>
            </span>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 hover:bg-[#F1F3E0] rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} className="text-[#778873]" />
          </button>
        </div>

        {/* Drawer Content - Scrollable below header */}
        <div className="mt-[100px] h-[calc(100vh-100px-80px)] overflow-y-auto px-0">
          {/* Menu Items */}
          <nav className="space-y-0">
            <a
              href="/villas"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center px-6 py-4 text-[#778873] font-medium border-b border-[#F1F3E0] hover:bg-[#F1F3E0] transition-colors"
            >
              All Villas
            </a>
            <a
              href="/about"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center px-6 py-4 text-[#778873] font-medium border-b border-[#F1F3E0] hover:bg-[#F1F3E0] transition-colors"
            >
              About
            </a>
            <a
              href="/blog"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center px-6 py-4 text-[#778873] font-medium border-b border-[#F1F3E0] hover:bg-[#F1F3E0] transition-colors"
            >
              Blog
            </a>
            <a
              href="/offers"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center px-6 py-4 text-[#778873] font-medium border-b border-[#F1F3E0] hover:bg-[#F1F3E0] transition-colors"
            >
              Offers
            </a>
            <a
              href="/gallery"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center px-6 py-4 text-[#778873] font-medium border-b border-[#F1F3E0] hover:bg-[#F1F3E0] transition-colors"
            >
              Gallery
            </a>
            <a
              href="/my-bookings"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center px-6 py-4 text-[#778873] font-medium border-b border-[#F1F3E0] hover:bg-[#F1F3E0] transition-colors"
            >
              My Bookings
            </a>
            <a
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center px-6 py-4 text-[#778873] font-medium hover:bg-[#F1F3E0] transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>

        {/* Drawer Footer - Fixed at bottom */}
        <div className="fixed bottom-0 right-0 w-full max-w-xs bg-white border-t border-[#F1F3E0] px-6 py-4 z-[1000]">
          <Link
            to="/villas"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#A1BC98] to-[#778873] text-white font-semibold hover:shadow-lg transition-shadow"
          >
            <Calendar size={18} />
            Book Now
          </Link>
        </div>
      </motion.div>
    </>
  );
};

// Desktop Dropdown Component
interface DropdownItem {
  label: string;
  href: string;
}

interface DesktopDropdownProps {
  label: string;
  dropdownId: string;
  items: DropdownItem[];
  alignRight?: boolean;
}

const DesktopDropdown = ({ label, dropdownId, items, alignRight }: DesktopDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="text-[#778873] font-medium hover:text-[#A1BC98] transition-colors relative group">
        {label}
        <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-[#A1BC98] group-hover:w-full transition-all duration-300" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "absolute top-full mt-2 w-48 bg-white rounded-lg shadow-lg p-2 z-[1001]",
              alignRight ? "right-0" : "left-0"
            )}
          >
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-4 py-2 hover:bg-[#F1F3E0] rounded text-[#778873]"
              >
                {item.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
