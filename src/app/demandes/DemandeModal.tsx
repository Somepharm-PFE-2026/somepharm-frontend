"use client";
import { useState } from "react";

interface DemandeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

export default function DemandeModal({ isOpen, onClose, onSuccess, token }: DemandeModalProps) {
  const [formData, setFormData] = useState({
    typeConge: "CONGE_ANNUEL",
    dateDebut: "",
    dateFin: "",
    motif: "",
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety check: Don't allow negative time travel
    if (new Date(formData.dateFin) < new Date(formData.dateDebut)) {
      alert("La date de fin ne peut pas être avant la date de début !");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/demandes/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        onClose();
        setFormData({ typeConge: "CONGE_ANNUEL", dateDebut: "", dateFin: "", motif: "" });
      } else {
        const err = await res.text();
        alert(`Erreur: ${err}`);
      }
    } catch (err) {
      console.error("Erreur soumission:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-blue-600 p-8 text-white">
          <h2 className="text-2xl font-black italic uppercase tracking-widest">Nouvelle Demande</h2>
          <p className="text-blue-100 text-xs font-bold mt-1">Remplissez les détails de votre absence</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Type de Congé Dropdown */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nature de l'absence</label>
            <select
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 focus:border-blue-500 outline-none transition-all"
              value={formData.typeConge}
              onChange={(e) => setFormData({ ...formData, typeConge: e.target.value })}
            >
              <option value="CONGE_ANNUEL">🌴 Congé Annuel</option>
              <option value="MALADIE">🩺 Congé Maladie</option>
              <option value="MATERNITE">👶 Congé Maternité / Paternité</option>
              <option value="MARIAGE">💍 Évènement Familial (Mariage)</option>
              <option value="DECES">🕯️ Évènement Familial (Décès)</option>
              <option value="SANS_SOLDE">🚫 Congé Sans Solde</option>
              <option value="RECUPERATION">⏳ Récupération</option>
            </select>
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Du (Inclus)</label>
              <input
                type="date"
                required
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-blue-500"
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Au (Inclus)</label>
              <input
                type="date"
                required
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-bold text-gray-700 outline-none focus:border-blue-500"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
              />
            </div>
          </div>

          {/* Motif Textarea */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Justification / Motif</label>
            <textarea
              placeholder="Expliquez brièvement la raison de votre demande..."
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 font-medium text-gray-700 outline-none focus:border-blue-500 min-h-[100px] resize-none"
              value={formData.motif}
              onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-black text-gray-400 uppercase text-xs hover:bg-gray-100 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] bg-blue-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-xs shadow-lg shadow-blue-200 hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Envoi en cours..." : "Soumettre la demande"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}