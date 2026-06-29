"use client";

import { useEffect, useState, use } from "react";
import { db } from "../../../lib/firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

export default function TablePage({ params }) {

  const { id: tableId } = use(params);

  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("SVE");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "menu"), (snap) => {
      setMenu(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
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
      time: Date.now()
    });

    setCart([]);
    alert("🚀 Porudžbina poslata!");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-black text-white p-4">

      {/* MAIN CARD */}
      <div className="w-[440px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-6">

        {/* HEADER */}
        <div className="flex items-center justify-center gap-3 mb-6">

          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
            <img src="/logo.png" className="w-6 h-6" />
          </div>

          <span className="font-bold text-xl tracking-widest">
            Secret Party
          </span>

        </div>

        {/* TABLE */}
        <h1 className="text-center text-gray-400 mb-5">
          Sto <span className="text-white font-bold">{tableId}</span>
        </h1>

        {/* CATEGORY BAR */}
        <div className="flex gap-2 overflow-x-auto mb-5 pb-2">

          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1 rounded-full text-sm whitespace-nowrap transition-all duration-200 active:scale-95
                ${
                  activeCategory === cat
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
            >
              {cat}
            </button>
          ))}

        </div>

        {/* MENU */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">

          {filteredMenu.map(item => (
            <div
              key={item.id}
              className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-[1.01]"
            >

              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-gray-500 text-xs">
                  {item.category}
                </div>
              </div>

              <div className="flex items-center gap-3">

                <span className="text-yellow-400 font-semibold">
                  {item.price} din
                </span>

                <button
                  onClick={() => add(item)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-500 text-black font-bold hover:bg-green-400 active:scale-90 transition"
                >
                  +
                </button>

              </div>

            </div>
          ))}

        </div>

        {/* CART */}
        <div className="mt-6 border-t border-white/10 pt-4 space-y-3">

          {cart.length === 0 && (
            <p className="text-center text-gray-400">
              Korpa je prazna 💤
            </p>
          )}

          {cart.map(item => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5"
            >

              <div className="text-sm">
                {item.name} × {item.quantity}
              </div>

              <div className="flex items-center gap-2">

                <span className="text-yellow-400 font-bold">
                  {item.price * item.quantity} din
                </span>

                <button
                  onClick={() => remove(item.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500 text-xs hover:bg-red-400 transition"
                >
                  ❌
                </button>

              </div>

            </div>
          ))}

        </div>

        {/* TOTAL */}
        <div className="mt-6 text-center text-yellow-400 font-bold text-lg">
          Ukupno: {total} din
        </div>

        {/* ORDER BUTTON */}
        <button
          onClick={sendOrder}
          className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition py-3 rounded-2xl font-bold shadow-xl active:scale-95"
        >
          🚀 Naruči
        </button>

      </div>

    </main>
  );
}