"use client";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  addDoc
} from "firebase/firestore";

import { useEffect, useState, useRef } from "react";
import { db } from "../../lib/firebase";

export default function Admin() {

  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const audioRef = useRef(null);
  const router = useRouter();

useEffect(() => {
  const unsub = onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.push("/login");
    }
  });

  return () => unsub();
}, []);

  // 🔥 REALTIME ORDERS + MENU
  useEffect(() => {

    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {

      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setOrders(data);

      // 🔔 sound samo za nove
      const hasNew = snapshot.docChanges().some(
        change => change.type === "added"
      );

      if (hasNew) {
        audioRef.current?.play();
      }

    });

    const unsubMenu = onSnapshot(collection(db, "menu"), (snapshot) => {
      setMenu(snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })));
    });

    return () => {
      unsubOrders();
      unsubMenu();
    };

  }, []);

  // ➕ DODAJ PIĆE
  async function addDrink() {
    if (!name || !price) return;

    await addDoc(collection(db, "menu"), {
      name,
      price: Number(price)
    });

    setName("");
    setPrice("");
  }

  // 📊 SORTIRANJE ORDERS
  const sortedOrders = [...orders].sort((a, b) => b.time - a.time);

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-10">

      <audio ref={audioRef} src="/notification.wav" />
    <Link href="/admin/analytics">
  <button className="bg-purple-600 px-3 py-1 rounded mb-4">
    📊 Analytics
  </button>
</Link>
<button
  onClick={() => signOut(auth)}
  className="bg-red-600 px-3 py-1 rounded mb-4"
>
  Logout
</button>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🍻 Admin POS</h1>
        <span className="text-green-400 text-sm">LIVE</span>
      </div>

      {/* ZARADA */}
      <div className="bg-zinc-800 p-4 rounded mb-6">
        <h2 className="font-bold">💰 Ukupna zarada</h2>
        <p className="text-yellow-400 text-2xl font-bold">
          {orders.reduce((sum, o) => sum + (o.total || 0), 0)} din
        </p>
      </div>

      {/* DODAJ PIĆE */}
      <div className="bg-zinc-800 p-4 rounded mb-6">

        <h2 className="font-bold mb-2">➕ Dodaj piće</h2>

        <input
          className="text-black p-2 mr-2"
          placeholder="Ime"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="text-black p-2 mr-2"
          placeholder="Cena"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button
          onClick={addDrink}
          className="bg-green-600 px-3 py-2 rounded"
        >
          Dodaj
        </button>

      </div>

      {/* MENI */}
      <div className="bg-zinc-800 p-4 rounded mb-6">

        <h2 className="font-bold mb-2">🍺 Meni</h2>

        {menu.map(item => (
          <div key={item.id} className="flex justify-between mb-2">

            <span>{item.name} - {item.price} din</span>

            <button
              onClick={() => deleteDoc(doc(db, "menu", item.id))}
              className="bg-red-600 px-2 py-1 rounded"
            >
              Obriši
            </button>

          </div>
        ))}

      </div>

      {/* ORDERS */}
      <div className="space-y-4">

        {sortedOrders.map(order => (

          <div key={order.id} className="bg-zinc-800 p-4 rounded">

            <h2 className="text-xl font-bold">
              Sto {order.table}
            </h2>

            <p className={`font-bold ${
              order.status === "Čeka"
                ? "text-yellow-400"
                : order.status === "U pripremi"
                ? "text-blue-400"
                : "text-green-400"
            }`}>
              {order.status || "Čeka"}
            </p>

            <span className="text-xs text-gray-400">
              #{order.id.slice(0, 6)}
            </span>

            <p className="text-gray-400 text-sm mb-2">
              {order.time
                ? new Date(order.time).toLocaleTimeString()
                : ""}
            </p>

            {/* ITEMS */}
            {order.items?.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name} × {item.quantity}</span>
                <span>{item.price * item.quantity} din</span>
              </div>
            ))}

            <p className="mt-2 font-bold text-yellow-400">
              Ukupno: {order.total} din
            </p>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-3">

              <button
                onClick={() =>
                  updateDoc(doc(db, "orders", order.id), {
                    status: "U pripremi"
                  })
                }
                className="bg-blue-600 px-3 py-1 rounded text-sm"
              >
                U pripremi
              </button>

              <button
                onClick={() =>
                  updateDoc(doc(db, "orders", order.id), {
                    status: "Posluženo"
                  })
                }
                className="bg-green-600 px-3 py-1 rounded text-sm"
              >
                Posluženo
              </button>

              <button
                onClick={() =>
                  deleteDoc(doc(db, "orders", order.id))
                }
                className="bg-red-600 px-3 py-1 rounded text-sm"
              >
                Obriši
              </button>

            </div>

          </div>

        ))}

      </div>

    </main>
  );
}