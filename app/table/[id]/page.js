"use client";

import { useEffect, useState, use } from "react";
import { db } from "../../../lib/firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

export default function TablePage({ params }) {

  const { id: tableId } = use(params);

  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);

  // 📦 LOAD MENU
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "menu"), (snap) => {
      setMenu(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  // ➕ ADD ITEM
  function add(item) {

    const exists = cart.find(i => i.id === item.id);

    if (exists) {
      setCart(
        cart.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1
        }
      ]);
    }
  }

  // ➖ REMOVE ITEM
  function remove(itemId) {

    const item = cart.find(i => i.id === itemId);
    if (!item) return;

    if (item.quantity > 1) {
      setCart(
        cart.map(i =>
          i.id === itemId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
      );
    } else {
      setCart(cart.filter(i => i.id !== itemId));
    }
  }

  // 💰 TOTAL
  const total = cart.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  // 📤 SEND ORDER
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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black text-white p-4">

      {/* CARD */}
      <div className="w-[420px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-fadeIn">

        {/* HEADER */}
        <h1 className="text-2xl font-bold text-center mb-6">
          🍻 Sto {tableId}
        </h1>

        {/* MENU */}
        <div className="space-y-3">

          {menu.map(item => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
            >

              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-gray-400 text-sm">
                  {item.price} din
                </div>
              </div>

              <button
                onClick={() => add(item)}
                className="bg-green-500 hover:bg-green-400 active:scale-95 transition px-3 py-1 rounded-lg text-black font-bold"
              >
                +
              </button>

            </div>
          ))}

        </div>

        {/* CART */}
        <hr className="my-5 border-white/10" />

        <div className="space-y-3">

          {cart.length === 0 && (
            <p className="text-center text-gray-400">
              Korpa je prazna 💤
            </p>
          )}

          {cart.map(item => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-white/5 p-3 rounded-xl hover:bg-white/10 transition"
            >

              <div>
                <div className="font-medium">
                  {item.name} × {item.quantity}
                </div>
                <div className="text-xs text-gray-400">
                  {item.price} din / kom
                </div>
              </div>

              <div className="flex items-center gap-2">

                <span className="text-yellow-400 font-bold">
                  {item.price * item.quantity} din
                </span>

                <button
                  onClick={() => remove(item.id)}
                  className="bg-red-500 hover:bg-red-400 active:scale-95 transition px-2 py-1 rounded-lg text-xs"
                >
                  ❌
                </button>

              </div>

            </div>
          ))}

        </div>

        {/* TOTAL */}
        <div className="mt-6 text-center text-yellow-400 font-bold text-lg animate-pulse">
          Ukupno: {total} din
        </div>

        {/* BUTTON */}
        <button
          onClick={sendOrder}
          className="mt-5 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition py-3 rounded-xl font-bold shadow-xl active:scale-95"
        >
          🚀 Naruči
        </button>

      </div>

    </main>
  );
}