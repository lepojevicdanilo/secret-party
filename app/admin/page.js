"use client";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

export default function Admin() {

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("SVE");

  // 🔥 REALTIME ORDERS
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      );
    });

    return () => unsub();
  }, []);

  // 🍽️ MARK AS SERVED (UPDATE + DELETE)
  const served = async (order) => {

    // 1. update status (for tables sync)
    await updateDoc(doc(db, "orders", order.id), {
      status: "Servirano"
    });

    // 2. delete after short delay (smooth sync)
    setTimeout(async () => {
      await updateDoc(doc(db, "orders", order.id), {
  status: "Servirano",
  finishedAt: Date.now()
});
    }, 500);
  };

  const setStatus = async (id, status) => {
    await updateDoc(doc(db, "orders", id), { status });
  };

  const filtered = orders.filter(o =>
    filter === "SVE" ? true : o.status === filter
  );
const router = useRouter();

useEffect(() => {
  const unsub = onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.push("/login");
    }
  });

  return () => unsub();
}, []);
  return (
    <main className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-2xl font-bold">
          👨‍🍳 Admin Panel
        </h1>

        {/* FILTER */}
        <div className="flex gap-2">

          {["SVE", "Čeka", "U pripremi"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm transition
                ${filter === f
                  ? "bg-purple-600"
                  : "bg-zinc-800"
                }`}
            >
              {f}
            </button>
          ))}

        </div>

      </div>

      {/* ORDERS */}
      <div className="grid gap-4">

        {filtered.map(order => (
          <div
            key={order.id}
            className="bg-zinc-900 border border-white/10 rounded-xl p-4"
          >

            {/* HEADER */}
            <div className="flex justify-between mb-2">

              <div>
                <div className="text-sm text-gray-400">
                  Sto {order.table}
                </div>

                <div className="text-xs text-gray-500">
                  #{order.id.slice(0, 6)}
                </div>
              </div>

              <span className={
                order.status === "Čeka"
                  ? "text-yellow-400"
                  : order.status === "U pripremi"
                  ? "text-blue-400"
                  : "text-green-400"
              }>
                {order.status}
              </span>

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

              <span>Ukupno</span>
              <span className="text-yellow-400">
                {order.total} din
              </span>

            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-3">

              <button
                onClick={() => setStatus(order.id, "Čeka")}
                className="bg-yellow-500 text-black px-3 py-1 rounded"
              >
                Čeka
              </button>

              <button
                onClick={() => setStatus(order.id, "U pripremi")}
                className="bg-blue-600 px-3 py-1 rounded"
              >
                U pripremi
              </button>

              <button
                onClick={() => served(order)}
                className="bg-green-500 text-black px-3 py-1 rounded"
              >
                Posluženo
              </button>

            </div>

          </div>
        ))}

      </div>

    </main>
  );
}