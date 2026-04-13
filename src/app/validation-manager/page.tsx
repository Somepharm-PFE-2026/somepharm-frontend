"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, XCircle, CheckCircle, Clock } from "lucide-react";

export default function ValidationManagerPage() {
  const router = useRouter();
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    fetchPendingRequests(token);
  }, [router]);

  const fetchPendingRequests = async (token: string) => {
    try {
      // NOTE: Adjust this URL to match your exact Java endpoint for Manager requests
      const res = await fetch("http://localhost:8080/api/requests/pending-manager", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDemandes(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8080/api/requests/${id}/approve-manager`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDemandes(demandes.filter((d) => d.id !== id)); // Remove from list
        alert("Demande approuvée avec succès !");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-10 font-black text-blue-600 animate-pulse">CHARGEMENT DES DEMANDES...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-800 italic uppercase tracking-tighter">Validation Équipe</h1>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Approbation de niveau 1 (Manager)</p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
        {demandes.length === 0 ? (
           <div className="text-center py-20">
             <CheckSquare size={48} className="mx-auto text-gray-300 mb-4" />
             <p className="text-gray-400 font-black uppercase tracking-widest">Aucune demande en attente</p>
           </div>
        ) : (
          <div className="space-y-4">
            {demandes.map((demande) => (
              <div key={demande.id} className="border-2 border-gray-50 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-blue-100 transition-colors">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                      {demande.typeConge}
                    </span>
                    <span className="text-sm font-black text-gray-800 uppercase">{demande.employe?.matricule}</span>
                  </div>
                  <p className="text-xs font-bold text-gray-500">
                    Période: {demande.dateDebut} au {demande.dateFin}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => handleApprove(demande.id)}
                    className="flex-1 md:flex-none bg-green-50 text-green-600 hover:bg-green-500 hover:text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} /> Approuver
                  </button>
                  <button 
                    className="flex-1 md:flex-none bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} /> Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}