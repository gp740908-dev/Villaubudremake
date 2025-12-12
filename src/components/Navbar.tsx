'use client'

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Globe, Phone, Mail, Instagram, Facebook, Menu, X } from "lucide-react"
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

  const isHomePage = location.pathname === "/"

  useEffect(() => {
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
      setIsMobile(window.innerWidth < 1024) // Changed to 1024 to match tailwind lg breakpoint
    }

    handleResize()
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [isMobile])

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

  const navLinkClasses = (isTransparent: boolean) =>
    cn(
      "relative text-[15px] font-medium tracking-[0.5px] transition-colors duration-300",
      "after:absolute after:bottom-[-4px] after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[2px] after:bg-[#A1BC98] after:transition-all after:duration-300",
      "hover:after:w-full",
      isTransparent
        ? "text-white/90 hover:text-white drop-shadow-sm"
        : "text-[#778873] hover:text-[#2d3a29]",
    )

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[1001] focus:px-4 focus:py-2 focus:bg-[#A1BC98] focus:text-white focus:rounded-lg focus:outline-none"
      >
        Skip to content
      </a>

      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ease-in-out",
          isScrolled || isOpen
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : isHomePage
              ? "bg-transparent"
              : "bg-white/95 backdrop-blur-md shadow-sm",
          isScrolled ? "py-2" : "py-4 lg:py-6",
        )}
      >
        <nav className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl" role="navigation" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            {/* Logo for Desktop */}
            <div className="hidden lg:flex flex-1 justify-start">
              <Link to="/" className="flex items-center gap-2">
                 <img src={logoImage} alt="StayinUBUD Logo" className="h-12" />
                 <span className={cn("font-semibold text-xl tracking-tight", isHomePage && !isScrolled ? 'text-white' : 'text-[#2d3a29]')}>StayinUBUD</span>
              </Link>
            </div>

            {/* Logo for Mobile/Tablet */}
             <div className="flex-1 lg:hidden">
                 <Link to="/" className="flex items-center gap-2">
                     <img src={logoImage} alt="StayinUBUD Logo" className="h-10" />
                 </Link>
             </div>


            {/* Desktop & Tablet Navigation */}
            <div className="hidden lg:flex flex-1 justify-center items-center gap-8">
              {allNavLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={cn(navLinkClasses(isHomePage && !isScrolled), isActiveLink(link.href) && "text-[#A1BC98] after:w-full")}
                  >
                    {link.name}
                  </Link>
              ))}
            </div>

            {/* Right side controls */}
            <div className="hidden lg:flex flex-1 justify-end items-center gap-4">
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
                 <Link
                    to="/villas"
                    className="px-5 py-2.5 bg-gradient-to-r from-[#A1BC98] to-[#778873] text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                    > Book Now </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                  "p-2 rounded-md transition-colors duration-300",
                   isHomePage && !isScrolled && !isOpen
                    ? "text-white hover:bg-white/20"
                    : "text-[#2d3a29] hover:bg-gray-100",
                )}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[999] bg-black/30 backdrop-blur-sm lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsOpen(false)}
      />
      
      {/* Mobile Menu Panel */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-[1000] lg:hidden transition-transform duration-300 ease-in-out",
          isOpen ? "transform translate-x-0" : "transform -translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
                 <Link to="/" className="flex items-center gap-2">
                     <img src={logoImage} alt="StayinUBUD Logo" className="h-10" />
                      <span className="font-semibold text-lg text-[#2d3a29]">StayinUBUD</span>
                 </Link>
            </div>

            <nav className="flex-grow p-4">
              <ul className="space-y-2">
                {allNavLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block w-full text-left px-4 py-3 rounded-lg text-lg font-medium transition-colors",
                        isActiveLink(link.href)
                          ? "bg-[#F1F3E0] text-[#2d3a29]"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                      )}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

             <div className="p-4 space-y-4 border-t border-gray-200">
                <button
                    onClick={() => setLanguage(language === "EN" ? "ID" : "EN")}
                    className="flex items-center gap-2 text-gray-600 font-medium w-full text-left p-2 rounded-lg hover:bg-gray-100"
                    >
                    <Globe size={18} />
                    {language === "EN" ? "Switch to Bahasa Indonesia" : "Switch to English"}
                </button>

                 <div className="flex gap-2">
                    <a href="https://instagram.com/stayinubud" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-[#A1BC98] hover:text-white transition-colors">
                        <Instagram size={20} />
                    </a>
                    <a href="https://facebook.com/stayinubud" target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-[#A1BC98] hover:text-white transition-colors">
                        <Facebook size={20} />
                    </a>
                 </div>
             </div>

            <div className="p-4">
                <Link
                to="/villas"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-full py-3.5 bg-gradient-to-r from-[#A1BC98] to-[#778873] text-white text-base font-semibold uppercase tracking-wide rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                Book Your Stay
                </Link>
            </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
