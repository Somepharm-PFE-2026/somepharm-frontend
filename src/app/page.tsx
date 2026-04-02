"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [departements, setDepartements] = useState<any[]>([]);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // NEW: State to hold the user's role
  const [userRole, setUserRole] = useState<string>("EMPLOYEE"); 

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // --- NEW: DECODE THE JWT TO FIND THE ROLE ---
    try {
      // Get the middle part of the token (the payload)
      const payloadBase64 = token.split('.')[1];
      // Decode the Base64 string into a JSON object
      const decodedPayload = JSON.parse(atob(payloadBase64));
      
      // Look for the role. Spring Security usually puts it in 'role', 'roles', or 'authorities'
      const roleData = decodedPayload.role || decodedPayload.authorities || "";
      
      // Check if the word MANAGER exists anywhere in that claim
      if (JSON.stringify(roleData).includes("MANAGER")) {
        setUserRole("MANAGER");
      } else {
        setUserRole("EMPLOYEE");
      }
    } catch (e) {
      console.error("Erreur de décodage du token", e);
    }
    // --------------------------------------------

    try {
      const deptRes = await fetch("http://localhost:8080/api/departements", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      
      const demandesRes = await fetch("http://localhost:8080/api/demandes", {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!deptRes.ok || !demandesRes.ok) throw new Error("Erreur de chargement des données.");

      setDepartements(await deptRes.json());
      setDemandes(await demandesRes.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    } else {
      fetchData();
    }
  }, [router, fetchData]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8080/api/demandes/${id}/statut?statut=${newStatus}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour.");
      fetchData(); 
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold shadow-sm">En Attente</span>;
      case 'APPROUVE': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold shadow-sm">Approuvé</span>;
      case 'REFUSE': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold shadow-sm">Refusé</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50">Chargement...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Tableau de Bord RH</h1>
            <p className="text-slate-500">Bienvenue sur le portail Somepharm</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => router.push("/demandes")} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">+ Nouvelle Demande</button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors">Déconnexion</button>
          </div>
        </div>

        {error && <div className="text-red-500">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Gestion des Congés</h2>
              
              {/* Optional: Show a badge so the user knows what role they are logged in as */}
              <span className="text-xs font-bold px-3 py-1 bg-slate-200 text-slate-600 rounded-full">
                Rôle: {userRole}
              </span>

            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold">Début</th>
                    <th className="p-4 font-semibold">Fin</th>
                    <th className="p-4 font-semibold">Statut</th>
                    
                    {/* ONLY render the Actions header if the user is a MANAGER */}
                    {userRole === "MANAGER" && (
                      <th className="p-4 font-semibold text-right">Actions (Manager)</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {demandes.length === 0 ? (
                    <tr><td colSpan={userRole === "MANAGER" ? 5 : 4} className="p-6 text-center text-slate-500">Aucune demande trouvée.</td></tr>
                  ) : (
                    demandes.map((demande, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-800 font-medium">{demande.typeConge}</td>
                        <td className="p-4 text-slate-600">{demande.dateDebut}</td>
                        <td className="p-4 text-slate-600">{demande.dateFin}</td>
                        <td className="p-4">{getStatusBadge(demande.statutCycleVie)}</td>
                        
                        {/* ONLY render the action buttons if the user is a MANAGER */}
                        {userRole === "MANAGER" && (
                          <td className="p-4 text-right">
                            {demande.statutCycleVie === 'EN_ATTENTE' ? (
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => handleUpdateStatus(demande.idRequete, 'APPROUVE')}
                                  className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600 transition-colors shadow-sm"
                                >
                                  ✓ Approuver
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(demande.idRequete, 'REFUSE')}
                                  className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition-colors shadow-sm"
                                >
                                  ✕ Refuser
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Traitée</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar Area: Departments */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Départements</h2>
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