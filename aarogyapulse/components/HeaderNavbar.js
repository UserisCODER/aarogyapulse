// components/HeaderNavbar.js
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeaderNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-3' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500/20 to-teal-400/10 border border-teal-500/30 flex items-center justify-center p-2 group-hover:border-teal-400 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-teal-400 stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18M3 12h18M8 8l8 8M16 8l-8 8" className="opacity-20" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" />
              <path d="M8 12h2l1.5-3 2.5 6 1.5-3h2.5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              AarogyaPulse
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping"></span>
            </span>
            <span className="text-[10px] text-teal-400/80 font-medium tracking-wider uppercase -mt-0.5">National Health Grid</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="#about" className="hover:text-white transition-colors duration-200">About</Link>
          <Link href="#features" className="hover:text-white transition-colors duration-200">Features</Link>
          <Link href="#ocr-timeline" className="hover:text-white transition-colors duration-200">OCR Pipeline</Link>
          <Link href="#faq" className="hover:text-white transition-colors duration-200">FAQ</Link>
          <Link href="#contact" className="hover:text-white transition-colors duration-200">Contact</Link>
        </nav>

        {/* Right Actions: Emergency SOS & Animated Stethoscope Graphic */}
        <div className="hidden sm:flex items-center gap-3">
          
          {/* Pulse Animated Stethoscope Icon */}
          <div className="relative w-9 h-9 flex items-center justify-center rounded-full bg-neutral-900/80 border border-white/10 hover:border-teal-400/50 transition-colors cursor-pointer group" title="ABHA Gateway Connected">
            <svg className="w-5 h-5 text-teal-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 4.5v5a7.5 7.5 0 0 0 15 0v-5" />
              <circle cx="4.5" cy="4.5" r="2" fill="currentColor" />
              <circle cx="19.5" cy="4.5" r="2" fill="currentColor" />
              <path d="M12 17v2a3 3 0 0 0 3 3h1" />
              <circle cx="18" cy="22" r="2" fill="currentColor" />
            </svg>
          </div>

          {/* Quick Emergency Button */}
          <a href="tel:108" className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg shadow-red-600/30 transition-all active:scale-95 border border-red-400/30 group">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span>🚨 Call Ambulance</span>
          </a>

          {/* Portal Login */}
          <Link href="/login" className="bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-xs font-medium px-4 py-2.5 rounded-full border border-white/10 transition-colors">
            Sign In
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu" 
          className="md:hidden text-gray-300 hover:text-white p-2 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 transition-all">
          <div className="flex flex-col gap-4 text-sm font-medium text-gray-300">
            <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1.5 flex items-center justify-between">
              <span>Home Section</span>
              <span className="text-xs text-teal-400">#01</span>
            </Link>
            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1.5 flex items-center justify-between">
              <span>OPD Queue & Routing</span>
              <span className="text-xs text-teal-400">#02</span>
            </Link>
            <Link href="#ocr-timeline" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1.5 flex items-center justify-between">
              <span>Know Your Doctor & Records</span>
              <span className="text-xs text-teal-400">#03</span>
            </Link>
            <Link href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1.5 flex items-center justify-between">
              <span>Grievance & FAQ</span>
              <span className="text-xs text-teal-400">#04</span>
            </Link>
            <Link href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-white py-1.5 flex items-center justify-between">
              <span>Health & Lab Reports (Profile)</span>
              <span className="text-xs text-teal-400">#05</span>
            </Link>
            <div className="pt-4 border-t border-white/10 flex items-center gap-3">
              <a href="tel:108" className="flex-1 text-center bg-red-600 hover:bg-red-500 text-white text-xs font-semibold py-2.5 rounded-full">
                🚨 Call Ambulance (108)
              </a>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center bg-[#1F1F22] text-white text-xs font-medium py-2.5 rounded-full border border-white/10">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}