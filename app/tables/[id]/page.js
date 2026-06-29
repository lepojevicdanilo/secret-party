"use client";

import { useEffect, useState, use } from "react";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export default function TableOrdersPage({ params }) {

  const { id: tableId } = use(params);

  const [orders, setOrders] = useState([]);

  useEffect(() => {

    const q = query(
      collection(db, "orders"),
      where("table", "==", String(tableId))
    );

    const unsub = onSnapshot(q, (snap) => {
      setOrders(
        snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => unsub();

  }, [tableId]);

  const total = orders.reduce((sum, order) => {
    return sum + (order.total || 0);
  }, 0);

  return (
    <main className="min-h-screen bg-black text-white p-6 flex justify-center">

      <div className="w-[500px]">

        {/* HEADER */}
        <h1 className="text-2xl font-bold mb-2">
          🪑 Sto {tableId}
        </h1>

        <p className="text-gray-400 mb-6">
          Porudžbine za ovaj sto
        </p>

        {/* ORDERS */}
        {orders.length === 0 && (
          <p className="text-gray-500">
            Nema porudžbina za ovaj sto
          </p>
        )}

        <div className="space-y-4">

          {orders.map(order => (
            <div
              key={order.id}
              className="bg-zinc-900 border border-white/10 p-4 rounded-xl"
            >

              {/* STATUS */}
              <div className="flex justify-between mb-2">

                <span className="text-sm text-gray-400">
                  #{order.id.slice(0, 6)}
                </span>

                <span className={`text-sm font-bold ${
                  order.status === "Čeka"
                    ? "text-yellow-400"
                    : order.status === "U pripremi"
                    ? "text-blue-400"
                    : "text-green-400"
                }`}>
                  {order.status}
                </span>

              </div>

              {/* ITEMS */}
              <div className="space-y-1">

                {order.items?.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>

                    <span className="text-yellow-400">
                      {item.price * item.quantity} din
                    </span>
                  </div>
                ))}

              </div>

              {/* TOTAL */}
              <div className="mt-3 border-t border-white/10 pt-2 flex justify-between font-bold">

                <span>Ukupno</span>

                <span className="text-yellow-400">
                  {order.total} din
                </span>

              </div>

            </div>
          ))}

        </div>

        {/* TOTAL ALL */}
        <div className="mt-6 text-center text-xl font-bold text-yellow-400">
          SVE UKUPNO: {total} din
        </div>

      </div>

    </main>
  );
}