// components/Footer.js
'use client';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white pt-10 pb-6 mt-16 border-t border-teal-900/30 overflow-hidden relative">
      {/* Interactive Road & Sliding Ambulance Animation (Left to Right) */}
      <div className="relative w-full h-14 bg-slate-900 mb-8 flex items-center border-y border-teal-600/30 shadow-inner">
        <div className="absolute inset-0 flex items-center justify-around opacity-20">
          <div className="w-16 h-1 bg-yellow-400 rounded"></div>
          <div className="w-16 h-1 bg-yellow-400 rounded"></div>
          <div className="w-16 h-1 bg-yellow-400 rounded"></div>
          <div className="w-16 h-1 bg-yellow-400 rounded"></div>
          <div className="w-16 h-1 bg-yellow-400 rounded"></div>
        </div>
        <motion.div
          initial={{ x: '-15vw' }}
          animate={{ x: '110vw' }}
          transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
          className="absolute text-5xl filter drop-shadow-[0_0_10px_rgba(239,68,68,0.6)] z-10"
        >
          🚑💨
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="space-y-2">
          <h4 className="font-bold text-teal-400 text-base border-l-2 border-teal-500 pl-2">1. About Us</h4>
          <p className="text-slate-400 leading-relaxed">AarogyaPulse powers portable health records across India, built with precision by Team Er Hustlers.</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-bold text-teal-400 text-base border-l-2 border-teal-500 pl-2">2. Privacy Policy</h4>
          <p className="text-slate-400 leading-relaxed">Strict consent-window enforcement ensuring total patient data security and privacy.</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-bold text-teal-400 text-base border-l-2 border-teal-500 pl-2">3. Terms and Conditions</h4>
          <p className="text-slate-400 leading-relaxed">Standardized usage terms for medical staff, OPD counters, and secure patient portals.</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-bold text-teal-400 text-base border-l-2 border-teal-500 pl-2">4. Our Socials</h4>
          <div className="flex space-x-4 pt-2 text-xl">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-teal-800/50 flex items-center justify-center hover:bg-teal-700 hover:text-white transition">🌐</a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-teal-800/50 flex items-center justify-center hover:bg-teal-700 hover:text-white transition">💻</a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-teal-800/50 flex items-center justify-center hover:bg-teal-700 hover:text-white transition">📱</a>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 mt-10 pt-4 border-t border-slate-900">
        © 2026 AarogyaPulse • Built with passion by Team Er Hustlers
      </div>
    </footer>
  );
}