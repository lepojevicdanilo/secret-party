"use client";

import { useEffect, useRef, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc
} from "firebase/firestore";

export default function ClubAdmin() {

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("SVE");
  const [newIds, setNewIds] = useState([]);

  const prevRef = useRef([]);
  const audioRef = useRef(null);

  const router = useRouter();

  // 🔐 AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });
    return () => unsub();
  }, [router]);

  // 🔊 UNLOCK AUDIO
  useEffect(() => {
    const unlock = () => {
      if (!audioRef.current) {
        audioRef.current = new Audio("/notification.wav");
        audioRef.current.volume = 1;
      }

      audioRef.current.play().catch(() => {});
      audioRef.current.pause();

      window.removeEventListener("click", unlock);
    };

    window.addEventListener("click", unlock);
    return () => window.removeEventListener("click", unlock);
  }, []);

  // 🔥 LIVE ORDERS ENGINE
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) => {

      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      const prev = prevRef.current;

      const newOnes = data.filter(
        o => !prev.some(p => p.id === o.id)
      );

      if (newOnes.length > 0) {

        // 🔊 SOUND
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }

        // 📳 VIBRATION
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }

        setNewIds(newOnes.map(o => o.id));

        setTimeout(() => setNewIds([]), 4000);
      }

      prevRef.current = data;
      setOrders(data);
    });

    return () => unsub();
  }, []);

  const setStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status });
  };

  const filtered = orders.filter(o =>
    filter === "SVE" ? true : o.status === filter
  );

  return (
    <main className="min-h-screen bg-black text-white">

      {/* TOP BAR */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/10 p-3 flex justify-between items-center">

        <h1 className="text-xl font-bold tracking-widest text-red-500">
          🔥 CLUB CONTROL
        </h1>

        <div className="flex gap-2">

          {["SVE", "Čeka", "U pripremi", "Servirano"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs transition
                ${filter === f
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-gray-300"
                }`}
            >
              {f}
            </button>
          ))}

        </div>

      </div>

      {/* GRID */}
      <div className="grid gap-3 p-3">

        {filtered.map(order => {

          const isNew = newIds.includes(order.id);

          return (
            <div
              key={order.id}
              className={`
                rounded-xl p-4 border transition-all

                ${isNew
                  ? "border-red-500 shadow-lg shadow-red-500/40 animate-pulse scale-[1.01]"
                  : "border-white/10 bg-zinc-900"
                }
              `}
            >

              {/* HEADER */}
              <div className="flex justify-between items-center mb-2">

                <div>
                  <div className="text-sm text-gray-400">
                    🪑 Sto {order.table}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    #{order.id.slice(0, 6)}
                  </div>
                </div>

                <div className={`
                  text-xs font-bold px-2 py-1 rounded
                  ${order.status === "Čeka" && "bg-yellow-500 text-black"}
                  ${order.status === "U pripremi" && "bg-blue-500 text-white"}
                  ${order.status === "Servirano" && "bg-green-500 text-black"}
                `}>
                  {order.status}
                </div>

              </div>

              {/* ITEMS */}
              <div className="space-y-1 text-sm mb-3">

                {order.items?.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{i.name} × {i.quantity}</span>
                    <span className="text-yellow-400">
                      {i.price * i.quantity} din
                    </span>
                  </div>
                ))}

              </div>

              {/* TOTAL */}
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold">

                <span>Total</span>
                <span className="text-yellow-400">
                  {order.total} din
                </span>

              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-3">

                <button
                  onClick={() => setStatus(order.id, "Čeka")}
                  className="bg-yellow-500 text-black px-3 py-1 rounded text-xs"
                >
                  Čeka
                </button>

                <button
                  onClick={() => setStatus(order.id, "U pripremi")}
                  className="bg-blue-600 px-3 py-1 rounded text-xs"
                >
                  Priprema
                </button>

                <button
                  onClick={() => setStatus(order.id, "Servirano")}
                  className="bg-green-500 text-black px-3 py-1 rounded text-xs"
                >
                  OK
                </button>

              </div>

            </div>
          );
        })}

      </div>

    </main>
  );
}