"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { 
  AlertTriangle, Calendar, Clock, Users, UserMinus, 
  ArrowRight, FileText, Fingerprint, Timer, CheckCircle2
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({ absencesAujourdhui: [], alertesUrgentes: [], totalEnAttente: 0, dateDuJour: "" });
  const [loading, setLoading] = useState(true);
  
  // --- NEW: Pointage States ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pointage, setPointage] = useState<any>(null);
  const [loadingPointage, setLoadingPointage] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      setUser(decoded);
      fetchDashboardData(token);
      fetchPointageStatus(token); // Fetch punch status on load
    }
    
    // Live digital clock ticker
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async (token: string) => {
    try {
      const res = await fetch("http://localhost:8080/api/dashboard/stats", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setStats(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // --- NEW: Fetch Pointage Status ---
  const fetchPointageStatus = async (token: string) => {
    try {
      const res = await fetch("http://localhost:8080/api/pointage/statut-jour", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.text();
        if (data) setPointage(JSON.parse(data));
      }
    } catch (err) { console.error("Erreur pointage:", err); }
  };

  // --- NEW: Handle Pointage Click ---
  const handlePointage = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoadingPointage(true);
    try {
      const res = await fetch("http://localhost:8080/api/pointage/action", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchPointageStatus(token);
    } catch (err) { console.error(err); } finally { setLoadingPointage(false); }
  };

  const telechargerAttestation = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8080/api/documents/attestation", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Attestation_Travail.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="p-10 font-black animate-pulse text-blue-600">CHARGEMENT DU PORTAIL...</div>;

  // Formatting the live clock
  const timeString = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-800 italic uppercase tracking-tighter">Tableau de Bord</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Situation Somepharm — {stats.dateDuJour}</p>
        </div>
      </header>

      {/* ⏰ NEW: WIDGET POINTAGE (TIME & ATTENDANCE) */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl mb-10 flex flex-col md:flex-row items-center justify-between gap-8 border-4 border-gray-800 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -right-20 -top-20 opacity-5 text-white"><Fingerprint size={300} /></div>
        
        <div className="flex items-center gap-6 z-10">
          <div className="bg-gray-800 p-5 rounded-3xl text-blue-400 shadow-inner">
            <Timer size={36} />
          </div>
          <div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-1">Heure Locale Serveur</p>
            <h2 className="text-5xl font-black text-white tracking-tighter font-mono">{timeString}</h2>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end z-10 w-full md:w-auto">
          {!pointage ? (
             <button 
               onClick={handlePointage} disabled={loadingPointage}
               className="w-full md:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_0_40px_-10px_#2563eb] hover:bg-blue-500 hover:scale-105 transition-all flex items-center gap-3"
             >
               <Fingerprint size={20} /> Pointer l'Entrée
             </button>
          ) : !pointage.heureSortie ? (
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="text-right hidden md:block">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Entrée validée à</p>
                <p className="text-white font-mono font-bold">{pointage.heureEntree.substring(0,5)}</p>
              </div>
              <button 
                onClick={handlePointage} disabled={loadingPointage}
                className="w-full md:w-auto bg-amber-500 text-gray-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_0_40px_-10px_#f59e0b] hover:bg-amber-400 hover:scale-105 transition-all flex items-center gap-3"
              >
                <Fingerprint size={20} /> Pointer la Sortie
              </button>
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 px-8 py-4 rounded-2xl flex items-center gap-4 w-full md:w-auto">
               <CheckCircle2 className="text-green-500" size={24} />
               <div>
                 <p className="text-green-500 font-black uppercase tracking-widest text-xs">Journée Terminée</p>
                 <p className="text-gray-400 text-[10px] font-bold mt-1">
                   Entrée: {pointage.heureEntree.substring(0,5)} | Sortie: {pointage.heureSortie.substring(0,5)}
                 </p>
               </div>
            </div>
          )}

          {/* Status Badge */}
          {pointage && pointage.statut === "EN_RETARD" && (
            <span className="mt-3 bg-red-900/50 text-red-400 border border-red-800 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
              Arrivée après 08h30 (Retard enregistré)
            </span>
          )}
          {pointage && pointage.statut === "A_L_HEURE" && (
            <span className="mt-3 bg-green-900/50 text-green-400 border border-green-800 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
              Ponctualité respectée
            </span>
          )}
        </div>
      </div>

      {/* 🚨 URGENT ALERTS */}
      {stats.alertesUrgentes.length > 0 && (
        <div className="mb-8 animate-in slide-in-from-top duration-500">
          <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] flex items-center gap-6 shadow-sm">
            <div className="bg-red-600 p-4 rounded-2xl text-white shadow-lg shadow-red-100"><AlertTriangle size={28} /></div>
            <div>
              <h3 className="text-red-900 font-black uppercase text-xs tracking-widest">Alerte Prioritaire : Poste à pourvoir</h3>
              <p className="text-red-600 font-bold text-sm">Attention, {stats.alertesUrgentes.length} absence(s) critique(s) signalée(s) aujourd'hui.</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-amber-400">
          <div className="flex justify-between items-center mb-4">
            <Clock className="text-amber-500" size={24} />
            <span className="text-[10px] font-black bg-amber-50 text-amber-600 px-3 py-1 rounded-full uppercase">Action Requise</span>
          </div>
          <p className="text-6xl font-black text-gray-900">{stats.totalEnAttente}</p>
          <p className="text-gray-400 text-xs font-bold uppercase mt-2">Demandes en attente</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-blue-600">
          <div className="flex justify-between items-center mb-4">
            <UserMinus className="text-blue-600" size={24} />
            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase">Hors Poste</span>
          </div>
          <p className="text-6xl font-black text-gray-900">{stats.absencesAujourdhui.length}</p>
          <p className="text-gray-400 text-xs font-bold uppercase mt-2">Employés absents ce jour</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-purple-500">
          <div className="flex justify-between items-center mb-4">
            <Users className="text-purple-500" size={24} />
            <span className="text-[10px] font-black bg-purple-50 text-purple-600 px-3 py-1 rounded-full uppercase">Effectif</span>
          </div>
          <p className="text-6xl font-black text-gray-900">24</p>
          <p className="text-gray-400 text-xs font-bold uppercase mt-2">Total Collaborateurs</p>
        </div>
      </div>

    </div>
  );
}