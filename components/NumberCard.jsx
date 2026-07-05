"use client";

import { motion } from "framer-motion";
import FlipNumber from "./FlipNumber";

export default function NumberCard({ value, label }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.03, 1],
        rotate: [0, 0.5, -0.5, 0],
      }}
      transition={{ duration: 0.25 }}
      className="relative rounded-3xl p-5 sm:p-6 md:p-8
      bg-white/5 backdrop-blur-3xl border border-white/10"
    >
      <div className="absolute inset-0 blur-3xl opacity-20 bg-pink-500/20" />

      <div className="text-center text-5xl sm:text-6xl md:text-7xl text-white font-black">
        <FlipNumber value={value} />
      </div>

      <p className="mt-4 text-center text-white/50 uppercase tracking-[4px] text-xs sm:text-sm">
        {label}
      </p>
    </motion.div>
  );
}