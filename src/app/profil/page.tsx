"use client";
import { useEffect, useState } from "react";
import { User, Mail, Building, Fingerprint, Shield } from "lucide-react";

export default function ProfilPage() {
  const [profil, setProfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchProfil(token);
    }
  }, []);

  const fetchProfil = async (token: string) => {
    try {
      const res = await fetch("http://localhost:8080/api/utilisateurs/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfil(data);
      }
    } catch (err) {
      console.error("Erreur chargement profil:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 font-black animate-pulse text-blue-600">CHARGEMENT DU PROFIL...</div>;
  if (!profil) return <div className="p-10 text-red-500 font-bold uppercase tracking-widest">Erreur : Impossible de charger le profil.</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-800 italic uppercase tracking-tighter">Mon Profil</h1>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Espace personnel Somepharm</p>
      </div>

      {/* Profile Card */}
      <div className="max-w-4xl bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Column: Avatar & Status */}
        <div className="bg-gray-900 text-white p-10 md:w-1/3 flex flex-col items-center justify-center text-center relative overflow-hidden">
           {/* Background watermark icon */}
           <div className="absolute -right-10 -top-10 opacity-5 text-white">
             <User size={250} />
           </div>
           
           <div className="w-32 h-32 bg-blue-600 rounded-[2rem] flex items-center justify-center text-5xl font-black shadow-2xl mb-6 z-10 border-4 border-gray-800">
              {profil.matricule ? profil.matricule.substring(0, 2).toUpperCase() : "SP"}
           </div>
           
           <h2 className="text-2xl font-black uppercase tracking-widest z-10">{profil.matricule}</h2>
           
           <span className="mt-4 px-4 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/30 z-10">
             {profil.role?.nomRole || "EMPLOYEE"}
           </span>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="p-10 md:w-2/3">
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-8 border-b-2 border-gray-100 pb-4">
            Informations Professionnelles
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600 shadow-sm"><Mail size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adresse Email</p>
                <p className="text-sm font-bold text-gray-800 mt-1">{profil.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-50 p-3 rounded-xl text-purple-600 shadow-sm"><Building size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Département</p>
                <p className="text-sm font-bold text-gray-800 mt-1">{profil.departement || "Non assigné"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-50 p-3 rounded-xl text-green-600 shadow-sm"><Fingerprint size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Solde de Congés</p>
                <p className="text-sm font-bold text-gray-800 mt-1">
                  {profil.soldeConges ? profil.soldeConges.toFixed(1) : 0} Jours
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-amber-50 p-3 rounded-xl text-amber-600 shadow-sm"><Shield size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut du Compte</p>
                <p className="text-sm font-bold text-gray-800 mt-1">{profil.statutCompte || "ACTIF"}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
}