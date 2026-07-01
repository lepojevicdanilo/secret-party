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
  setDoc
} from "firebase/firestore";

export default function TablesPage() {
  const tables = Array.from({ length: 70 }, (_, i) => i + 1);

  const [orders, setOrders] = useState([]);
  const [tablesState, setTablesState] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);
  const [search, setSearch] = useState("");
  const [reservationName, setReservationName] = useState("");

  const router = useRouter();

  // 🔐 AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });

    return () => unsub();
  }, [router]);

  // 🔥 ORDERS LIVE
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  // 🔥 TABLES LIVE
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

  // 🧠 ACTIVE ORDERS
  const hasActiveOrder = (tableId) =>
    orders.some(
      o => Number(o.table) === tableId && o.status !== "Servirano"
    );

  // 📊 COUNT ORDERS
  const getOrderCount = (tableId) =>
    orders.filter(o => Number(o.table) === tableId).length;

  // 👑 VIP LOGIC
  const getVipStatus = (tableId) => {
    const count = getOrderCount(tableId);

    if (count >= 8) return "vip";
    if (count >= 4) return "hot";
    return "normal";
  };

  // 🧠 STATUS ENGINE (tvoj sistem + VIP kompatibilan)
  const getTableStatus = (t) => {
    const reserved = tablesState[t]?.reservationName;
    const active = hasActiveOrder(t);

    if (reserved && active) return "busy_reserved";
    if (reserved) return "reserved";
    if (active) return "busy";

    return "free";
  };

  // 📊 STATS
  const stats = tables.reduce(
    (acc, t) => {
      const s = getTableStatus(t);
      const vip = getVipStatus(t);

      acc[s] = (acc[s] || 0) + 1;
      acc[vip] = (acc[vip] || 0) + 1;

      return acc;
    },
    {
      free: 0,
      busy: 0,
      reserved: 0,
      busy_reserved: 0,
      hot: 0,
      vip: 0
    }
  );

  const setTableData = async (id, data) => {
    await setDoc(doc(db, "tables", String(id)), data, { merge: true });
  };

  const openTable = (t) => {
    setSelectedTable(t);
    setReservationName(tablesState[t]?.reservationName || "");
  };

  const tableOrders = selectedTable
    ? orders.filter(o => Number(o.table) === Number(selectedTable))
    : [];

  const saveReservation = async () => {
    if (!selectedTable) return;

    await setTableData(selectedTable, {
      reservationName,
      occupied: true
    });
  };

  const clearReservation = async () => {
    if (!selectedTable) return;

    setReservationName("");

    await setTableData(selectedTable, {
      reservationName: "",
      occupied: false
    });
  };

  return (
    <main className="min-h-screen bg-black text-white p-4">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-3">
        🪑 Stolovi (VIP sistem)
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4 text-xs">

        <div className="bg-green-600/20 border border-green-500 p-2 rounded">
          🟢 Slobodni <div className="font-bold">{stats.free}</div>
        </div>

        <div className="bg-yellow-500/20 border border-yellow-500 p-2 rounded">
          🟡 Zauzeti <div className="font-bold">{stats.busy}</div>
        </div>

        <div className="bg-blue-500/20 border border-blue-500 p-2 rounded">
          🔵 Rezervisani <div className="font-bold">{stats.reserved}</div>
        </div>

        <div className="bg-red-500/20 border border-red-500 p-2 rounded">
          🔴 Mix <div className="font-bold">{stats.busy_reserved}</div>
        </div>

        <div className="bg-orange-500/20 border border-orange-500 p-2 rounded">
          🔥 HOT <div className="font-bold">{stats.hot}</div>
        </div>

        <div className="bg-yellow-400/20 border border-yellow-400 p-2 rounded">
          👑 VIP <div className="font-bold">{stats.vip}</div>
        </div>

      </div>

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Pretraži rezervacije..."
        className="w-full mb-4 p-3 rounded bg-zinc-800 border border-white/10"
      />

      {/* GRID */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">

        {tables
          .filter((t) => {
            if (!search) return true;
            const name = tablesState[t]?.reservationName?.toLowerCase() || "";
            return name.includes(search.toLowerCase());
          })
          .map((t) => {

            const status = getTableStatus(t);
            const vip = getVipStatus(t);
            const count = getOrderCount(t);

            return (
              <button
                key={t}
                onClick={() => openTable(t)}
                className={`
                  p-4 rounded-xl min-h-[90px] border relative transition active:scale-95

                  ${status === "free" && "bg-zinc-900 border-white/10"}
                  ${status === "busy" && "bg-yellow-500 text-black"}
                  ${status === "reserved" && "bg-blue-600 text-white"}
                  ${status === "busy_reserved" && "bg-red-500 text-white"}
                  ${vip === "hot" && "bg-orange-500 text-black animate-pulse"}
                  ${vip === "vip" && "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-lg scale-105"}
                `}
              >

                <div className="font-bold">{t}</div>

                <div className="text-xs">
                  {count} porudžbina
                </div>

                {vip === "vip" && (
                  <div className="absolute top-1 right-1 text-[10px] bg-black/30 px-2 rounded">
                    👑 VIP
                  </div>
                )}

                {vip === "hot" && (
                  <div className="absolute top-1 right-1 text-[10px]">
                    🔥 HOT
                  </div>
                )}

                {tablesState[t]?.reservationName && (
                  <div className="text-[10px] truncate mt-1">
                    👤 {tablesState[t].reservationName}
                  </div>
                )}

              </button>
            );
          })}
      </div>

      {/* MODAL */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center">

          <div className="w-full sm:w-[520px] h-[92vh] sm:h-auto bg-zinc-900 rounded-t-2xl sm:rounded-2xl p-4 overflow-y-auto relative">

            {/* X */}
            <button
              onClick={() => setSelectedTable(null)}
              className="absolute top-3 right-3 text-2xl"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-3">
              🪑 Sto {selectedTable}
            </h2>

            {/* INPUT */}
            <input
              value={reservationName}
              onChange={(e) => setReservationName(e.target.value)}
              placeholder="Ime rezervacije"
              className="w-full p-2 bg-black/40 rounded mb-2"
            />

            {/* SAVE */}
            <button
              onClick={saveReservation}
              className="w-full bg-blue-500 text-black py-2 rounded mb-2"
            >
              💾 Sačuvaj rezervaciju
            </button>

            {/* CLEAR */}
            <button
              onClick={clearReservation}
              className="w-full bg-gray-600 py-2 rounded mb-4"
            >
              🗑 Očisti rezervaciju
            </button>

            {/* ORDERS */}
            <div className="space-y-3 max-h-[45vh] overflow-y-auto">

              {tableOrders.length === 0 && (
                <p className="text-gray-500 text-sm">
                  Nema porudžbina
                </p>
              )}

              {tableOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-black/40 p-3 rounded-xl border border-white/10"
                >
                  <div className="flex justify-between text-xs mb-2">
                    <span>#{order.id.slice(0, 6)}</span>
                    <span className="text-green-400">{order.status}</span>
                  </div>

                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="text-yellow-400">
                        {item.price * item.quantity} din
                      </span>
                    </div>
                  ))}

                  <div className="border-t border-white/10 mt-2 pt-2 flex justify-between font-bold">
                    <span>Ukupno</span>
                    <span className="text-yellow-400">{order.total} din</span>
                  </div>

                </div>
              ))}

            </div>

          </div>
        </div>
      )}

    </main>
  );
}