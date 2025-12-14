import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
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
            : "h-[100px] bg-transparent"
        )}
      >
        <nav className="h-full mx-auto px-8 max-w-7xl flex items-center justify-between relative">
          {/* Left Menu */}
          <div className="flex items-center gap-8">
            <a href="/" className={cn("font-medium transition-colors relative group", scrollY > scrollEnd ? "text-[#778873] hover:text-[#A1BC98]" : "text-white hover:text-[#A1BC98]")}>
              Home
              <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-[#A1BC98] group-hover:w-full transition-all duration-300" />
            </a>

            <a href="/villas" className={cn("font-medium transition-colors relative group", scrollY > scrollEnd ? "text-[#778873] hover:text-[#A1BC98]" : "text-white hover:text-[#A1BC98]")}>
              Our Villas
              <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-[#A1BC98] group-hover:w-full transition-all duration-300" />
            </a>

            <a href="/gallery" className={cn("font-medium transition-colors relative group", scrollY > scrollEnd ? "text-[#778873] hover:text-[#A1BC98]" : "text-white hover:text-[#A1BC98]")}>
              Gallery
              <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-[#A1BC98] group-hover:w-full transition-all duration-300" />
            </a>
          </div>

          {/* Center Logo/Text */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center h-full">
            <motion.div
              style={{
                opacity: textOpacity,
                scale: textScale,
                color: scrollY > scrollEnd ? "#2d3a29" : "white"
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute"
            >
              <span
                className="text-4xl font-bold whitespace-nowrap"
                style={{ fontFamily: "'Knewave', cursive" }}
              >
                <span>Stay</span>
                <span className="text-[#A1BC98]">in</span>
                <span>UBUD</span>
              </span>
            </motion.div>
            <motion.div
              style={{
                opacity: logoOpacity,
                scale: logoScale,
                height: scrollY > scrollEnd ? "50px" : "80px"
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute flex items-center"
            >
              <img src={logoImage} alt="StayinUBUD" className="object-contain h-full" />
            </motion.div>
          </div>

          {/* Right Menu */}
          <div className="flex items-center gap-8">
            <a href="/about" className={cn("font-medium transition-colors relative group", scrollY > scrollEnd ? "text-white hover:text-[#A1BC98]" : "text-[#778873] hover:text-[#A1BC98]")}>
              About Us
              <span className={cn("absolute bottom-[-4px] left-0 w-0 h-[2px] group-hover:w-full transition-all duration-300", scrollY > scrollEnd ? "bg-[#A1BC98]" : "bg-[#A1BC98]")} />
            </a>

            <a href="/contact" className={cn("font-medium transition-colors relative group", scrollY > scrollEnd ? "text-white hover:text-[#A1BC98]" : "text-[#778873] hover:text-[#A1BC98]")}>
              Contact
              <span className={cn("absolute bottom-[-4px] left-0 w-0 h-[2px] group-hover:w-full transition-all duration-300", scrollY > scrollEnd ? "bg-[#A1BC98]" : "bg-[#A1BC98]")} />
            </a>

            <a href="/blog" className={cn("font-medium transition-colors relative group", scrollY > scrollEnd ? "text-white hover:text-[#A1BC98]" : "text-[#778873] hover:text-[#A1BC98]")}>
              Blog
              <span className={cn("absolute bottom-[-4px] left-0 w-0 h-[2px] group-hover:w-full transition-all duration-300", scrollY > scrollEnd ? "bg-[#A1BC98]" : "bg-[#A1BC98]")} />
            </a>
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
            : "top-0 left-0 right-0 w-full h-[70px] bg-transparent"
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
              <img src={logoImage} alt="StayinUBUD" className="h-[50px] object-contain" />
            </motion.div>
          </div>
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[998]"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Dropdown - Floating from top */}
      <motion.div
        initial={{ y: "-100%", opacity: 0 }}
        animate={isMenuOpen ? { y: 0, opacity: 1 } : { y: "-100%", opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={cn(
          "fixed left-1/2 -translate-x-1/2 w-[90%] max-w-[480px] bg-[rgba(241,243,224,0.95)] backdrop-blur-[15px] rounded-[24px] shadow-lg z-[999] overflow-hidden transition-all duration-300",
          isScrolled && shouldShow
            ? "top-[100px]"
            : "top-[92px]"
        )}
      >
        {/* Menu Items */}
        <nav className="divide-y divide-[#F1F3E0]">
          <a
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center px-6 py-4 text-[#2d3a29] font-medium hover:bg-[#A1BC98]/15 transition-colors"
          >
            <span className="text-lg">Home</span>
          </a>
          <a
            href="/villas"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center px-6 py-4 text-[#2d3a29] font-medium hover:bg-[#A1BC98]/15 transition-colors"
          >
            <span className="text-lg">Our Villas</span>
          </a>
          <a
            href="/gallery"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center px-6 py-4 text-[#2d3a29] font-medium hover:bg-[#A1BC98]/15 transition-colors"
          >
            <span className="text-lg">Gallery</span>
          </a>
          <a
            href="/about"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center px-6 py-4 text-[#2d3a29] font-medium hover:bg-[#A1BC98]/15 transition-colors"
          >
            <span className="text-lg">About Us</span>
          </a>
          <a
            href="/blog"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center px-6 py-4 text-[#2d3a29] font-medium hover:bg-[#A1BC98]/15 transition-colors"
          >
            <span className="text-lg">Blog</span>
          </a>
        </nav>
      </motion.div>
    </>
  );
};

export default Navbar;
