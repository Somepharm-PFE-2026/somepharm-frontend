"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [departements, setDepartements] = useState<any[]>([]);
  const [demandes, setDemandes] = useState<any[]>([]); // New state for leave requests!
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch Departments
        const deptRes = await fetch("http://localhost:8080/api/departements", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        
        // Fetch Leave Requests (Demandes)
        const demandesRes = await fetch("http://localhost:8080/api/demandes", {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (!deptRes.ok || !demandesRes.ok) throw new Error("Erreur de chargement des données.");

        const deptData = await deptRes.json();
        const demandesData = await demandesRes.json();

        setDepartements(deptData);
        setDemandes(demandesData);

      } catch (err: any) {
        setError(err.message);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Helper function to color-code the status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">En Attente</span>;
      case 'APPROUVE': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Approuvé</span>;
      case 'REFUSE': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Refusé</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50">Chargement...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Tableau de Bord RH</h1>
            <p className="text-slate-500">Bienvenue sur le portail Somepharm</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => router.push("/demandes")}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Nouvelle Demande
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {error && <div className="text-red-500">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area: Leave Requests */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Historique des Congés</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Début</th>
                    <th className="p-4 font-medium">Fin</th>
                    <th className="p-4 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {demandes.length === 0 ? (
                    <tr><td colSpan={4} className="p-6 text-center text-slate-500">Aucune demande trouvée.</td></tr>
                  ) : (
                    demandes.map((demande, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-800 font-medium">{demande.typeConge}</td>
                        <td className="p-4 text-slate-600">{demande.dateDebut}</td>
                        <td className="p-4 text-slate-600">{demande.dateFin}</td>
                        <td className="p-4">{getStatusBadge(demande.statutCycleVie)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar Area: Departments */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-fit">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Départements</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {departements.map((dept) => (
                <div key={dept.idDept} className="p-4 hover:bg-slate-50 transition-colors">
                  <h3 className="font-medium text-slate-800">{dept.nomDept}</h3>
                  {dept.managerEmail && <p className="text-xs text-slate-500 mt-1">Mgr: {dept.managerEmail}</p>}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}