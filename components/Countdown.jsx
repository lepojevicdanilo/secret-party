"use client";

import Background from "./Background";
import NumberCard from "./NumberCard";
import { useEffect, useState } from "react";

const target = new Date("2026-07-25T00:00:00").getTime();

export default function Countdown() {
  const [time, setTime] = useState(getTime());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const interval = setInterval(() => {
      setTime(getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className="flex min-h-screen items-center justify-center text-4xl sm:text-6xl font-black text-white">
        🎉 IT’S TIME 🎉
      </div>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-3">

      <Background />

      {/* CINEMATIC WRAPPER */}
      <div
        className={`
          relative z-10 w-full max-w-6xl
          p-5 sm:p-10 rounded-3xl
          bg-white/5 backdrop-blur-3xl border border-white/10
          ${mounted ? "cameraIntro" : ""}
        `}
      >

        <h1 className="text-center text-4xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-pink-400 via-orange-300 to-violet-400 bg-clip-text text-transparent">
          SECRET PARTY
        </h1>

        <p className="text-center mt-4 text-white/60 uppercase tracking-[5px]">
          Odbrojavanje do sledece zurke
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          <NumberCard value={time.days} label="Days" />
          <NumberCard value={time.hours} label="Hours" />
          <NumberCard value={time.minutes} label="Minutes" />
          <NumberCard value={time.seconds} label="Seconds" />
        </div>

      </div>
    </section>
  );
}

function getTime() {
  const diff = target - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}