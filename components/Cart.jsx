"use client";

export default function Cart({
  cart,
  cartOpen,
  setCartOpen,
  remove,
  add,
  total,
  sendOrder
}) {

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-end">

      <div className="w-full sm:w-[420px] h-full bg-zinc-950 p-4 overflow-y-auto">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            🛒 Korpa
          </h2>

          <button
            onClick={() => setCartOpen(false)}
            className="text-red-400 text-xl"
          >
            ✕
          </button>
        </div>


        {cart.length === 0 && (
          <p className="text-gray-400">
            Korpa je prazna
          </p>
        )}


        {cart.map(item => (
          <div
            key={item.id}
            className="bg-white/5 p-3 rounded-xl mb-3"
          >

            <div className="flex justify-between">

              <div>
                <div className="font-semibold">
                  {item.name}
                </div>

                <div className="text-xs text-gray-400">
                  x{item.quantity}
                </div>
              </div>


              <div className="text-yellow-400 font-bold">
                {item.price * item.quantity} din
              </div>

            </div>


            <div className="flex gap-2 mt-2">

              <button
                onClick={() => remove(item.id)}
                className="bg-gray-700 px-3 py-1 rounded"
              >
                −
              </button>


              <button
                onClick={() => add(item)}
                className="bg-green-600 px-3 py-1 rounded text-black font-bold"
              >
                +
              </button>

            </div>

          </div>
        ))}


        <div className="mt-6 border-t border-white/10 pt-4">

          <div className="text-yellow-400 font-bold text-lg">
            Ukupno: {total} din
          </div>


          <button
            onClick={sendOrder}
            className="w-full mt-3 bg-blue-600 py-3 rounded-xl font-bold"
          >
            🚀 Poruči
          </button>

        </div>


      </div>

    </div>
  );
}