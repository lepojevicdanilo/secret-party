"use client";

import React from "react";
import { motion } from "framer-motion";

const MenuItem = React.memo(function MenuItem({ item, add }) {
  return (
    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
      <div>
        <div className="font-semibold">{item.name}</div>
        <div className="text-xs text-gray-400">{item.category}</div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-yellow-400 font-bold">
          {item.price} din
        </span>

        <motion.button
          whileTap={{ scale: 0.7 }}
          onClick={() => add(item)}
          className="w-10 h-10 bg-green-500 text-black rounded-xl font-bold"
        >
          +
        </motion.button>
      </div>
    </div>
  );
});

export default MenuItem;