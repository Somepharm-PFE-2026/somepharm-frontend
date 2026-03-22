"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DemandeCongePage() {
  const router = useRouter();
  
  // Form State
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [typeConge, setTypeConge] = useState("ANNUEL");
  const [motif, setMotif] = useState("");
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Security Check: Kick out unauthenticated users
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const token = localStorage.getItem("token");

    try {
      // Send the request to your Spring Boot Backend
      const res = await fetch("http://localhost:8080/api/demandes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // The VIP Pass!
        },
        body: JSON.stringify({
          dateDebut,
          dateFin,
          typeConge,
          motif
        }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la soumission de la demande.");
      }

      setSuccess(true);
      // Reset form
      setDateDebut("");
      setDateFin("");
      setMotif("");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-2xl">
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Nouvelle Demande de Congé</h1>
            <p className="text-slate-500">Remplissez le formulaire ci-dessous</p>
          </div>
          <button 
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-white text-slate-600 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Retour au Tableau de Bord
          </button>
        </div>

        {/* The Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">{error}</div>}
          {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">Votre demande a été soumise avec succès !</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date de début</label>
                <input
                  type="date"
                  required
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date de fin</label>
                <input
                  type="date"
                  required
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type de congé</label>
              <select
                value={typeConge}
                onChange={(e) => setTypeConge(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="ANNUEL">Congé Annuel</option>
                <option value="MALADIE">Congé Maladie</option>
                <option value="MATERNITE">Congé Maternité/Paternité</option>
                <option value="SANS_SOLDE">Congé Sans Solde</option>
                <option value="RECUPERATION">Récupération</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Motif (Optionnel)</label>
              <textarea
                rows={4}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Détails supplémentaires..."
                className="w-full rounded-lg border border-slate-300 p-3 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300 transition-all"
            >
              {loading ? "Soumission en cours..." : "Soumettre la demande"}
            </button>
            
          </form>
        </div>
      </div>
    </main>
  );
}