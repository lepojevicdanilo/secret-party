"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function FlipNumber({ value }) {
  return (
    <div className="relative h-[1.2em] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ rotateX: -90, opacity: 0, y: -10 }}
          animate={{ rotateX: 0, opacity: 1, y: 0 }}
          exit={{ rotateX: 90, opacity: 0, y: 10 }}
          transition={{ duration: 0.35 }}
        >
          {String(value).padStart(2, "0")}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}