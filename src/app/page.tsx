"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [departements, setDepartements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Check if the user has a token. If not, kick them back to login!
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // 2. Fetch the locked data using the token
    const fetchDepartements = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/departements", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Presenting the ID Card to the Bouncer!
          },
        });

        if (!res.ok) {
          throw new Error("Session expirée ou accès refusé.");
        }

        const data = await res.json();
        setDepartements(data);
      } catch (err: any) {
        setError(err.message);
        // If the token is invalid/expired, clear it and redirect
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartements();
  }, [router]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50">Chargement...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Tableau de Bord RH</h1>
            <p className="text-slate-500">Bienvenue sur le portail Somepharm</p>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Tableau de Bord RH</h1>
            <p className="text-slate-500">Bienvenue sur le portail Somepharm</p>
            <button 
              onClick={() => router.push("/demandes")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Nouvelle Demande
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
          >
            Déconnexion
          </button>
        </div>

        {error && <div className="mb-4 text-red-500">{error}</div>}

        {/* Departments List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Départements de l'entreprise</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {departements.length === 0 ? (
              <p className="p-6 text-slate-500 text-center">Aucun département trouvé.</p>
            ) : (
              departements.map((dept) => (
                <div key={dept.idDept} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-slate-800">{dept.nomDept}</h3>
                    <span className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                      ID: {dept.idDept}
                    </span>
                  </div>
                  {dept.managerEmail && (
                    <p className="text-sm text-slate-500 mt-1">Manager: {dept.managerEmail}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}