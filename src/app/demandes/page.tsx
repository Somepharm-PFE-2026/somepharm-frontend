"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import DemandeModal from "./DemandeModal";

export default function DemandesPage() {
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState("");

  const fetchData = async (t: string, role: string) => {
    const endpoint = role === "MANAGER" ? "/api/demandes/all" : "/api/demandes/me";
    const res = await fetch(`http://localhost:8080${endpoint}`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (res.ok) setRequests(await res.json());
  };

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      const decoded: any = jwtDecode(t);
      setUser(decoded);
      fetchData(t, decoded.role);
    }
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-gray-800 italic uppercase">Portail Somepharm</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:scale-105 transition">
          + Nouvelle Demande
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black">
            <tr><th className="p-6">Type</th><th className="p-6">Période</th><th className="p-6">Statut</th></tr>
          </thead>
          <tbody className="divide-y">
            {requests.map((req: any) => (
              <tr key={req.idRequete} className="hover:bg-blue-50/40 transition">
                <td className="p-6 font-bold text-gray-700">{req.typeConge}</td>
                <td className="p-6 text-sm text-gray-500">{req.dateDebut} au {req.dateFin}</td>
                <td className="p-6">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black ${req.statutCycleVie === 'APPROUVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {req.statutCycleVie}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DemandeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchData(token, user?.role)} 
        token={token} 
      />
    </div>
  );
}