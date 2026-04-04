"use client"; // This tells Next.js we need interactivity (state & fetching)

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [matricule, setMatricule] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Call your Spring Boot API
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricule, password }),
      });

      if (!res.ok) {
        throw new Error("Identifiants incorrects. Veuillez réessayer.");
      }

      // 2. Extract the JWT Token from the JSON response
      const data = await res.json();
      
      // 3. Save the token to the browser's Local Storage
      localStorage.setItem("token", data.token);

      // 4. Redirect to the main dashboard
      router.push("/demandes");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-slate-100">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">Somepharm</h1>
          <p className="text-slate-500 mt-2">Portail RH - Connexion</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Matricule
            </label>
            <input
              type="text"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              placeholder="Ex: EMP-999"
              className="w-full rounded-lg border border-slate-300 p-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 p-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300 transition-all"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
        
      </div>
    </main>
  );
}