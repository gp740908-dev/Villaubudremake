import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Search, Home, ArrowRight, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F1F3E0] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Illustration */}
          <div className="relative mb-8">
            <div className="w-64 h-64 mx-auto relative">
              {/* Stylized palm trees */}
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Background circle */}
                <circle cx="100" cy="100" r="90" fill="#D2DCB6" opacity="0.5" />

                {/* Palm tree 1 */}
                <path d="M80 180 L85 100" stroke="#778873" strokeWidth="6" />
                <ellipse cx="85" cy="90" rx="30" ry="15" fill="#A1BC98" transform="rotate(-30 85 90)" />
                <ellipse cx="75" cy="85" rx="25" ry="12" fill="#778873" transform="rotate(20 75 85)" />
                <ellipse cx="95" cy="88" rx="28" ry="13" fill="#A1BC98" transform="rotate(-50 95 88)" />

                {/* Palm tree 2 */}
                <path d="M130 180 L125 110" stroke="#778873" strokeWidth="5" />
                <ellipse cx="125" cy="100" rx="25" ry="12" fill="#A1BC98" transform="rotate(30 125 100)" />
                <ellipse cx="115" cy="97" rx="22" ry="10" fill="#778873" transform="rotate(-20 115 97)" />
                <ellipse cx="135" cy="98" rx="24" ry="11" fill="#A1BC98" transform="rotate(50 135 98)" />

                {/* Question mark traveler */}
                <circle cx="100" cy="140" r="20" fill="#F1F3E0" stroke="#2d3a29" strokeWidth="3" />
                <text x="100" y="148" textAnchor="middle" fontSize="20" fill="#778873" fontWeight="bold">?</text>

                {/* Map/compass icon */}
                <circle cx="60" cy="150" r="12" fill="#778873" opacity="0.6" />
                <path d="M60 142 L60 158 M52 150 L68 150" stroke="white" strokeWidth="2" />
              </svg>
            </div>

            {/* Logo */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
              <MapPin size={32} className="text-[#778873]" />
            </div>
          </div>

          {/* Text Content */}
          <h1 className="text-6xl font-serif font-bold text-[#2d3a29] mb-4">404</h1>
          <h2 className="text-2xl font-serif font-semibold text-[#778873] mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-[#6b7c67] mb-8 max-w-md mx-auto">
            It looks like you've wandered off the path. The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7c67]" />
            <input
              type="text"
              placeholder="Search our site..."
              className="w-full pl-12 pr-4 py-4 rounded-full border border-[#d4dbc8] bg-white focus:outline-none focus:border-[#A1BC98] shadow-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#778873] text-white font-semibold rounded-full hover:bg-[#2d3a29] transition-colors"
            >
              <Home size={18} />
              Return to Homepage
            </Link>
            <Link
              to="/villas"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-[#778873] font-semibold rounded-full border-2 border-[#778873] hover:bg-[#778873] hover:text-white transition-colors"
            >
              Browse Our Villas
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-[#d4dbc8]">
            <p className="text-sm text-[#6b7c67] mb-4">Or try these popular pages:</p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: 'About Us', path: '/about' },
                { label: 'Gallery', path: '/gallery' },
                { label: 'Blog', path: '/blog' },
                { label: 'Contact', path: '/contact' },
                { label: 'FAQ', path: '/faq' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-[#778873] hover:text-[#2d3a29] hover:underline transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
