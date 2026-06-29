"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function login() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err) {
      alert("Pogrešan login");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">

      <div className="bg-zinc-800 p-6 rounded w-[320px]">

        <h1 className="text-xl font-bold mb-4">🔐 Admin Login</h1>

        <input
          className="w-full p-2 mb-2 text-black"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 mb-4 text-black"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full bg-blue-600 py-2 rounded"
        >
          Login
        </button>

      </div>

    </main>
  );
}