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
  const DesktopNavbar = () => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
              <div
                className="relative group"
                onMouseEnter={() => setOpenDropdown("villas")}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="text-[#778873] font-medium hover:text-[#A1BC98] transition-colors relative group">
                  Villas
                  <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-[#A1BC98] group-hover:w-full transition-all duration-300" />
                </button>
                <AnimatePresence>
                  {openDropdown === "villas" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg p-2 z-[1001]"
                    >
                      <a href="/villas" className="block px-4 py-2 hover:bg-[#F1F3E0] rounded text-[#778873]">
                        All Villas
                      </a>
                      <a href="/villas?type=luxury" className="block px-4 py-2 hover:bg-[#F1F3E0] rounded text-[#778873]">
                        Luxury Villas
                      </a>
                      <a href="/villas?type=budget" className="block px-4 py-2 hover:bg-[#F1F3E0] rounded text-[#778873]">
                        Budget Villas
                      </a>
                      <a href="/villas?location=ubud" className="block px-4 py-2 hover:bg-[#F1F3E0] rounded text-[#778873]">
                        Ubud Villas
                      </a>
                      <a href="/villas?amenity=pool" className="block px-4 py-2 hover:bg-[#F1F3E0] rounded text-[#778873]">
                        With Pool
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <a href="/about" className="text-[#778873] font-medium hover:text-[#A1BC98] transition-colors relative group">
                About
                <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-[#A1BC98] group-hover:w-full transition-all duration-300" />
              </a>

              {/* Blog Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setOpenDropdown("blog")}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="text-[#778873] font-medium hover:text-[#A1BC98] transition-colors relative group">
                  Blog
                  <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-[#A1BC98] group-hover:w-full transition-all duration-300" />
                </button>
                <AnimatePresence>
                  {openDropdown === "blog" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg p-2 z-[1001]"
                    >
                      <a href="/blog" className="block px-4 py-2 hover:bg-[#F1F3E0] rounded text-[#778873]">
                        All Articles
                      </a>
                      <a href="/blog/travel-tips" className="block px-4 py-2 hover:bg-[#F1F3E0] rounded text-[#778873]">
                        Travel Tips
                      </a>
                      <a href="/blog/bali-guide" className="block px-4 py-2 hover:bg-[#F1F3E0] rounded text-[#778873]">
                        Bali Guide
                      </a>
                      <a href="/faq" className="block px-4 py-2 hover:bg-[#F1F3E0] rounded text-[#778873]">
                        FAQ
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
                className="text-4xl font-bold bg-gradient-to-r from-[#A1BC98] to-[#778873] bg-clip-text text-transparent whitespace-nowrap"
                style={{ fontFamily: "'Knewave', cursive" }}
              >
                StayinUBUD
              </span>
            </motion.div>
            <motion.div
              style={{ opacity: logoOpacity, scale: logoScale }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute"
            >
              <img src={logoImage} alt="StayinUBUD" className="h-[45px] object-contain" />
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
              <div
                className="relative group"
                onMouseEnter={() => setOpenDropdown("account")}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="text-[#778873] font-medium hover:text-[#A1BC98] transition-colors relative group">
                  Account
                  <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-[#A1BC98] group-hover:w-full transition-all duration-300" />
                </button>
                <AnimatePresence>
                  {openDropdown === "account" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg p-2 z-[1001]"
                    >
                      <a href="/my-bookings" className="block px-4 py-2 hover:bg-[#F1F3E0] rounded text-[#778873]">
                        My Bookings
                      </a>
                      <a href="/profile" className="block px-4 py-2 hover:bg-[#F1F3E0] rounded text-[#778873]">
                        Profile
                      </a>
                      <a href="/settings" className="block px-4 py-2 hover:bg-[#F1F3E0] rounded text-[#778873]">
                        Settings
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
  };

  // ============================================
  // MOBILE NAVBAR (<768px)
  // ============================================
  const MobileNavbar = () => {
    const isScrolled = scrollY > scrollEnd;
    const shouldShow = showMobileNav || scrollY < 50;

    return (
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
            className="p-2 hover:bg-black/5 rounded-lg transition-colors"
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
                className="text-2xl font-bold text-[#778873] whitespace-nowrap"
                style={{ fontFamily: "'Knewave', cursive" }}
              >
                StayinUBUD
              </span>
            </motion.div>
            <motion.div
              style={{ opacity: logoOpacity, scale: logoScale }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute"
            >
              <img src={logoImage} alt="StayinUBUD" className="h-[32px] object-contain" />
            </motion.div>
          </div>

          {/* Search Icon */}
          <button className="p-2 hover:bg-black/5 rounded-lg transition-colors">
            <Search size={24} className="text-[#778873]" />
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-[70px] bg-black/30 backdrop-blur-sm z-[999] md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: "100%" }}
        animate={isMenuOpen ? { x: 0 } : { x: "100%" }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 right-0 w-full h-full max-w-xs bg-white z-[999] md:hidden shadow-xl"
      >
        <div className="pt-24 px-6">
          {/* Logo + Text at top */}
          <div className="flex items-center gap-3 mb-8">
            <img src={logoImage} alt="StayinUBUD" className="h-12" />
            <span className="text-xl font-bold text-[#778873]" style={{ fontFamily: "'Knewave', cursive" }}>
              StayinUBUD
            </span>
          </div>

          {/* Menu Items */}
          <nav className="space-y-4">
            <a href="/villas" className="block text-[#778873] font-medium py-2 border-b border-[#F1F3E0]">
              All Villas
            </a>
            <a href="/about" className="block text-[#778873] font-medium py-2 border-b border-[#F1F3E0]">
              About
            </a>
            <a href="/blog" className="block text-[#778873] font-medium py-2 border-b border-[#F1F3E0]">
              Blog
            </a>
            <a href="/offers" className="block text-[#778873] font-medium py-2 border-b border-[#F1F3E0]">
              Offers
            </a>
            <a href="/my-bookings" className="block text-[#778873] font-medium py-2 border-b border-[#F1F3E0]">
              My Bookings
            </a>
            <a href="/gallery" className="block text-[#778873] font-medium py-2 border-b border-[#F1F3E0]">
              Gallery
            </a>
            <a href="/contact" className="block text-[#778873] font-medium py-2 border-b border-[#F1F3E0]">
              Contact
            </a>
          </nav>

          {/* Book Button */}
          <Link
            to="/villas"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full mt-8 px-6 py-3 rounded-lg bg-gradient-to-r from-[#A1BC98] to-[#778873] text-white font-semibold"
          >
            <Calendar size={18} />
            Book Now
          </Link>
        </div>
      </motion.div>
    );
  };

  // Render appropriate navbar
  if (isMobile) {
    return <MobileNavbar />;
  }

  return <DesktopNavbar />;
};

export default Navbar;