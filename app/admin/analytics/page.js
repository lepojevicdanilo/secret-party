"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Analytics() {

  const [orders, setOrders] = useState([]);

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

  // 💰 TOTAL REVENUE
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.total || 0),
    0
  );

  // 📦 TOTAL ORDERS
  const totalOrders = orders.length;

  // 🍔 BEST SELLERS
  const itemCount = {};

  orders.forEach(order => {
    order.items?.forEach(item => {
      itemCount[item.name] =
        (itemCount[item.name] || 0) + item.quantity;
    });
  });

  const bestSelling = Object.entries(itemCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 🪑 TABLE REVENUE
  const tableStats = {};

  orders.forEach(order => {
    tableStats[order.table] =
      (tableStats[order.table] || 0) + (order.total || 0);
  });

  return (
    <main className="min-h-screen bg-black text-white p-6">

      <h1 className="text-2xl font-bold mb-6">
        📊 Analytics
      </h1>

      {/* 💰 REVENUE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-zinc-800 p-4 rounded">
          <h2 className="text-gray-400">Zarada</h2>
          <p className="text-2xl text-yellow-400 font-bold">
            {totalRevenue} din
          </p>
        </div>

        <div className="bg-zinc-800 p-4 rounded">
          <h2 className="text-gray-400">Porudžbine</h2>
          <p className="text-2xl text-blue-400 font-bold">
            {totalOrders}
          </p>
        </div>

        <div className="bg-zinc-800 p-4 rounded">
          <h2 className="text-gray-400">Prosečno po porudžbini</h2>
          <p className="text-2xl text-green-400 font-bold">
            {totalOrders ? Math.round(totalRevenue / totalOrders) : 0} din
          </p>
        </div>

      </div>

      {/* 🍔 BEST SELLERS */}
      <div className="bg-zinc-800 p-4 rounded mb-6">

        <h2 className="text-lg font-bold mb-3">
          🔥 Najprodavanije
        </h2>

        {bestSelling.map(([name, count]) => (
          <div key={name} className="flex justify-between">
            <span>{name}</span>
            <span className="text-yellow-400">{count}</span>
          </div>
        ))}

      </div>

      {/* 🪑 TABLE STATS */}
      <div className="bg-zinc-800 p-4 rounded">

        <h2 className="text-lg font-bold mb-3">
          🪑 Promet po stolu
        </h2>

        {Object.entries(tableStats).map(([table, value]) => (
          <div key={table} className="flex justify-between">
            <span>Sto {table}</span>
            <span className="text-green-400">{value} din</span>
          </div>
        ))}

      </div>

    </main>
  );
}