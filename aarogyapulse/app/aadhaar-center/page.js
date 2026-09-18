'use client';
import React, { useState, useEffect, useRef } from 'react';

// Custom Scroll-Reveal Animation Wrapper Component
function FadeInUp({ children, delay = 0, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      });
    }, { threshold: 0.1 });

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => currentRef && observer.unobserve(currentRef);
  }, []);

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Custom Stroke-Based SVG Logo mimicking Untitled UI style
function PletyLogo() {
  return (
    <div className="flex items-center gap-2 cursor-pointer">
      <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className="text-white font-semibold text-lg tracking-tight">AarogyaPulse</span>
    </div>
  );
}

export default function AarogyaPulseLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // FAQ State data tailored for AarogyaPulse
  const faqs = [
    { q: "How is my medical data secured?", a: "All medical data is protected via strict consent-window enforcement and end-to-end encryption. Only authorized doctors with explicit 60-minute active consent can view records." },
    { q: "Do patients need to download a separate mobile app?", a: "No. AarogyaPulse is designed for zero extra citizen friction. Health IDs are created directly at trusted Aadhaar centers or hospital counters where you already are." },
    { q: "How does the paper prescription OCR work?", a: "Old physical paper slips scanned at hospital records counters instantly pass through an advanced OCR and NLP pipeline to build a structured, dated digital medical timeline." },
    { q: "Can doctors access my history across different states?", a: "Yes. Because records are securely linked to national digital rails, your complete medical history travels with you seamlessly across facilities and states." },
    { q: "What is the 'Know Your Disease' feature?", a: "It is an intelligent symptom checker where patients can type symptoms in plain natural language to get instant preliminary health insights and department routing." }
  ];

  useEffect(() => {
    // Smooth scrolling global behavior implementation
    document.documentElement.style.scrollBehavior = 'smooth';
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-teal-500 selection:text-black">
      
      {/* 1. Navigation Bar (Sticky & Responsive) */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10 py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div onClick={() => scrollToSection('about')}>
            <PletyLogo />
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">
            <button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">About</button>
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">FAQ</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">Contact</button>
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:block">
            <button 
              onClick={() => scrollToSection('features')}
              className="bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-sm font-medium px-5 py-2.5 rounded-full border border-white/5 transition-all shadow-lg hover:border-white/20"
            >
              Get started
            </button>
          </div>

          {/* Mobile Hamburger Icon */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white focus:outline-none p-2"
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
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 px-6 py-6 flex flex-col space-y-4">
            <button onClick={() => scrollToSection('about')} className="text-left text-sm text-gray-300 hover:text-white py-2">About</button>
            <button onClick={() => scrollToSection('features')} className="text-left text-sm text-gray-300 hover:text-white py-2">Features</button>
            <button onClick={() => scrollToSection('faq')} className="text-left text-sm text-gray-300 hover:text-white py-2">FAQ</button>
            <button onClick={() => scrollToSection('contact')} className="text-left text-sm text-gray-300 hover:text-white py-2">Contact</button>
            <button 
              onClick={() => scrollToSection('features')}
              className="bg-white text-black font-medium py-3 rounded-full text-center text-sm w-full mt-2"
            >
              Get started
            </button>
          </div>
        )}
      </nav>

      {/* 2. Hero Section (id="about") */}
      <section id="about" className="min-h-screen flex flex-col items-center justify-center pt-32 pb-20 relative z-0 overflow-hidden">
        {/* Background Video */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute -z-10 inset-0 object-cover min-w-full min-h-full opacity-90 pointer-events-none"
        >
          <source src="https://cdn.sceneai.art/Hero%20Section%20Video/50b4f304-cdca-4e12-8735-580d225834be.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black -z-10 pointer-events-none" />

        <FadeInUp className="flex flex-col items-center px-6 max-w-5xl mx-auto text-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 mb-8 backdrop-blur-sm">
            <span>✨ Announcing AarogyaPulse v2.0</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-6 text-white max-w-4xl">
            The intelligent layer for clear health <span className="font-serif italic font-normal text-teal-400">decisions.</span>
          </h1>

          {/* Subtext */}
          <p className="text-[16px] text-gray-400 max-w-2xl text-center mb-10 leading-relaxed">
            Our platform integrates seamlessly into national health rails to deliver real-time understanding, instant OCR record digitisation, and secure patient records.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <button 
              onClick={() => scrollToSection('features')}
              className="bg-white hover:bg-gray-100 text-black font-medium px-8 py-3.5 rounded-full transition-all text-sm w-full sm:w-auto shadow-xl"
            >
              Get started
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="bg-[#1F1F22] hover:bg-[#2A2A2D] text-white font-medium px-8 py-3.5 rounded-full border border-white/5 transition-all text-sm w-full sm:w-auto"
            >
              Learn more
            </button>
          </div>
        </FadeInUp>

        {/* Marquee Section */}
        <div className="w-full mt-24">
          <p className="text-sm text-gray-500 font-medium mb-8 text-center">Trusted by leading hospitals, health ministries & tech innovators</p>
          
          <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
            <div className="flex w-max animate-[marquee_30s_linear_infinite]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-16 px-8 flex-shrink-0">
                  <div className="flex items-center gap-2 text-gray-400 font-semibold text-lg tracking-wider">
                    <span className="w-3 h-3 rounded-full bg-teal-500"></span> Springfield
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 font-semibold text-lg tracking-wider">
                    <span className="w-3 h-3 rounded-full bg-cyan-500"></span> Orbitc
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 font-semibold text-lg tracking-wider">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span> CloudMed
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 font-semibold text-lg tracking-wider">
                    <span className="w-3 h-3 rounded-full bg-indigo-500"></span> AmsterHealth
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 font-semibold text-lg tracking-wider">
                    <span className="w-3 h-3 rounded-full bg-teal-400"></span> NexusCare
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Feature 1: AI Chat & Symptom Assistant (id="features") */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <FadeInUp>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Text */}
            <div className="flex flex-col items-start">
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">✨ Know Your Disease & AI Chat</span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-white leading-tight">
                Where speed meets intelligent diagnosis.
              </h2>
              <p className="text-gray-400 text-base leading-relaxed mb-8">
                An advanced conversational assistant that understands patient symptoms in plain language, analyzes preliminary conditions instantly, and routes patients to the correct hospital department without delay.
              </p>
              <button 
                onClick={() => scrollToSection('contact')}
                className="bg-white text-black font-medium px-6 py-3 rounded-full text-sm hover:bg-gray-100 transition-colors"
              >
                Get started
              </button>
            </div>

            {/* Right Mockup */}
            <div className="rounded-3xl overflow-hidden p-8 border border-white/10 relative min-h-[420px] flex items-center justify-center bg-black/40">
              <video 
                autoPlay 
                muted 
                loop 
                playsInline
                className="absolute inset-0 object-cover w-full h-full opacity-40 pointer-events-none"
              >
                <source src="https://cdn.sceneai.art/Hero%20Section%20Video/1bcc8fa3-37f6-4c53-8591-0347e4c7f8ac.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />

              {/* Floating UI Element Card */}
              <div className="relative z-10 w-full max-w-md bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">Symptom Checker</span>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-gray-300 border border-white/10">OPD Routing</span>
                </div>
                <div className="bg-black/40 rounded-xl p-3.5 border border-white/5 mb-4 text-sm text-gray-300">
                  <p className="text-teal-400 font-medium mb-1">AI Assistant:</p>
                  <p className="text-xs text-gray-400">"Mild fever and body ache for 2 days. Recommended department: General Medicine. Shall I book your queue token?"</p>
                </div>
                <div className="flex items-center justify-between bg-black/60 rounded-xl px-4 py-3 border border-white/5 text-sm text-gray-400">
                  <span>Describe your symptoms here...</span>
                  <div className="flex items-center gap-2 text-teal-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeInUp>
      </section>

      {/* 4. Feature 2: AI Transcription & OCR Records */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <FadeInUp>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Mockup */}
            <div className="rounded-3xl overflow-hidden p-8 border border-white/10 relative min-h-[420px] flex items-center justify-center bg-black/40 order-2 lg:order-1">
              <video 
                autoPlay 
                muted 
                loop 
                playsInline
                className="absolute inset-0 object-cover w-full h-full opacity-40 pointer-events-none"
              >
                <source src="https://cdn.sceneai.art/Hero%20Section%20Video/736fd4a0-70ac-4f44-9633-55769ead6aca.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />

              {/* Floating UI Element Card */}
              <div className="relative z-10 w-full max-w-md bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-xs">▶</div>
                    <div>
                      <p className="text-xs font-semibold text-white">11:06 AM – Dr. Sharma Consultation</p>
                      <p className="text-[10px] text-gray-400">OCR prescription auto-scanned</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Verified</span>
                </div>
                {/* Waveform graphic */}
                <div className="flex items-center gap-1 justify-center h-8 my-3 bg-black/40 rounded-lg px-3">
                  {[40, 60, 30, 80, 100, 60, 40, 70, 90, 50, 30, 70, 90, 40, 60, 30].map((h, i) => (
                    <div key={i} style={{ height: `${h}%` }} className="w-1 bg-teal-400 rounded-full"></div>
                  ))}
                </div>
                <p className="text-xs text-gray-300 italic bg-black/30 p-2.5 rounded-lg border border-white/5">
                  "Diagnosis: Acute Bronchitis. Prescribed Azithromycin 500mg once daily for 3 days. Vital signs recorded: BP 120/80."
                </p>
              </div>
            </div>

            {/* Right Text */}
            <div className="flex flex-col items-start order-1 lg:order-2">
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">✨ AI Transcription & OCR</span>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-white leading-tight">
                Turn paper prescriptions & voice into structured records.
              </h2>
              <p className="text-gray-400 text-base leading-relaxed mb-8">
                Automatically convert old physical hospital paper slips into a permanent, chronological digital health timeline using advanced OCR and NLP pipelines. Zero typing required.
              </p>
              <button 
                onClick={() => scrollToSection('contact')}
                className="bg-white text-black font-medium px-6 py-3 rounded-full text-sm hover:bg-gray-100 transition-colors"
              >
                Get started
              </button>
            </div>
          </div>
        </FadeInUp>
      </section>

      {/* 5. FAQ Section (id="faq") */}
      <section id="faq" className="py-32 px-6 max-w-3xl mx-auto">
        <FadeInUp>
          <h2 className="text-4xl md:text-5xl font-semibold text-center mb-12 text-white">We've got answers</h2>
          
          <div className="border border-white/10 rounded-xl bg-transparent overflow-hidden divide-y divide-white/10">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="transition-colors">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full py-6 px-6 flex items-center justify-between text-left focus:outline-none group"
                  >
                    <span className="text-base text-white font-medium group-hover:text-teal-400 transition-colors">{faq.q}</span>
                    <span className={`transform transition-transform duration-300 text-gray-400 text-lg ${isOpen ? 'rotate-45 text-teal-400' : ''}`}>
                      +
                    </span>
                  </button>
                  <div 
                    className="grid transition-all duration-300 ease-in-out"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="text-gray-400 text-sm pb-6 px-6 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </FadeInUp>
      </section>

      {/* 6. Footer Section (id="contact") */}
      <section id="contact" className="relative z-0 pt-32 pb-10 px-6 border-t border-white/5 overflow-hidden">
        {/* Background Video for Footer */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 object-cover w-full h-full opacity-40 -z-10 pointer-events-none"
        >
          <source src="https://cdn.sceneai.art/Hero%20Section%20Video/50b4f304-cdca-4e12-8735-580d225834be.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black -z-10 pointer-events-none" />

        <FadeInUp className="max-w-7xl mx-auto">
          {/* Top CTA */}
          <div className="text-center mb-32">
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-white mb-8">
              Ready to automate <span className="font-serif italic font-normal text-teal-400">everything?</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => scrollToSection('features')}
                className="bg-white hover:bg-gray-100 text-black font-medium px-8 py-3.5 rounded-full transition-all text-sm w-full sm:w-auto shadow-xl"
              >
                Get started
              </button>
              <button 
                onClick={() => scrollToSection('faq')}
                className="bg-[#1F1F22] hover:bg-[#2A2A2D] text-white font-medium px-8 py-3.5 rounded-full border border-white/5 transition-all text-sm w-full sm:w-auto"
              >
                Learn more
              </button>
            </div>
          </div>

          {/* Link Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto mb-24">
            <div className="space-y-4">
              <PletyLogo />
              <p className="text-sm text-gray-400 leading-relaxed">Speed, scale, and smarts — deployed for universal health records.</p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white">Product</p>
              <button onClick={() => scrollToSection('about')} className="text-left text-sm text-gray-400 hover:text-white transition-colors">About</button>
              <button onClick={() => scrollToSection('features')} className="text-left text-sm text-gray-400 hover:text-white transition-colors">Pricing</button>
              <button onClick={() => scrollToSection('features')} className="text-left text-sm text-gray-400 hover:text-white transition-colors">Changelog</button>
              <button onClick={() => scrollToSection('contact')} className="text-left text-sm text-gray-400 hover:text-white transition-colors">Contact</button>
            </div>

            <div className="flex flex-col space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white">Legal</p>
              <a href="#terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of service</a>
              <a href="#privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy policy</a>
              <a href="#404" className="text-sm text-gray-400 hover:text-white transition-colors">404</a>
            </div>

            <div className="flex flex-col space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white">Connect</p>
              <a href="#instagram" className="text-sm text-gray-400 hover:text-white transition-colors">Instagram</a>
              <a href="#youtube" className="text-sm text-gray-400 hover:text-white transition-colors">YouTube</a>
              <a href="#linkedin" className="text-sm text-gray-400 hover:text-white transition-colors">LinkedIn</a>
              <a href="#twitter" className="text-sm text-gray-400 hover:text-white transition-colors">Twitter / X</a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-gray-500 border-t border-white/5 pt-8 text-center">
            <span>© 2026 AarogyaPulse. All rights reserved</span>
            <span>•</span>
            <span className="text-gray-300">by Re-text</span>
            <span>•</span>
            <span className="text-gray-300">Made in Gemini</span>
          </div>
        </FadeInUp>
      </section>

      {/* Global CSS for Marquee Animation */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}