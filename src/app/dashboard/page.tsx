"use client";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Users, 
  UserMinus,
  ArrowRight
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    absencesAujourdhui: [],
    alertesUrgentes: [],
    totalEnAttente: 0,
    dateDuJour: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      setUser(decoded);
      fetchDashboardData(token);
    }
  }, []);

  const fetchDashboardData = async (token: string) => {
    try {
      const res = await fetch("http://localhost:8080/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 font-black animate-pulse text-blue-600">CHARGEMENT DU PORTAIL...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-black text-gray-800 italic uppercase tracking-tighter">Tableau de Bord</h1>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Situation Somepharm — {stats.dateDuJour}</p>
      </header>

      {/* 🚨 Section 2: URGENT ALERTS (Priority Logic) */}
      {/* This only shows up if there is a Sickness or Maternity leave today */}
      {stats.alertesUrgentes.length > 0 && (
        <div className="mb-8 animate-in slide-in-from-top duration-500">
          <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] flex items-center gap-6 shadow-sm">
            <div className="bg-red-600 p-4 rounded-2xl text-white shadow-lg shadow-red-100">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h3 className="text-red-900 font-black uppercase text-xs tracking-widest">Alerte Prioritaire : Poste à pourvoir</h3>
              <p className="text-red-600 font-bold text-sm">
                Attention, {stats.alertesUrgentes.length} absence(s) critique(s) (Maladie/Maternité) signalée(s) aujourd'hui.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Pending Requests Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-amber-400">
          <div className="flex justify-between items-center mb-4">
            <Clock className="text-amber-500" size={24} />
            <span className="text-[10px] font-black bg-amber-50 text-amber-600 px-3 py-1 rounded-full uppercase">Action Requise</span>
          </div>
          <p className="text-6xl font-black text-gray-900">{stats.totalEnAttente}</p>
          <p className="text-gray-400 text-xs font-bold uppercase mt-2">Demandes en attente</p>
        </div>

        {/* Total Absences Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-blue-600">
          <div className="flex justify-between items-center mb-4">
            <UserMinus className="text-blue-600" size={24} />
            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase">Hors Poste</span>
          </div>
          <p className="text-6xl font-black text-gray-900">{stats.absencesAujourdhui.length}</p>
          <p className="text-gray-400 text-xs font-bold uppercase mt-2">Employés absents ce jour</p>
        </div>

        {/* Total Staff Card (Placeholder for now) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-b-8 border-purple-500">
          <div className="flex justify-between items-center mb-4">
            <Users className="text-purple-500" size={24} />
            <span className="text-[10px] font-black bg-purple-50 text-purple-600 px-3 py-1 rounded-full uppercase">Effectif</span>
          </div>
          <p className="text-6xl font-black text-gray-900">24</p>
          <p className="text-gray-400 text-xs font-bold uppercase mt-2">Total Collaborateurs</p>
        </div>
      </div>

      {/* 📅 Section 3: ABSENCE CALENDAR (List of people out today) */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Calendar size={20} />
            </div>
            <h2 className="text-xl font-black text-gray-700 italic uppercase">Qui est absent aujourd'hui ?</h2>
          </div>
        </div>

        <div className="p-8">
          {stats.absencesAujourdhui.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.absencesAujourdhui.map((abs: any) => (
                <div key={abs.idRequete} className={`group p-6 rounded-3xl border-2 transition-all hover:border-blue-200 hover:shadow-md ${
                  abs.typeConge === 'MALADIE' ? 'bg-red-50/50 border-red-50' : 'bg-gray-50/50 border-gray-50'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-blue-600 shadow-sm">
                      {abs.demandeurMatricule.substring(0, 2)}
                    </div>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${
                      abs.typeConge === 'MALADIE' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {abs.typeConge}
                    </span>
                  </div>
                  <p className="font-black text-gray-800 uppercase tracking-tight">{abs.demandeurMatricule}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                    Retour prévu le : <span className="text-blue-600">{abs.dateFin}</span>
                  </p>
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                    <span className="text-[9px] font-black text-gray-300 uppercase">Statut: En cours</span>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-gray-300 font-black uppercase tracking-widest italic">Tout le monde est au poste aujourd'hui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}