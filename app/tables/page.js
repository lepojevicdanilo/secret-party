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
  setDoc
} from "firebase/firestore";

export default function TablesPage() {

  const tables = Array.from({ length: 70 }, (_, i) => i + 1);

  const [orders, setOrders] = useState([]);
  const [tablesState, setTablesState] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);

  // 🔥 LOAD ORDERS
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

  // 🔥 LOAD TABLES STATE
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "tables"), (snap) => {
      const data = {};
      snap.docs.forEach(d => {
        data[d.id] = d.data();
      });
      setTablesState(data);
    });

    return () => unsub();
  }, []);

  // 📦 FILTER ORDERS
  const tableOrders = selectedTable
    ? orders.filter(o => Number(o.table) === Number(selectedTable))
    : [];

  const getStatusColor = (status) => {
    if (status === "Čeka") return "text-yellow-400";
    if (status === "U pripremi") return "text-blue-400";
    return "text-green-400";
  };
const router = useRouter();

useEffect(() => {
  const unsub = onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.push("/login");
    }
  });

  return () => unsub();
}, []);
  const hasActiveOrder = (tableId) => {
    return orders.some(
      o =>
        Number(o.table) === tableId &&
        o.status !== "Servirano"
    );
  };

  const setTableOccupied = async (id, value) => {
    await setDoc(doc(db, "tables", String(id)), {
      occupied: value
    });
  };

  const markServed = async (orderId) => {
    await updateDoc(doc(db, "orders", orderId), {
      status: "Servirano"
    });
  };
    
const setTableStatus = async (id, value) => {
  await setDoc(doc(db, "tables", String(id)), {
    occupied: value
  });
};
  return (
    <main className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl font-bold mb-6">
        🪑 Stolovi
      </h1>

      {/* TABLE GRID */}
      <div className="grid grid-cols-7 gap-3">

        {tables.map(t => {

          const occupied = tablesState[t]?.occupied;
          const activeOrder = hasActiveOrder(t);

          return (
            <button
              key={t}
              onClick={() => setSelectedTable(t)}
              onDoubleClick={() =>
                setTableOccupied(t, !occupied)
              }
              className={`
                p-4 rounded-xl border transition active:scale-95
                ${activeOrder
                  ? "bg-yellow-500 text-black"
                  : occupied
                  ? "bg-green-600 text-black"
                  : "bg-zinc-900 border-white/10"
                }
              `}
            >
              <div className="font-bold">
                {t}
              </div>

              <div className="text-xs">
                {occupied ? "Zauzet" : "Slobodan"}
              </div>

            </button>
          );
        })}

      </div>

      {/* MODAL */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="w-[520px] bg-zinc-900 border border-white/10 rounded-2xl p-5 relative">

            <button
              onClick={() => setSelectedTable(null)}
              className="absolute top-3 right-3"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">
              🪑 Sto {selectedTable} – istorija
            </h2>
<div className="flex gap-2 mb-4">

  <button
    onClick={() => setTableStatus(selectedTable, true)}
    className="bg-green-500 text-black px-3 py-1 rounded"
  >
    🟢 Uzmi sto
  </button>

  <button
    onClick={() => setTableStatus(selectedTable, false)}
    className="bg-gray-600 px-3 py-1 rounded"
  >
    ⚫ Oslobodi
  </button>

</div>
            <div className="space-y-3 max-h-[350px] overflow-y-auto">

              {tableOrders.length === 0 && (
                <p className="text-gray-500">
                  Nema porudžbina
                </p>
              )}

              {tableOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-black/40 p-3 rounded-xl border border-white/10"
                >

                  <div className="flex justify-between mb-2">

                    <span className="text-xs text-gray-400">
                      #{order.id.slice(0, 6)}
                    </span>

                    <span className={getStatusColor(order.status)}>
                      {order.status}
                    </span>

                  </div>

                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {item.name} × {item.quantity}
                      </span>

                      <span className="text-yellow-400">
                        {item.price * item.quantity} din
                      </span>
                    </div>
                  ))}

                  <div className="mt-2 border-t border-white/10 pt-2 flex justify-between font-bold">

                    <span>Ukupno</span>

                    <span className="text-yellow-400">
                      {order.total} din
                    </span>

                  </div>

                  {order.status !== "Servirano" && (
                    <button
                      onClick={() => markServed(order.id)}
                      className="mt-2 bg-green-500 text-black px-3 py-1 rounded"
                    >
                      Posluženo
                    </button>
                  )}

                </div>
              ))}

            </div>

          </div>

        </div>
      )}

    </main>
  );
}