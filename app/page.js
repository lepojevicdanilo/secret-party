"use client";

import { useState } from "react";
import menu from "../data/menu";

export default function Home() {

  const [cart, setCart] = useState([]);

  function add(item) {
    setCart([...cart, item]);
  }

  const total = cart.reduce((sum, i) => sum + i.price, 0);

  return (
<main className="min-h-screen bg-zinc-900 flex items-center justify-center text-white">
<div className="bg-zinc-800 p-6 rounded-xl shadow-xl w-[420px] text-white">
        <h1 className="text-3xl font-bold text-center mb-6">
          🍻 PARTY MENU
        </h1>

        <h2 className="mb-4 font-semibold">
          Sto 17
        </h2>

        {/* MENU */}
        {menu.map((item) => (
          <div key={item.id} className="flex justify-between mb-3">

            <div>
              <div>{item.name}</div>
              <div className="text-gray-500 text-sm">{item.price} din</div>
            </div>

            <button
              onClick={() => add(item)}
className="bg-green-500 hover:bg-green-400 text-black font-bold px-3 py-1 rounded"            >
              +
            </button>

          </div>
        ))}

        <hr className="my-4" />

        {/* CART */}
        <h3 className="font-bold mb-2">Korpa</h3>

        {cart.length === 0 && <p>Nema stavki</p>}

        {cart.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span>{item.name}</span>
            <span>{item.price} din</span>
          </div>
        ))}

        <div className="mt-4 font-bold text-yellow-400 text-lg">
          Ukupno: {total} din
        </div>

        <button className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg">
          Naruči
        </button>

      </div>

    </main>
  );
}