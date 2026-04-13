"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import DemandeModal from "./DemandeModal";
import { X, Check, AlertCircle } from "lucide-react";

export default function DemandesPage() {
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState("");
  const [userSolde, setUserSolde] = useState<number | string>("--");
  
  const [refuseId, setRefuseId] = useState<number | null>(null);
  const [refuseComment, setRefuseComment] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      const decoded: any = jwtDecode(savedToken);
      setUser(decoded);
      fetchData(savedToken, decoded.role);
    }
  }, []);

  const fetchData = async (t: string, role: string) => {
    const endpoint = role === "MANAGER" || role === "HR_ADMIN" ? "/api/demandes/all" : "/api/demandes/me";
    try {
      const res = await fetch(`http://localhost:8080${endpoint}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) setRequests(await res.json());

      const profileRes = await fetch(`http://localhost:8080/api/utilisateurs/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (profileRes.ok) {
        const data = await profileRes.json();
        setUserSolde(data.soldeConges ?? 0);
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdateStatus = async (id: number, newStatus: string, commentaire: string = "") => {
    try {
      const res = await fetch(`http://localhost:8080/api/demandes/${id}/statut?statut=${newStatus}&commentaire=${encodeURIComponent(commentaire)}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        setRefuseId(null);
        setRefuseComment("");
        fetchData(token, user?.role);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-gray-800 italic uppercase">Somepharm Portal</h1>
        <div className="bg-white shadow-sm border px-6 py-2 rounded-2xl font-bold text-blue-600">
          {user?.sub} ({user?.role})
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border-b-8 border-blue-600">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-4">Solde de Congé Actuel</p>
          <p className="text-7xl font-black text-gray-900 flex items-baseline gap-2">
            {typeof userSolde === 'number' ? userSolde.toFixed(2) : userSolde} <span className="text-2xl font-bold text-gray-300 italic uppercase">Jours</span>
          </p> 
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border-b-8 border-purple-500">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-4">Dossiers Enregistrés</p>
          <p className="text-7xl font-black text-gray-800">{requests.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border">
        <div className="p-8 bg-gray-50/50 border-b flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-700 italic uppercase tracking-tighter">Historique & Actions</h2>
          {user?.role === "EMPLOYEE" && (
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition">
              + NOUVELLE DEMANDE
            </button>
          )}
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[11px] uppercase font-black border-b">
            <tr>
              <th className="p-8">Détails de la Demande</th>
              <th className="p-8">Période</th>
              <th className="p-8">Justification (Employé)</th>
              <th className="p-8">Statut</th>
              {(user?.role === "MANAGER" || user?.role === "HR_ADMIN") && <th className="p-8 text-center">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((req: any) => (
              <tr key={req.idRequete} className="hover:bg-blue-50/30 transition-colors">
                
                {/* DÉTAILS DE LA DEMANDE (Type + Employé) */}
                <td className="p-8">
                  <p className="font-black text-gray-900">{req.typeConge}</p>
                  {(user?.role === "MANAGER" || user?.role === "HR_ADMIN") && (
                    <p className="text-xs text-blue-600 font-bold mt-1 bg-blue-50 inline-block px-2 py-1 rounded-md">
                      De: {req.demandeurMatricule}
                    </p>
                  )}
                </td>

                <td className="p-8 text-sm text-gray-500 font-bold">{req.dateDebut} <span className="text-blue-300 mx-2">→</span> {req.dateFin}</td>
                
                {/* JUSTIFICATION (Le motif écrit par l'employé) */}
                <td className="p-8 text-xs italic text-gray-600 max-w-[200px] truncate" title={req.motif}>
                  {req.motif || "Aucune justification fournie."}
                </td>

                <td className="p-8">
                  <div className="flex flex-col gap-1 items-start">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter ${
                      req.statutCycleVie === 'APPROUVE' ? 'bg-green-100 text-green-700' : 
                      req.statutCycleVie === 'REFUSE' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {req.statutCycleVie}
                    </span>
                    {/* Affiche le commentaire du Manager s'il y en a un */}
                    {req.commentaireAction && (
                      <span className="text-[9px] text-gray-400 font-bold italic mt-1 border-l-2 border-gray-200 pl-2">
                        Note RH: {req.commentaireAction}
                      </span>
                    )}
                  </div>
                </td>

                {user?.role === "MANAGER" && (
                  <td className="p-8 text-center">
                    {req.statutCycleVie === "EN_ATTENTE_MANAGER" ? (
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => handleUpdateStatus(req.idRequete, 'VALIDE_MANAGER')} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-md"><Check size={16} /></button>
                        <button onClick={() => setRefuseId(req.idRequete)} className="bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition shadow-md"><X size={16} /></button>
                      </div>
                    ) : <span className="text-gray-300 font-bold text-[10px] uppercase">Traité</span>}
                  </td>
                )}

                {user?.role === "HR_ADMIN" && (
                  <td className="p-8 text-center">
                    {req.statutCycleVie === "VALIDE_MANAGER" ? (
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => handleUpdateStatus(req.idRequete, 'APPROUVE')} className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition shadow-md"><Check size={16} /></button>
                        <button onClick={() => setRefuseId(req.idRequete)} className="bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition shadow-md"><X size={16} /></button>
                      </div>
                    ) : <span className="text-gray-300 font-bold text-[10px] uppercase">Traité</span>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {refuseId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-red-50 animate-in zoom-in duration-200">
            <div className="bg-red-600 p-8 text-white flex items-center gap-4">
              <AlertCircle size={32} />
              <div>
                <h3 className="font-black uppercase tracking-widest text-lg italic">Refuser le dossier</h3>
                <p className="text-red-100 text-xs font-bold">Un motif est obligatoire pour cette action.</p>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Motif du refus</label>
              <textarea 
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-medium text-gray-700 focus:border-red-500 outline-none transition-all h-32 resize-none"
                placeholder="Ex: Période de forte activité..."
                value={refuseComment}
                onChange={(e) => setRefuseComment(e.target.value)}
              />
              <div className="flex gap-4 pt-2">
                <button onClick={() => {setRefuseId(null); setRefuseComment("");}} className="flex-1 px-6 py-4 rounded-xl font-black text-gray-400 uppercase text-xs hover:bg-gray-100 transition">Annuler</button>
                <button 
                  onClick={() => handleUpdateStatus(refuseId, 'REFUSE', refuseComment)} 
                  disabled={!refuseComment.trim()}
                  className="flex-[2] bg-red-600 text-white px-6 py-4 rounded-xl font-black uppercase text-xs shadow-lg hover:bg-red-700 transition disabled:opacity-30"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <DemandeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => fetchData(token, user?.role)} token={token} />
    </div>
  );
}