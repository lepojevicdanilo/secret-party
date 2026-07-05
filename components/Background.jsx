"use client";

import { useEffect, useRef } from "react";

export default function Background() {
  const starsRef = useRef([]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);

    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.zIndex = "0";
    canvas.style.pointerEvents = "none";

    let w, h;
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // stars
    starsRef.current = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      s: Math.random() * 1.5,
    }));

    let shooting = [];

    const spawnShoot = () => {
      shooting.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.5,
        vx: 8 + Math.random() * 5,
        vy: 8 + Math.random() * 5,
        life: 40,
      });
    };

    setInterval(spawnShoot, 2500);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // stars
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      for (let s of starsRef.current) {
        ctx.fillRect(s.x, s.y, s.s, s.s);
      }

      // shooting stars
      for (let i = 0; i < shooting.length; i++) {
        let s = shooting[i];
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - 20, s.y - 20);
        ctx.stroke();

        s.x += s.vx;
        s.y += s.vy;
        s.life--;

        if (s.life <= 0) {
          shooting.splice(i, 1);
          i--;
        }
      }

      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.remove();
    };
  }, []);

  return null;
}