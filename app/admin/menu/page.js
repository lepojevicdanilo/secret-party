"use client";

import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";

export default function AdminMenu() {

  const [menu, setMenu] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Sokovi");

  // LOAD MENU
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "menu"), (snap) => {
      setMenu(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  // ADD ITEM
  async function addItem() {

    if (!name || !price || !category) return;

    await addDoc(collection(db, "menu"), {
      name,
      price: Number(price),
      category
    });

    setName("");
    setPrice("");
  }

  // DELETE ITEM
  async function removeItem(id) {
    await deleteDoc(doc(db, "menu", id));
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white p-10">

      <h1 className="text-3xl font-bold mb-6">
        🍹 Menu Builder (Admin)
      </h1>

      {/* FORM */}
      <div className="bg-zinc-800 p-6 rounded-xl mb-8 space-y-3">

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ime (npr. Pivo)"
          className="w-full p-2 rounded bg-black border border-white/10"
        />

        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Cena"
          type="number"
          className="w-full p-2 rounded bg-black border border-white/10"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 rounded bg-black border border-white/10"
        >
          <option value="Sokovi">Sokovi</option>
<option value="Ostalo">Ostalo</option>
          <option value="Zestina">Zestina</option>
          <option value="Specijali">Specijali</option>
            <option value="Kokteli">Kokteli</option>
        </select>

        <button
          onClick={addItem}
          className="w-full bg-green-500 py-2 rounded font-bold"
        >
          ➕ Dodaj u meni
        </button>

      </div>

      {/* LISTA */}
      <div className="space-y-3">

        {menu.map(item => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-zinc-800 p-3 rounded"
          >

            <div>
              <div className="font-bold">{item.name}</div>
              <div className="text-gray-400 text-sm">
                {item.category} • {item.price} din
              </div>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              className="bg-red-500 px-3 py-1 rounded"
            >
              ❌
            </button>

          </div>
        ))}

      </div>

    </main>
  );
}