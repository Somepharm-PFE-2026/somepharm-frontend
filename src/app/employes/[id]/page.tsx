"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User, Mail, Building, Fingerprint, Shield, Phone, ArrowLeft } from "lucide-react";

export default function EmployeDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [profil, setProfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    fetchEmployeDetails(token);
  }, [id]);

  const fetchEmployeDetails = async (token: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/utilisateurs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProfil(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 font-black animate-pulse text-blue-600">CHARGEMENT DU DOSSIER...</div>;
  if (!profil) return <div className="p-10 text-red-500 font-bold">Dossier introuvable.</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      
      <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold text-sm transition-colors">
        <ArrowLeft size={16} /> Retour à l'annuaire
      </button>

      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-800 italic uppercase tracking-tighter">Dossier Employé</h1>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Vue Administrative HR / Manager</p>
      </div>

      <div className="max-w-4xl bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Avatar Column */}
        <div className="bg-gray-900 text-white p-10 md:w-1/3 flex flex-col items-center justify-center text-center relative">
           <div className="w-32 h-32 bg-blue-600 rounded-[2rem] flex items-center justify-center text-5xl font-black shadow-2xl mb-6 border-4 border-gray-800">
              {profil.prenom && profil.nom 
                ? `${profil.prenom.charAt(0)}${profil.nom.charAt(0)}`.toUpperCase() 
                : profil.matricule?.substring(0, 2).toUpperCase()}
           </div>
           <h2 className="text-2xl font-black uppercase tracking-widest leading-tight">
             {profil.prenom} {profil.nom}
           </h2>
           <p className="text-gray-400 font-bold text-xs mt-2 uppercase">{profil.matricule}</p>
           
           <span className="mt-4 px-4 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
             {profil.role?.nomRole || "EMPLOYEE"}
           </span>
        </div>

        {/* Right Info Column */}
        <div className="p-10 md:w-2/3">
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-8 border-b-2 border-gray-100 pb-4">
            Informations Générales
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Mail size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Email</p>
                <p className="text-sm font-bold text-gray-800 mt-1">{profil.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-50 p-3 rounded-xl text-green-600"><Phone size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Téléphone</p>
                <p className="text-sm font-bold text-gray-800 mt-1">{profil.telephone || "Non renseigné"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-50 p-3 rounded-xl text-purple-600"><Building size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Département</p>
                <p className="text-sm font-bold text-gray-800 mt-1">{profil.departement || "Non assigné"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-amber-50 p-3 rounded-xl text-amber-600"><Fingerprint size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">Solde Congés</p>
                <p className="text-sm font-bold text-gray-800 mt-1">{profil.soldeConges?.toFixed(1) || 0} Jours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}