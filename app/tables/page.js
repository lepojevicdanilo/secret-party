"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Tables() {

  const [orders, setOrders] = useState([]);
  const router = useRouter();

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

function getTableStatus(tableId) {

  const order = orders
    .filter(o => String(o.table) === String(tableId))
    .sort((a, b) => b.time - a.time)[0];

  if (!order) return "free";

  return order.status;
}

  const tables = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <main className="min-h-screen bg-black text-white p-6">

      <h1 className="text-2xl font-bold mb-6">
        🍻 Stolovi
      </h1>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-4">

        {tables.map(table => {

          const status = getTableStatus(table);

          return (
            <div
              key={table}
              onClick={() => router.push(`/table/${table}`)}
              className={`
                p-6 rounded text-center cursor-pointer
                font-bold transition
                ${status === "Čeka" && "bg-yellow-500 text-black"}
                ${status === "U pripremi" && "bg-blue-600"}
                ${status === "Spremno" && "bg-green-600"}
                ${status === "Posluženo" && "bg-gray-600"}
                ${status === "free" && "bg-zinc-800"}
              `}
            >
              <div className="text-xl">Sto {table}</div>
              <div className="text-xs mt-1">{status}</div>
            </div>
          );

        })}

      </div>

    </main>
  );
}