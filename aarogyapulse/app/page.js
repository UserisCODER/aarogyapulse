'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import HeaderNavbar from "@/components/HeaderNavbar";

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

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { q: "Is citizen health data encrypted and sovereign?", a: "Yes. Every record is encrypted at rest and in transit via TLS 1.3 and AES-256 GCM. Patients hold sovereign ownership through verifiable cryptographic consent windows." },
    { q: "How does onboarding happen without requiring a smartphone app?", a: "Citizens link and issue their ABHA Health ID right at the Aadhaar biometric desk in under 60 seconds using thumbprints or OTP rails." },
    { q: "How does the paper prescription OCR handle handwritten slips?", a: "Printed pharmacy bills and clinical slips are parsed with over 99% accuracy via server-side Tesseract, holding drafts for one-click confirmation." },
    { q: "Can medical records seamlessly travel across state and hospital borders?", a: "Yes. Through universal FHIR HL7 and ABHA gateway protocols, a record created in primary care is securely readable at super-specialty hospitals with consent." },
    { q: "How does the 60-minute doctor consent lock safeguard patient privacy?", a: "An ephemeral decryption token is granted exclusively to a department physician for 60 minutes before automatically expiring." }
  ];

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-teal-500 selection:text-black">
        <HeaderNavbar />
      
      {/* 2. Hero Section */}
      <section id="about" className="min-h-screen flex flex-col items-center justify-center pt-32 pb-20 relative z-0 overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 object-cover min-w-full min-h-full opacity-90 -z-10 pointer-events-none">
          <source src="https://cdn.sceneai.art/Hero%20Section%20Video/50b4f304-cdca-4e12-8735-580d225834be.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black -z-10"></div>

        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center text-center relative z-10">
          <div className="fade-in-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 mb-8 backdrop-blur-sm">
            <span className="text-teal-400">✨</span>
            <span>Universal Portable Health Records</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>

          <h1 className="fade-in-up text-5xl md:text-7xl font-medium tracking-tight mb-6 text-center leading-[1.15]">
            The intelligence layer for clear <span className="font-serif italic font-normal text-teal-400">health decisions.</span>
          </h1>

          <p className="fade-in-up text-[16px] text-gray-300/90 max-w-2xl text-center mb-10 leading-relaxed">
            One portable health record for every Indian, created where they already are — featuring instant Aadhaar linking, paper prescription OCR, and secure doctor consent.
          </p>

          <div className="fade-in-up flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a href="#features" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-black text-sm font-semibold px-8 py-3.5 rounded-full shadow-lg transition-all">
              <span>Get started</span>
            </a>
            <a href="#ocr-timeline" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1F1F22] hover:bg-[#2A2A2D] text-white text-sm font-medium px-8 py-3.5 rounded-full border border-white/10 transition-all">
              <span>Learn more</span>
            </a>
          </div>

          <div className="fade-in-up mt-12 grid grid-cols-3 gap-6 sm:gap-12 text-left border-y border-white/5 py-4 max-w-xl mx-auto">
            <div>
              <div className="text-lg font-bold text-white tracking-tight">100% ABHA</div>
              <div className="text-[11px] text-gray-400">M1, M2 & M3 Ready</div>
            </div>
            <div>
              <div className="text-lg font-bold text-teal-400 tracking-tight">60-Min</div>
              <div className="text-[11px] text-gray-400">Consent-locked Gate</div>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-400 tracking-tight">Zero OPD</div>
              <div className="text-[11px] text-gray-400">Cross-leak Privacy</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Feature 1: AI Symptom Checker */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-semibold text-amber-400 mb-6">
              <span>✨ AI Symptom Checker</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6 leading-[1.2]">
              Where speed meets intelligent diagnosis.
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-8">
              Type or dictate symptoms in natural vernacular text. The clinical AI triage parses severity, matches SNOMED CT diagnostic taxonomy, and auto-routes patients straight to the designated department queue before they even reach the clinic.
            </p>
            <Link href="/patient/symptoms" className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-black text-sm font-semibold px-6 py-3 rounded-full transition-all">
              <span>Try Symptom AI</span>
            </Link>
          </div>

          <div className="fade-in-up rounded-3xl overflow-hidden p-6 sm:p-8 border border-white/10 relative shadow-2xl bg-neutral-950">
            <div className="relative z-0 bg-[#1C1C1E]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-medium">Cardiac Emergency</span>
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-xs font-medium">Respiratory</span>
              </div>
              <div className="space-y-4 mb-6 text-xs text-gray-300">
                <div className="bg-white/5 rounded-xl p-3">"Severe chest tightness radiating to left arm..."</div>
                <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl flex items-center justify-between text-red-200">
                  <span>🚨 Critical Triage — Level 1</span>
                  <span className="bg-red-600 px-2 py-0.5 rounded text-white font-bold">Priority #1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Feature 2: OCR & NLP Timeline */}
      <section id="ocr-timeline" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 fade-in-up rounded-3xl overflow-hidden p-6 sm:p-8 border border-white/10 relative shadow-2xl bg-neutral-950">
            <div className="relative z-0 bg-[#1C1C1E]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl font-mono text-xs text-gray-300 space-y-2">
              <p className="text-teal-400">Tesseract OCR & NLP Pipeline</p>
              <p className="text-gray-400">Patient: Ramesh Kumar (ABHA: 91-8209)</p>
              <p className="text-gray-200">Rx: Tab. Atorvastatin 20mg (1-0-0) x 30d</p>
              <p className="text-emerald-400">✓ Synced with National ABHA Health Locker 2.0</p>
            </div>
          </div>

          <div className="order-1 lg:order-2 fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-xs font-semibold text-emerald-400 mb-6">
              <span>✨ OCR & NLP Timeline</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6 leading-[1.2]">
              Turn paper prescriptions into a structured digital timeline.
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-8">
              Hospitals simply snap a photo of old prescription slips, discharge summaries, or laboratory prints. Our server-side Tesseract OCR converts them into chronological, dated records.
            </p>
            <Link href="/records-counter" className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-black text-sm font-semibold px-6 py-3 rounded-full transition-all">
              <span>Explore OCR Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section id="faq" className="py-32 px-6 max-w-3xl mx-auto relative">
        <div className="text-center mb-12 fade-in-up">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">We've got answers</h2>
          <p className="text-sm text-gray-400">Everything you need to know about AarogyaPulse infrastructure</p>
        </div>

        <div className="fade-in-up border border-white/10 rounded-2xl bg-transparent divide-y divide-white/10 overflow-hidden shadow-2xl">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index}>
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full py-6 px-6 flex items-center justify-between text-left text-base text-white font-medium hover:text-teal-400 transition-colors focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <span className="text-xl text-gray-400">{isOpen ? '×' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="pb-6 px-6 text-gray-400 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Footer Section & Ambulance Animation */}
      <footer id="contact" className="relative z-0 pt-20 pb-12 px-6 border-t border-white/5 overflow-hidden bg-black">
        <div className="max-w-7xl mx-auto mb-16 relative overflow-hidden rounded-2xl bg-neutral-950/80 border border-white/10 p-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-3 px-2">
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              EMERGENCY DISPATCH GRID ACTIVE (ROUTE 108 EXPRESS)
            </span>
            <span className="text-teal-400 hidden sm:inline">Real-time GPS Fleet Telemetry</span>
          </div>

          <div className="relative w-full h-14 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center overflow-hidden">
            <div className="absolute w-full h-[2px] border-b-2 border-dashed border-amber-400/40 z-0"></div>
            <motion.div
              initial={{ x: '110vw' }}
              animate={{ x: '-15vw' }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="absolute z-10 flex items-center"
              style={{ transform: 'scaleX(-1)' }}
            >
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 shadow-lg text-sm">
                <span className="text-xl">🚑</span>
                <span className="text-base">💨</span>
                <span className="text-[10px] font-bold text-red-300 font-mono tracking-wider ml-1 uppercase">UNIT-108</span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center mb-24 fade-in-up">
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6">
            Ready to deploy <span className="font-serif italic font-normal text-teal-400">universal health records?</span>
          </h2>
          <div className="flex justify-center gap-4">
            <a href="#about" className="bg-white text-black text-sm font-semibold px-8 py-3.5 rounded-full shadow-lg">Get started</a>
            <a href="#features" className="bg-[#1F1F22] text-white text-sm font-medium px-8 py-3.5 rounded-full border border-white/15">Learn more</a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 border-t border-white/5 pt-8 text-center">
          <span>© 2026 AarogyaPulse. All rights reserved</span>
          <span>by <strong className="text-gray-300 font-medium">Team Er Hustlers</strong></span>
          <span>Made with <strong className="text-gray-300 font-medium">modern React/Tailwind</strong></span>
        </div>
      </footer>

    </div>
  );
}