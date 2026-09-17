"use client";

import { motion } from "framer-motion";

/** The animated tick shown after a health ID is created. */
export default function SuccessSeal({ size = 64 }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="30" fill="#EFF4FF" />
      <motion.circle
        cx="32"
        cy="32"
        r="30"
        stroke="#2563EB"
        strokeWidth="3"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.path
        d="M20 33.5 L28.5 42 L44 25"
        stroke="#2563EB"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.35 }}
      />
    </motion.svg>
  );
}
