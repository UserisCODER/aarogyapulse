// components/AnimatedStethoscope.js
'use client';
import { motion } from 'framer-motion';

export default function AnimatedStethoscope() {
  return (
    <div className="relative flex items-center justify-center p-6 bg-gradient-to-br from-teal-900/10 to-cyan-900/20 rounded-2xl border border-teal-500/20 shadow-lg">
      <motion.div
        animate={{ 
          rotate: [0, 8, -8, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="text-7xl filter drop-shadow-md cursor-pointer select-none"
        title="AarogyaPulse Clinical AI Core"
      >
        🩺
      </motion.div>
      <div className="absolute bottom-2 text-xs font-semibold tracking-wider text-teal-800 uppercase">
        Active Health Core
      </div>
    </div>
  );
}