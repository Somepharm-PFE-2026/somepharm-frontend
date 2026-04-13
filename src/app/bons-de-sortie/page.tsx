"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react"; // The library we just installed!
import { Shield, Clock, QrCode, ArrowRight, CheckCircle2 } from "lucide-react";

export default function BonDeSortiePage() {
  const router = useRouter();
  const [duree, setDuree] = useState(1);
  const [sorties, setSorties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    fetchMesSorties(token);
  }, [router]);

  const fetchMesSorties = async (token: string) => {
    try {
      const res = await fetch("http://localhost:8080/api/sorties/mes-sorties", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Sort to show the newest requests at the top
        setSorties(data.sort((a: any, b: any) => b.id - a.id));
      }
    } catch (err) {
      console.error("Erreur chargement sorties:", err);
    }
  };

  const demanderSortie = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`http://localhost:8080/api/sorties/demander?dureeEstimeeHeures=${duree}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        fetchMesSorties(token || "");
        setDuree(1); // Reset form
      }
    } catch (err) {
      console.error("Erreur demande:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-gray-800 italic uppercase tracking-tighter">Bons de Sortie</h1>
        <div className="bg-white shadow-sm border px-6 py-2 rounded-2xl font-bold text-blue-600 flex items-center gap-2">
          <Shield size={18} /> Accès Autorisé
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- FORMULAIRE DE DEMANDE --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2rem] shadow-xl border p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 p-3 rounded-xl text-white shadow-md">
                <Clock size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-800 uppercase">Nouvelle Sortie</h2>
            </div>

            <form onSubmit={demanderSortie} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Durée estimée (Heures)
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={duree}
                  onChange={(e) => setDuree(Number(e.target.value))}
                  className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl text-xl font-black text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-800 text-white font-black uppercase tracking-widest text-sm py-4 rounded-2xl shadow-lg hover:bg-gray-700 hover:-translate-y-1 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? "Génération..." : "Générer QR Code"} <QrCode size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* --- LISTE DES BONS ET QR CODES --- */}
        <div className="lg:col-span-2 space-y-4">
          {sorties.length === 0 ? (
             <div className="bg-white rounded-[2rem] border border-dashed border-gray-300 p-10 text-center text-gray-400 font-bold">
               Aucun bon de sortie pour le moment.
             </div>
          ) : (
            sorties.map((sortie, index) => (
              <div key={index} className="bg-white rounded-[2rem] shadow-sm border p-6 flex flex-col md:flex-row items-center gap-6 justify-between transition-all hover:shadow-md">
                
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                      sortie.statut === 'EN_ATTENTE' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      sortie.statut === 'EN_COURS' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {sortie.statut}
                    </span>
                    <span className="text-gray-400 text-sm font-bold">ID: #{sortie.id}</span>
                  </div>
                  
                  <h3 className="text-xl font-black text-gray-800">
                    Sortie de {sortie.dureeEstimeeHeures} Heure(s)
                  </h3>
                  
                  {sortie.heureSortieReelle && (
                    <p className="text-sm text-gray-500 font-bold flex items-center justify-center md:justify-start gap-1">
                      Sorti à: {new Date(sortie.heureSortieReelle).toLocaleTimeString()} 
                      {sortie.heureRetourReelle && (
                         <> <ArrowRight size={14} /> Retour à: {new Date(sortie.heureRetourReelle).toLocaleTimeString()} </>
                      )}
                    </p>
                  )}
                </div>

                {/* --- THE QR CODE DISPLAY --- */}
                <div className="bg-gray-50 p-4 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center">
                  {sortie.statut === "CLOTURE" ? (
                    <div className="w-32 h-32 flex flex-col items-center justify-center text-green-500">
                      <CheckCircle2 size={48} className="mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Validé</span>
                    </div>
                  ) : (
                    <>
                      {/* This component generates the actual QR image based on the token! */}
                      <QRCodeSVG value={sortie.tokenQr} size={120} level="H" />
                      <span className="text-[9px] text-gray-400 font-bold mt-3 uppercase tracking-widest">
                        À scanner par l'agent
                      </span>
                    </>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}