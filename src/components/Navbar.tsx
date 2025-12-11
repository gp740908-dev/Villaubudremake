"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Globe, Phone, Mail, Instagram, Facebook } from "lucide-react"
import { cn } from "@/lib/utils"
import logoImage from "@/assets/logo.png"

const leftNavLinks = [
  { name: "Home", href: "/" },
  { name: "Our Villas", href: "/villas" },
  { name: "About", href: "/about" },
]

const rightNavLinks = [
  { name: "Gallery", href: "/gallery" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
]

const allNavLinks = [...leftNavLinks, ...rightNavLinks]

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [language, setLanguage] = useState<"EN" | "ID">("EN")
  const location = useLocation()

  // Check if we're on the homepage (has hero image)
  const isHomePage = location.pathname === "/"

  useEffect(() => {
    // Throttled scroll handler
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const threshold = isMobile ? 100 : 50
          setIsScrolled(window.scrollY > threshold)
          ticking = false
        })
        ticking = true
      }
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [isMobile])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const isActiveLink = (href: string) => {
    if (href === "/") return location.pathname === "/"
    return location.pathname.startsWith(href)
  }

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[1001] focus:px-4 focus:py-2 focus:bg-[#A1BC98] focus:text-white focus:rounded-lg focus:outline-none"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed transition-all duration-500 ease-out",
          isOpen ? "z-[1001]" : "z-[1000]",
          // Mobile floating styles - disabled when menu is open
          isMobile && isScrolled && !isOpen
            ? "top-3 left-[4%] right-[4%] w-[92%] rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] animate-slideDownFloat"
            : "top-0 left-0 right-0 w-full",
          isMobile && isOpen && "top-0 left-0 right-0 w-full rounded-none",
          // Background styles
          isScrolled || isOpen
            ? "bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
            : isHomePage
              ? "bg-transparent"
              : "bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)]",
          // Padding - increased to accommodate larger logo
          isScrolled ? "py-4 md:py-6" : "py-6 md:py-10",
          "overflow-visible",
        )}
        style={{
          willChange: "transform, opacity, padding",
        }}
      >
        <nav className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl" role="navigation" aria-label="Main navigation">
          {/* Desktop Layout (1024px+) */}
          <div className="hidden lg:flex items-center justify-between relative">
            {/* Left Navigation */}
            <div className="flex items-center gap-8 flex-1 justify-end pr-24">
              {leftNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "relative text-[15px] font-medium tracking-[0.5px] transition-colors duration-300",
                    "after:absolute after:bottom-[-4px] after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-[#A1BC98] after:transition-all after:duration-300",
                    "hover:after:w-full",
                    isHomePage && !isScrolled
                      ? "text-white/90 hover:text-white drop-shadow-sm"
                      : "text-[#778873] hover:text-[#2d3a29]",
                    isActiveLink(link.href) && "after:w-full text-[#A1BC98]",
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Center Logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 group flex items-center justify-center">
              <span
                className={cn(
                  "text-[28px] absolute whitespace-nowrap transition-all duration-500",
                  isScrolled
                    ? "opacity-0 scale-90"
                    : isHomePage
                      ? "opacity-100 scale-100 text-white drop-shadow-md"
                      : "opacity-100 scale-100 text-[#778873]",
                  "group-hover:scale-105",
                )}
                style={{ fontFamily: "'Knewave', cursive" }}
              >
                Stay<span className="text-[#A1BC98]">in</span>UBUD
              </span>
              <img
                src={logoImage || "/placeholder.svg"}
                alt="StayinUBUD"
                className={cn(
                  "transition-all duration-500 h-32",
                  isScrolled ? "opacity-100 scale-100" : "opacity-0 scale-90",
                  "group-hover:scale-105",
                )}
              />
            </Link>

            {/* Right Navigation */}
            <div className="flex items-center gap-8 flex-1 justify-start pl-24">
              {rightNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "relative text-[15px] font-medium tracking-[0.5px] transition-colors duration-300",
                    "after:absolute after:bottom-[-4px] after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-[#A1BC98] after:transition-all after:duration-300",
                    "hover:after:w-full",
                    isHomePage && !isScrolled
                      ? "text-white/90 hover:text-white drop-shadow-sm"
                      : "text-[#778873] hover:text-[#2d3a29]",
                    isActiveLink(link.href) && "after:w-full text-[#A1BC98]",
                  )}
                >
                  {link.name}
                </Link>
              ))}

              {/* Language Selector */}
              <button
                onClick={() => setLanguage(language === "EN" ? "ID" : "EN")}
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors duration-300",
                  isHomePage && !isScrolled ? "text-white/90 hover:text-white" : "text-[#778873] hover:text-[#2d3a29]",
                )}
              >
                <Globe size={16} />
                {language}
              </button>
            </div>
          </div>

          {/* Tablet Layout (768px - 1023px) */}
          <div className="hidden md:flex lg:hidden items-center justify-between relative">
            {/* Left Navigation */}
            <div className="flex items-center gap-6 flex-1 justify-end pr-8">
              {leftNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "relative text-[14px] font-medium tracking-[0.5px] transition-colors duration-300",
                    "after:absolute after:bottom-[-4px] after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-[#A1BC98] after:transition-all after:duration-300",
                    "hover:after:w-full",
                    isHomePage && !isScrolled
                      ? "text-white/90 hover:text-white drop-shadow-sm"
                      : "text-[#778873] hover:text-[#2d3a29]",
                    isActiveLink(link.href) && "after:w-full text-[#A1BC98]",
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Center Logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
              <span
                className={cn(
                  "text-[22px] absolute whitespace-nowrap transition-all duration-500",
                  isScrolled
                    ? "opacity-0 scale-90"
                    : isHomePage
                      ? "opacity-100 scale-100 text-white drop-shadow-md"
                      : "opacity-100 scale-100 text-[#778873]",
                )}
                style={{ fontFamily: "'Knewave', cursive" }}
              >
                Stay<span className="text-[#A1BC98]">in</span>UBUD
              </span>
              <img
                src={logoImage || "/placeholder.svg"}
                alt="StayinUBUD"
                className={cn(
                  "h-28 transition-all duration-500",
                  isScrolled ? "opacity-100 scale-100" : "opacity-0 scale-90",
                )}
              />
            </Link>

            {/* Right Navigation */}
            <div className="flex items-center gap-6 flex-1 justify-start pl-8">
              {rightNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "relative text-[14px] font-medium tracking-[0.5px] transition-colors duration-300",
                    "after:absolute after:bottom-[-4px] after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-[#A1BC98] after:transition-all after:duration-300",
                    "hover:after:w-full",
                    isHomePage && !isScrolled
                      ? "text-white/90 hover:text-white drop-shadow-sm"
                      : "text-[#778873] hover:text-[#2d3a29]",
                    isActiveLink(link.href) && "after:w-full text-[#A1BC98]",
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Layout (< 768px) */}
          <div className="flex md:hidden items-center justify-between">
            {/* Hamburger Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "p-2 rounded-lg transition-colors duration-300 min-w-[48px] min-h-[48px] flex items-center justify-center",
                isOpen
                  ? "text-[#778873] hover:bg-[#F1F3E0]"
                  : isHomePage && !isScrolled
                    ? "text-white hover:bg-white/20"
                    : "text-[#778873] hover:bg-[#F1F3E0]",
              )}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              <div className="relative w-6 h-6">
                <span
                  className={cn(
                    "absolute left-0 w-6 h-0.5 bg-current transition-all duration-300",
                    isOpen ? "top-[11px] rotate-45" : "top-1",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-[11px] w-6 h-0.5 bg-current transition-all duration-300",
                    isOpen && "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 w-6 h-0.5 bg-current transition-all duration-300",
                    isOpen ? "top-[11px] -rotate-45" : "top-[19px]",
                  )}
                />
              </div>
            </button>

            {/* Center Logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
              <span
                className={cn(
                  "text-[18px] absolute whitespace-nowrap transition-all duration-500",
                  isScrolled || isOpen
                    ? "opacity-0 scale-90"
                    : isHomePage
                      ? "opacity-100 scale-100 text-white drop-shadow-md"
                      : "opacity-100 scale-100 text-[#778873]",
                )}
                style={{ fontFamily: "'Knewave', cursive" }}
              >
                Stay<span className="text-[#A1BC98]">in</span>UBUD
              </span>
              <img
                src={logoImage || "/placeholder.svg"}
                alt="StayinUBUD"
                className={cn(
                  "h-20 transition-all duration-500",
                  isScrolled || isOpen ? "opacity-100 scale-100" : "opacity-0 scale-90",
                )}
              />
            </Link>

            <div className="w-[48px]" />
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[1000] transition-all duration-400 md:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

        {/* Menu Drawer */}
        <div
          className={cn(
            "absolute top-0 left-0 w-[85%] max-w-[320px] h-full bg-gradient-to-b from-[#F1F3E0] to-[#D2DCB6] shadow-2xl transition-transform duration-400 ease-out pt-24",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {/* Navigation Links */}
          <nav className="py-6 px-4">
            <ul className="space-y-1">
              {allNavLinks.map((link, index) => (
                <li
                  key={link.name}
                  style={{
                    animationDelay: isOpen ? `${index * 0.08}s` : "0s",
                  }}
                  className={cn(isOpen && "animate-slideInLeft")}
                >
                  <Link
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center h-[56px] px-4 rounded-xl text-[20px] font-serif transition-all duration-300",
                      isActiveLink(link.href)
                        ? "bg-[#A1BC98]/20 text-[#778873]"
                        : "text-[#778873] hover:bg-[#A1BC98]/10",
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Language Toggle */}
          <div className="px-6 py-4 border-t border-[#A1BC98]/30">
            <button
              onClick={() => setLanguage(language === "EN" ? "ID" : "EN")}
              className="flex items-center gap-2 text-[#778873] font-medium"
            >
              <Globe size={18} />
              {language === "EN" ? "English" : "Bahasa Indonesia"}
            </button>
          </div>

          {/* Contact Info */}
          <div className="px-6 py-4 space-y-3">
            <a href="tel:+623611234567" className="flex items-center gap-3 text-[#778873] text-sm">
              <Phone size={16} />
              +62 361 123 4567
            </a>
            <a href="mailto:hello@stayinubud.com" className="flex items-center gap-3 text-[#778873] text-sm">
              <Mail size={16} />
              hello@stayinubud.com
            </a>
          </div>

          {/* Social Icons */}
          <div className="px-6 py-4 flex gap-3">
            <a
              href="https://instagram.com/stayinubud"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center bg-white/50 rounded-full text-[#778873] hover:bg-[#A1BC98] hover:text-white transition-colors"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://facebook.com/stayinubud"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center bg-white/50 rounded-full text-[#778873] hover:bg-[#A1BC98] hover:text-white transition-colors"
            >
              <Facebook size={18} />
            </a>
          </div>

          {/* Book Now CTA */}
          <div className="absolute bottom-8 left-4 right-4">
            <Link
              to="/villas"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-full py-4 bg-gradient-to-r from-[#A1BC98] to-[#778873] text-white text-[15px] font-semibold uppercase tracking-[1px] rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Book Your Stay
            </Link>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideDownFloat {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slideDownFloat {
          animation: slideDownFloat 0.5s ease-out forwards;
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.4s ease-out forwards;
        }
      `}</style>
    </>
  )
}

export default Navbar
              
