"use client";

import { useEffect, useState, use, useRef } from "react";
import { db } from "../../../lib/firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function TablePage({ params }) {
  const { id: tableId } = use(params);

  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("SVE");

  const [cartOpen, setCartOpen] = useState(false);
  const [flyItem, setFlyItem] = useState(null);
  const [cartBounce, setCartBounce] = useState(false);

  const [showIntro, setShowIntro] = useState(true);
  const [confetti, setConfetti] = useState(false);
const [orderSuccess, setOrderSuccess] = useState(false);
  // FIXED CONFETTI POSITIONS (important fix)
  const confettiData = useRef(
    Array.from({ length: 70 }).map(() => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 3,
      size: 2 + Math.random() * 4,
    }))
  );

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "menu"), (snap) => {
      setMenu(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  // INTRO + CONFETTI FIX
  useEffect(() => {
    const t1 = setTimeout(() => {
      setConfetti(true);

      setTimeout(() => {
        setConfetti(false);
      }, 2000);

    }, 100);

    const t2 = setTimeout(() => {
      setShowIntro(false);
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const categories = [
    "SVE",
    ...new Set(menu.map(i => i.category).filter(Boolean))
  ];

  const filteredMenu =
    activeCategory === "SVE"
      ? menu
      : menu.filter(i => i.category === activeCategory);

  function add(item) {
    setFlyItem(item.id);
    setCartBounce(true);

    setTimeout(() => setFlyItem(null), 600);
    setTimeout(() => setCartBounce(false), 350);

    const exists = cart.find(i => i.id === item.id);

    if (exists) {
      setCart(cart.map(i =>
        i.id === item.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  }

  function remove(id) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    if (item.quantity > 1) {
      setCart(cart.map(i =>
        i.id === id
          ? { ...i, quantity: i.quantity - 1 }
          : i
      ));
    } else {
      setCart(cart.filter(i => i.id !== id));
    }
  }

  const total = cart.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  async function sendOrder() {
    if (cart.length === 0) return;

    await addDoc(collection(db, "orders"), {
      table: String(tableId),
      items: cart,
      total,
      status: "Čeka",
      time: Date.now(),
    });

    setCart([]);

    // 🎉 CONFETTI ON ORDER
    setConfetti(true);
    setTimeout(() => setConfetti(false), 1500);

    setCartOpen(false);
    setOrderSuccess(true);

setTimeout(() => {
  setOrderSuccess(false);
}, 2500);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white overflow-hidden">

       <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{
                scale: [0.6, 1.1, 1],
                opacity: 1,
                filter: [
                  "drop-shadow(0 0 0px purple)",
                  "drop-shadow(0 0 30px purple)",
                  "drop-shadow(0 0 10px purple)"
                ]
              }}
              transition={{ duration: 1.2 }}
              className="text-center"
            >
              <motion.img
                src="/logo.png"
                className="w-28 mx-auto mb-4"
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />

              <h1 className="text-3xl font-bold">
                Dobrodosli na <span className="text-purple-400">Secret Party</span>
              </h1>

              <p className="text-gray-400 mt-2">
                Sto {tableId}
              </p>

              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-3 h-3 bg-purple-500 rounded-full mx-auto mt-6 shadow-[0_0_25px_purple]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 PREMIUM INTRO (IMPROVED CLUB STYLE) */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              backgroundColor: ["#000", "#1a0025", "#000"]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{
                scale: [0.6, 1.1, 1],
                opacity: 1,
                filter: [
                  "drop-shadow(0 0 0px purple)",
                  "drop-shadow(0 0 25px purple)",
                  "drop-shadow(0 0 10px purple)"
                ]
              }}
              transition={{ duration: 1.2 }}
              className="text-center"
            >
              <motion.img
                src="/logo.png"
                className="w-28 mx-auto mb-4"
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />

              <h1 className="text-3xl font-bold">
                Welcome to <span className="text-purple-400">Secret Party</span>
              </h1>

              <p className="text-gray-400 mt-2">
                Sto {tableId}
              </p>

              {/* pulsing glow */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-3 h-3 bg-purple-500 rounded-full mx-auto mt-6 shadow-[0_0_25px_purple]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="w-10 h-8" />
          <h1 className="font-bold text-lg">Sto {tableId}</h1>
        </div>

        <motion.button
          animate={cartBounce ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
          onClick={() => setCartOpen(true)}
          className="bg-blue-600 px-4 py-2 rounded-xl font-bold"
        >
          🛒 Korpa ({cart.length})
        </motion.button>
      </div>

      {/* MENU */}
      <div className="p-4 space-y-4">

        <div className="flex gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-purple-600"
                  : "bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredMenu.map(item => (
            <motion.div
              key={item.id}
              whileTap={{ scale: 0.96 }}
              className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10"
            >
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
            </motion.div>
          ))}
        </div>
      </div>

      {/* FLY ANIMATION */}
      <AnimatePresence>
        {flyItem && (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ x: 180, y: -260, scale: 0.2, opacity: 0, rotate: 180 }}
            transition={{ duration: 0.6 }}
            className="fixed bottom-20 left-10 bg-green-500 text-black px-3 py-2 rounded-xl font-bold z-50"
          >
            +1
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE BAR */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-zinc-950 border-t border-white/10 p-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-400">Ukupno</div>
            <div className="text-yellow-400 font-bold">{total} din</div>
          </div>

          <button
            onClick={() => setCartOpen(true)}
            className="bg-blue-600 px-6 py-3 rounded-xl font-bold"
          >
            🛒 Korpa ({cart.length})
          </button>
        </div>
      </div>

      {/* CART */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-end">
          <div className="w-full sm:w-[420px] h-full bg-zinc-950 p-4 overflow-y-auto">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">🛒 Korpa</h2>

              <button
                onClick={() => setCartOpen(false)}
                className="text-red-400 text-xl"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 && (
              <p className="text-gray-400">Korpa je prazna</p>
            )}

            {cart.map(item => (
              <div key={item.id} className="bg-white/5 p-3 rounded-xl mb-3">
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs text-gray-400">
                      x{item.quantity}
                    </div>
                  </div>

                  <div className="text-yellow-400 font-bold">
                    {item.price * item.quantity} din
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button onClick={() => remove(item.id)} className="bg-gray-700 px-3 py-1 rounded">−</button>
                  <button onClick={() => add(item)} className="bg-green-600 px-3 py-1 rounded text-black font-bold">+</button>
                </div>
              </div>
            ))}

            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="text-yellow-400 font-bold text-lg">
                Ukupno: {total} din
              </div>

              <button
                onClick={sendOrder}
                className="w-full mt-3 bg-blue-600 py-3 rounded-xl font-bold"
              >
                🚀 Poruči
              </button>
            </div>

          </div>
        </div>
      )}
<AnimatePresence>
  {orderSuccess && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.6, opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center bg-zinc-900 border border-white/10 p-6 rounded-2xl shadow-2xl"
      >
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-4xl mb-3"
        >
          ✅
        </motion.div>

        <h2 className="text-xl font-bold text-white">
          Porudžbina primljena
        </h2>

        <p className="text-gray-400 text-sm mt-2">
          Konobar dolazi uskoro 🍸
        </p>

        <motion.div
          className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden"
        >
          <motion.div
            className="h-full bg-green-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5 }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </main>
  );
}